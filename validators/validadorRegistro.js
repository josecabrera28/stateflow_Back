const {check} = require ('express-validator');
const validateResults = require('../utils/handleValidator');


const validadorRegistro =[
    check("id_rol").exists().notEmpty(),
    check("nombre").exists().notEmpty().isLength({min:2,max:20}),
    check("apellido").exists().notEmpty().isLength({min:2,max:20}),
    check("edad").exists().notEmpty().isNumeric(),
    check("email").exists().notEmpty().isEmail().isLowercase().isLength({min:10,max:30}),
    check("contraseña").exists().notEmpty().isLength({min:10,max:20}),
    (req,res,next)=>{
        validateResults(req,res,next);
    }
]


module.exports = {validadorRegistro}