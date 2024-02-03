const mongoose = require('mongoose');

/*modelo de propiedades con atributos tipo, ubicacion, m2, cuartos, parqueaderos,
 propietario, gastos, e ingresos (referenciando colecciones de usuarios, registros y arriendos)*/
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
    gastos:[
        {
            año: {type: Number, unique: true},
            registros: [{
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'registros' 
            }], 
        }
    ],
    ingresos:
    {
        arriendos:[
            {
                tipo: String, // cuarto o parqueadero
                arriendoId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'arriendos', // Referencia al modelo de arriendos
                },
            }
        ]  
    }
    },
    {
        timestamps: true,
        versionkey: false
    }
);

module.exports = mongoose.model("propiedades",propiedadesScheme);