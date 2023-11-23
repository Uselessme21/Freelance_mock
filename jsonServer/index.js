const jsonServer = require("json-server"); 
const server = jsonServer.create();
const cors = require('cors');
require("dotenv").config();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 3001;
server.use(cors())

server.use( middlewares);
server.use( router);

server.listen(port,()=>{
    console.log("listening on port", port)
});