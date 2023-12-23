const {check} = require ('express-validator');
const validateResults = require('../utils/handleValidator');


const validadorRegistro =[
    check("id_rol").exists().notEmpty(),
    check("nombre").exists().notEmpty().isLength({min:2,max:15}),
    check("apellido").exists().notEmpty().isLength({min:2,max:15}),
    check("edad").exists().notEmpty().isNumeric(),
    check("email").exists().notEmpty().isEmail().isLength({min:2,max:30}),
    check("contraseña").exists().notEmpty(),
    (req,res,next)=>{
        validateResults(req,res,next);
    }
]


module.exports = {validadorRegistro}