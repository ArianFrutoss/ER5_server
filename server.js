import express from 'express'
import bodyParser from 'body-parser'
import * as db from './index.js'
const app = express()
const port = process.env.PORT || 3000

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

app.post('/users', async (req, res) => {
   const data = req.body
  console.log(data);
  const query = `SELECT username FROM users
                 WHERE email not in ('${data.email}');`

  const result = await db.query(query)

  if (result.rows.username != '') {
    res.status(200).send(result.rows)
  } else {
    res.status(401).send("connection error")
  }
})

app.post('/login', async (req, res) => {
  const data = req.body

  const query = `SELECT * FROM users
                WHERE email = '${data.email}'
                AND password = '${data.password}';`

  const result = await db.query(query)
  const resultToSend = {id: result.rows[0].id, email: result.rows[0].email, username: result.rows[0].username}
  
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


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})