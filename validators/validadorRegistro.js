const {check} = require ('express-validator');
const validateResults = require('../utils/handleValidator');


const validadorRegistro =[
    check("nombre").exists().notEmpty().isLength({min:2,max:15}),
    check("apellido").exists().notEmpty().isLength({min:2,max:15}),
    check("edad").exists().notEmpty().isNumeric(),
    check("email").exists().notEmpty().isEmail().isLength({min:2,max:15}),
    check("contraseña").exists().notEmpty(),
    (req,res,next)=>{
        validateResults(req,res,next);
    }
]


module.exports = {validadorRegistro}