
import express from 'express'
import bodyParser from 'body-parser'
import * as db from './index.js'
const app = express()
const port = 3000

app.use(bodyParser.json())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


app.get('/test', async (req, res) =>{
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

app.post('/login', (req, res) => {
  const data = req.body
  if (data.password === '123123') {
    res.status(200).send(data)
  }else{
    res.status(401).send("PASSWORD NOT CORRECT")
  }
})

app.post('/register', (req, res) => {
  const data = req.body
  if (data.email === '') {
    res.status(401).send("WRONG")
  }else{
    res.status(200).send("OK")
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
