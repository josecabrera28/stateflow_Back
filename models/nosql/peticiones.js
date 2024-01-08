const mongoose = require ('mongoose');

const peticionesScheme = mongoose.Schema(
    {
        esCuarto: Boolean,
        esParqueadero: Boolean,
        arriendo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'arriendos'
        },
        arrendatario:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'usuarios'
        },
        estado: String,
        notas: String
    },
    {
        timestamps: true,
        versionkey: false
    }
)

module.exports=mongoose.model('peticiones',peticionesScheme);