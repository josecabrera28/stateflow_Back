const mongoose = require('mongoose');

const propiedadesScheme = mongoose.Schema(
    {
    tipo: String, //casa o apartamento
    ubicacion: String,
    m2: Number,
    cuartos: Number, //numero de cuartos
    parqueaderos: Number, //numero de parqueaderos
    propietario: 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'usuarios' // Referencia al modelo de usuarios
    },
    gastos:
    {
        servicios:
        {
            energia: Number,
            gas: Number,
            agua: Number,
            internet: Number,
            administracion: Number,
        },
        credito: 
        {
            esCredito: Boolean,
            monto: Number,
            plazo: Number,
            tasa: Number,
            cuota: Number
        },
    },
    ingresos:
    {
        arriendos:[]  //debera ser alimentado con la informacion de cada arrendatario luego de crear la propiedad
    }
    },
    {
        timestamps: true,
        versionkey: false
    }
);

module.exports = mongoose.model("propiedades",propiedadesScheme);