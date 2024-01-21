const {check} = require ('express-validator');
const validateResults = require('../utils/handleValidator');


const validadorGasto =[
    check("año").exists().notEmpty().isNumeric(),
    check("mes").exists().notEmpty().isNumeric(),
    check("servicios").exists().notEmpty(),
    check("credito").exists(),
    (req,res,next)=>{
        validateResults(req,res,next);
    }
]


module.exports = {validadorGasto}