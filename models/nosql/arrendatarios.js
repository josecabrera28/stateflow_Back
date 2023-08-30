const mongoose = require('mongoose');

//creates mongo scheme with .Schema function
const arrendatariosScheme = mongoose.Schema(
    {
        nombre: String,
        apellido: String,
        edad: Number,
        cedula: Number,
        celular: Number,
        email: String,
        ocupacion: String,
        contrato: Boolean,
        duracion: Number,
        canon: Number,
        fechaInicio: Date,
        fechaFin: Date,
    },
    {
        timestamps: true,   //TODO createAt, updateAt
        versionKey: false,
    }
);

//export mongo scheme and coleccion name
module.exports = mongoose.model("arrendatarios",arrendatariosScheme);