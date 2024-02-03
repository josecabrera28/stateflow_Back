const mongoose = require ('mongoose');

/*modelo de peticiones con atributos esCuarto, esParqueadero, estado, notas, arriendo y arrendatario 
(referenciando colecciones de usuarios y arriendos)*/
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