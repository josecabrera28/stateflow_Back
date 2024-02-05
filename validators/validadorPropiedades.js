const {check} = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validarPropiedadNueva = [
    check("tipo").exists().notEmpty().isString(),
    check("ubicacion").exists().notEmpty().isString(),
    check("m2").exists().notEmpty().isNumeric(),
    check("cuartos").exists().notEmpty().isNumeric(),
    check("parqueaderos").exists().notEmpty().isNumeric(),
    check("gastos").exists(),
    check("ingresos.arriendos").exists(),
    (req,res,next)=>{
        validateResults(req,res,next);
    }
]


module.exports = {validarPropiedadNueva}