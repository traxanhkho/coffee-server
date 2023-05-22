const express = require("express");

const app = express();

require("./firebase/admin");
require('./startup/routers')(app) ; 
require('./startup/db')() ; 

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening on port ${port}...`));