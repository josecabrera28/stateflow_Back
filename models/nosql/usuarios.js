const mongoose = require('mongoose');

/**modelo de usuarios con atributos id_rol(referenciando la collecion de roles), nombre, apellido, edad,
 *  email y contraseña*/
const usuariosScheme = mongoose.Schema(
    {
    id_rol: {type: mongoose.Schema.Types.ObjectId, ref:'roles'},
    nombre: String,
    apellido: String,
    edad: Number,
    email: String,
    contraseña: String,
    },
    {
        timestamps: true,   //TODO createAt, updateAt
        versionkey: false
    }
);

//export usuarios scheme
module.exports = mongoose.model("usuarios",usuariosScheme,);