const { check } = require ('express-validator');
const validateResults = require('../utils/handleValidator')

const validarPeticionNueva = [
    check("esCuarto").exists(),
    check("esParqueadero").exists(),
    check("arriendo").exists().notEmpty().isMongoId(),
    check("arrendatario").exists().notEmpty().isMongoId(),
    check("estado").exists().notEmpty(),
    check("notas").exists(),
    (req,res,next)=>{
        validateResults(req,res,next);
    }
]

module.exports = {validarPeticionNueva}