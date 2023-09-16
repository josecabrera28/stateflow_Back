//import .env variables configuration
require("dotenv").config();
//import other libraries
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const router = express.Router();
const routes = require('./routes');
//create an express application
const app = express();

//use cors to listen from localhost
app.use(cors());
app.use(express.json());
app.use(router);

//call root route http//localhost:2000/api
app.use("/api",routes);

//create a port for the app to listen
const port = process.env.PORT? process.env.PORT : 2001;

//servidor escuchando
app.listen(port,()=>{
    console.log("Servidor corriendo y escuchando por el puerto "+port);
});

//funcion asincrona para la conexion a la base de datos ya que es un recurso externo
async function mongoConnection (){
    try {
        await mongoose.connect(process.env.URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }); 
        console.log("Conexion a Base de datos exitoso");       
    } catch (error) {
        console.log(error);
    }    
}

mongoConnection();
