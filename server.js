import mongoose from 'mongoose';
import express from 'express'
import bodyParser from 'body-parser'
import * as db from './index.js'
import { User } from './Models/User.js';
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import { Game } from './Models/Game.js';
const mongodbRoute = process.env.MONGOURL
const client = new MongoClient(mongodbRoute, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }

});
const myDB = client.db(process.env.PGDATABASE);
const gamesCollection = myDB.collection(process.env.MONGOGAMESCOLLECTION);
const usersCollection = myDB.collection(process.env.MONGOUSERSCOLLECTION);
const app = express()
const port = process.env.PORT || 3000
const mongodb_port = process.env.PORT_MONGO|| 4000;

async function start() {
  try {

    await client.connect(mongodbRoute);
    app.listen(mongodb_port, () => {
      console.log(`Api is running on port ${mongodb_port}`);
    })
    console.log(`Conexion con la base de datos Mongo Correcta`)

  }
  catch (error) {
    console.log(`Error al conectar con la base de datos: ${error.message}`);
  }
}


start();

// const user1 = new User
// ({name:"Unai",
//   avatar:"ninguno",
//   games:[]})

// const user2 = new User
// ({name:"Arian",
//   avatar:"ninguno",
//   games:[]})

// const game1 = new Game
// ({players: [{id: user1._id,
//               meleeHits:25,
//               rangedHits:30,
//               damageDone:100,
//               damageReceived:98},

//             {id: user2._id,
//               meleeHits:12,
//               rangedHits:65,
//               damageDone:98,
//               damageReceived:100}],
//                }); 
// user1.games.push(game1._id) 
// user2.games.push(game1._id) 

// console.log("ID Player1 en la partida: " + game1.players[0].id,"|||  ID Player1: " + user1._id);
// console.log("ID Player2 en la partida: " + game1.players[1].id,"|||  ID Player2: " +  user2._id);
// console.log("ID de partida en Player1: " + user1.games[0]._id);
// console.log("ID de partida en Player2: " + user2.games[0]._id);
// console.log("ID de partida:            " + game1._id);

app.use(bodyParser.json())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


app.get('/test', async (req, res) => {
  const query = `SELECT card.*,(
	
    SELECT json_agg(json_build_object('attribute_id', attribute.attribute_id, 
                                      'attribute_name', attribute.name, 
                                      'attribute_value', card_attribute.value))

FROM card_attribute
    JOIN attribute on card_attribute.attribute_id = attribute.attribute_id
    WHERE card.card_id = card_attribute.card_id
) AS attributes,

(

    SELECT json_agg(json_build_object('common_effect_id', common_effect.common_effect_id,
                                      'attribute_id', attribute.attribute_id, 
                                      'common_effect_description', common_effect.description, 
                                      'common_effect_deskripzioa', common_effect.deskripzioa, 
                                      'common_effect_attribute', attribute.name, 
                                      'common_effect_value', common_effect.value))

    FROM card_common_effect
    JOIN common_effect ON card_common_effect.common_effect_id = common_effect.common_effect_id
    JOIN attribute ON common_effect.attribute_id = attribute.attribute_id
    WHERE card.card_id = card_common_effect.card_id
) AS common_effect

FROM card
ORDER by card_id;`
  const result = await db.query(query)
  res.send(result.rows)
})

app.get('/', (req, res) => {
  res.send("hello world");
})

app.post('/login', async (req, res) => {
  const data = req.body

  const query = `SELECT * FROM users
                WHERE email = '${data.email}'
                AND password = '${data.password}';`


  const query2 = `SELECT username, mongo_id FROM users
                  WHERE email not in ('${data.email}')
                  ORDER BY username ASC;`

  const result = await db.query(query)
  const result2 = await db.query(query2)
  let opponentsArray = result2.rows

  for (let i = 0; i < result2.rows.length; i++) {
    const element = result2.rows[i].username;
    const enemy = result2.rows[i].mongo_id;
    opponentsArray.push[element, enemy];
  }
  const resultToSend = { id: result.rows[0].id, email: result.rows[0].email, username: result.rows[0].username, opponents: opponentsArray, mongo_id: result.rows[0].mongo_id }

  if (result.rows.username != '') {
    res.status(200).send(resultToSend)
  } else {
    res.status(401).send("CREDENTIALS NOT CORRECT")
  }
})

app.post('/register', async (req, res) => {

  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  const query = `insert into users (email, password, username) values ('${email}', '${password}', '${username}');`;

  if (email === '' || password === '' || username === '') {

    res.status(401).send("WRONG");

  } else {
    const comprobationQuery = `SELECT * FROM users WHERE email = '${email}';`;

    const result = await db.query(comprobationQuery);
    if (result.rows.length > 0) {

      res.status(401).send("YA HAY UN USUARIO CON ESE EMAIL");

    } else {

      db.query(query);
      res.status(200).send("OK");

    }

  }
})

app.post('/newGame', async (req, res) => {
  const players = req.body.players;

  const player1Id = players[0].id;
  const player2Id = players[1].id;

  const player1 = await usersCollection.findOne({ _id: new ObjectId(player1Id) });
  const player2 = await usersCollection.findOne({ _id: new ObjectId(player2Id) });

  if (!player1) {
    console.log("Jugador 1 no encontrado");
    return res.status(404).send("Jugador 1 no encontrado");
  } else if (!player2) {
    console.log("Jugador 2 no encontrado");
    return res.status(404).send("Jugador 2 no encontrado");
  }

  const game = new Game({
    players: [
      {
        player_id: player1Id,
        meleeHits: players[0].meleeHits,
        rangedHits: players[0].rangedHits,
        damageDone: players[0].damageDone,
        damageReceived: players[0].damageReceived
      },
      {
        player_id: player2Id,
        meleeHits: players[1].meleeHits,
        rangedHits: players[1].rangedHits,
        damageDone: players[1].damageDone,
        damageReceived: players[1].damageReceived
      }
    ],
    winner: req.body.winner
  });

  await gamesCollection.insertOne(game);

  await usersCollection.updateOne({ _id: new ObjectId(player1Id) }, { $push: { games: game._id } });
  await usersCollection.updateOne({ _id: new ObjectId(player2Id) }, { $push: { games: game._id } });

  res.status(200).send("Data Correctly Saved in Database.");
});

app.get('/getStatsData', async (req, res) => {
  const mongo_id = req.body.mongo_id;

  const results = await gamesCollection.aggregate([
    { 
      "$match": {
        "players.player_id": mongo_id
      }
    }
  ]).toArray();
    
  res.send(results).status(200);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});