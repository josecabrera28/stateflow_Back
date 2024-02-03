const mongoose = require('mongoose');

//modelo de arriendos con atributos tipo, precio, arrendado y arrendatario (referenciando coleccion de usuarios)
const arriendosScheme = mongoose.Schema({
    tipo: String,
    precio: Number,
    arrendatario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "usuarios"
    },
    arrendado: Boolean,
})

module.exports = mongoose.model("arriendos",arriendosScheme);