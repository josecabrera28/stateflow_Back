const {check} = require ('express-validator');
const validateResults = require('../utils/handleValidator');


const validadorGasto =[
    check("año").exists().notEmpty().isInt({ min: 2000 }),
    check("mes").exists().notEmpty().isInt({ min: 1, max: 12 }),
    check("servicios").exists().notEmpty(),
    check("credito").exists(),
    (req,res,next)=>{
        validateResults(req,res,next);
    }
]


module.exports = {validadorGasto}