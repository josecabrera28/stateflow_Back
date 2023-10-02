const {check} = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validarPropiedadNueva = [
    check("tipo").exists().notEmpty(),
    check("ubicacion").exists().notEmpty(),
    check("m2").exists().notEmpty().isNumeric(),
    check("cuartos").exists().notEmpty().isNumeric(),
    check("parqueaderos").exists().notEmpty().isNumeric(),
    check("propietario").exists().notEmpty(),
    check("gastos.servicios.energia").exists().notEmpty().isInt(),
    check("gastos.servicios.gas").exists().notEmpty().isInt(),
    check("gastos.servicios.agua").exists().notEmpty().isInt(),
    check("gastos.servicios.internet").exists().notEmpty().isInt(),
    check("gastos.servicios.administracion").exists().notEmpty().isInt(),
    check("gastos.credito.esCredito").exists().notEmpty().isBoolean(),
    check("gastos.credito.monto").exists().notEmpty().isNumeric(),
    check("gastos.credito.plazo").exists().notEmpty().isNumeric(),
    check("gastos.credito.tasa").exists().notEmpty().isNumeric(),
    check("gastos.credito.cuota").exists().notEmpty().isNumeric(),
    (req,res,next)=>{
        validateResults(req,res,next);
    }
]

const validarPropiedad = [
    check("id").exists().notEmpty().isMongoId(),
    (req,res,next)=>{
        validateResults(req,res,next);
    }
]
module.exports = {validarPropiedadNueva, validarPropiedad}