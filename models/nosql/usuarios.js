const mongoose = require('mongoose');

//create usuarios scheme
const usuariosScheme = mongoose.Schema(
    {
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
module.exports = mongoose.model("usuarios",usuariosScheme);