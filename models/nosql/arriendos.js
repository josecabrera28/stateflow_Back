const mongoose = require('mongoose');

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