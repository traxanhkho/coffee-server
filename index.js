const config = require("config");
const express = require("express");
require("dotenv").config();

const app = express();

if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERRO: jwtPrivateKey is not defined.");
  process.exit(1);
}

//test key ssh on ubuntu

require("./firebase/admin");
require("./startup/routers")(app);
require("./startup/db")();

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening on port ${port}...`));

