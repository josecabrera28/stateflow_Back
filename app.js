//import .env variables configuration
require("dotenv").config();
//import other libraries
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./routes');
const { rolesModel, usuariosModel } = require("./models");
const { encrypt } = require("./utils/handlePassword");

//creates a Router
const router = express.Router();
//create an express application
const app = express();

//use cors to listen from localhost
app.use(cors());
app.use(express.json());
app.use(router);

app.use(express.static('stateflow-front'));
//call root route http//localhost:2000/api
app.use("/api",routes);

//create a port for the app to listen
const port = process.env.PORT? process.env.PORT : 2001;
//entorno en el cual se esta ejecutando la app
const NODE_ENV = process.env.NODE_ENV || 'development';

if(NODE_ENV !== 'test'){
    //servidor escuchando
    app.listen(port,()=>{
    console.log("Servidor corriendo y escuchando por el puerto "+port);
    });
}

const DB_URI = (NODE_ENV === 'test')? process.env.URI_TEST : process.env.URI;
//funcion asincrona para la conexion a la base de datos ya que es un recurso externo
async function mongoConnection (){
    try {
        //conexion
        await mongoose.connect(DB_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        //creacion de roles
        let roles = await rolesModel.find({});
        if (!roles.some((rol) => rol.rol === 'propietario')) {
            console.log('Creando rol "propietario"');
            const nuevoRolPropietario = await rolesModel.create({ rol: 'propietario' });
            roles.push(nuevoRolPropietario);
        }
    
        if (!roles.some((rol) => rol.rol === 'arrendatario')) {
            console.log('Creando rol "arrendatario"');
            const nuevoRolArrendatario = await rolesModel.create({ rol: 'arrendatario' });
            roles.push(nuevoRolArrendatario);
        }
    
        if (!roles.some((rol) => rol.rol === 'admin')) {
            passEncrypted = await encrypt(process.env.ADMIN_PASSWORD);
            const nuevoRolAdmin = await rolesModel.create({ rol: 'admin' });
            let admin = await usuariosModel.create(
                {
                    id_rol: nuevoRolAdmin._id,
                    nombre: 'Jose',
                    apellido: 'Cabrera',
                    edad: 30,
                    email: 'cabrerajosemiguel28@gmail.com',
                    contraseña: passEncrypted,
                }
            );
            roles.push(nuevoRolAdmin);
        }     
    } catch (error) {
        console.log(error);
    }    
}

mongoConnection();
module.exports = app;