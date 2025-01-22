import express from "express";
import pg from "pg";
import crypto from "crypto";
import Ajv from "ajv";

const app = express();
const port = 8000;
const ajv = new Ajv()

// podpora pre json
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// pripojenie databazy
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "TWA-cestovka",
    password: "Matus2matiscak2",
    port: 5432,
  });
db.connect();

// Test
app.get("/", async (req, res) => {
    const result = await db.query("SELECT * FROM zajazd");
    console.log(result.rows)
    res.send("Nigga its uploaded")
});

// GET id letisk by kod letiska
app.get("/destinacia/letiskoid", async (req, res) => {
  const kod = req.body.kod
  try {
    const result = await db.query("SELECT nazvy_letisk.id FROM nazvy_letisk WHERE $1 = nazvy_letisk.kod", [kod]);
    res.send(result.rows[0])
  } catch (err) {
    console.log(err)
  }
});

// GET letiska
app.get("/destinacia/lestiska", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM nazvy_letisk");
    res.send(result.rows)
  } catch (err) {
    console.log(err)
  }
});

// FILTER destinacie by letisko id
app.get("/destinacia/filterByLetisko", async (req, res) => {
  const idLetisko = req.body.letiskoId
  try {
    const result = await db.query("SELECT * FROM zajazd WHERE $1 = zajazd.idNazvuLetiskaNastup", [idLetisko]);
    res.send(result.rows);
  } catch (err) {
    console.log(err)
  }
})

// CREATE destinaciu
app.post("/destinacia/create", async (req, res) => {
    const body = req.body;

    const schema = {
        type: "object",
        properties: {
          nazovdestinacie: {type: "string"},
          popis: {type: "string"},
          cena: {type: "number"},
          datumzaciatku: {type: "string"},
          datumkonca: {type: "string"},
          idnazvuletiskanastup: {type: "number"},
          idnazvuletiskadestinacia: {type: "number"},
        },
        required: ["nazovdestinacie", "cena", "datumzaciatku", "datumkonca", "idnazvuletiskanastup", "idnazvuletiskadestinacia"],
        additionalProperties: false
    }
    const validate = ajv.compile(schema)
    const valid = validate(body)

    if (!valid) {
        res.status(400).json({
            code: "Invalid data",
            message: "Input data are invalid",
            errors: validate.errors
        })
        return;
    }
    try {
      await db.query(
        "INSERT INTO zajazd (nazovDestinacie, popis, cena, datumZaciatku, datumKonca, idNazvuLetiskaNastup, idNazvuLetiskaDestinacia) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [body.nazovdestinacie, body.popis, body.cena, body.datumzaciatku, body.datumkonca, body.idnazvuletiskanastup, body.idnazvuletiskadestinacia]
      );
      res.send(body)
    } catch (err) {
      console.log(err)
    }
})

// UPDATE destinaciu
app.post("/destinacia/update", async (req, res) => {
  const body = req.body;
  try {
    await db.query("UPDATE zajazd SET nazovdestinacie = $1, popis = $2, cena = $3, datumzaciatku = $4, datumkonca = $5, idnazvuletiskanastup = $6, idnazvuletiskadestinacia = $7 WHERE id = $8;", [body.nazovdestinacie, body.popis, body.cena, body.datumzaciatku, body.datumkonca, body.idnazvuletiskanastup, body.idnazvuletiskadestinacia, body.id]);
    res.send(`Updated destination with id: ${body.id}`)
  } catch (err) {
    console.log(err)
  }
})

// DELETE destinaciu
app.post("/destinacia/delete", async (req, res) => {
  const id = req.body.id;
  try {
    await db.query("DELETE FROM zajazd WHERE id = $1;", [id]);
    res.send(`Deleted destination with id: ${id}`)
  } catch (err) {
    console.log(err)
  }
})

// zapnutie servera
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
