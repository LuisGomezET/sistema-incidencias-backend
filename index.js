require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// ... rutas aquí (igual que antes)

app.listen(process.env.PORT, () => {
  console.log(`🚀 API corriendo en http://localhost:${process.env.PORT}`);
});
