import express from "express";
import pg from "pg";
import crypto from "crypto";
import Ajv from "ajv";

const app = express();
const port = 8000;

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

app.get("/", async (req, res) => {
    const result = await db.query("SELECT * FROM zajazd");
    console.log(result.rows)
    res.send("Nigga its uploaded")
});

// zapnutie servera
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
   });
