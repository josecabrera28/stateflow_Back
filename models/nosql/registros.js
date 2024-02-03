const mongoose = require('mongoose');

/*modelo de registros con atributos año, mes, servicios y credito*/
const registrosScheme = mongoose.Schema({
    año: Number,
    mes: Number,
    servicios: {
        energia: Number,
        gas: Number,
        agua: Number,
        internet: Number,
        administracion: Number
    },
    credito: {
        esCredito: Boolean,
        monto: Number,
        plazo: Number,
        tasa: Number,
        cuota: Number
    }
});

module.exports = mongoose.model('registros',registrosScheme);