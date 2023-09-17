const {check} =require('express-validator');
const validateResults = require('../utils/handleValidator');

const validadorLogin = [
    check("email").exists().isEmail().notEmpty().isLength({min:3,max:99}),
    check("contraseña").exists().notEmpty(),
    (req,res,next)=>{
        validateResults(req,res,next); 
    }
]

module.exports = {validadorLogin}