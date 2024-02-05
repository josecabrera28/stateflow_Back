const {check} =require('express-validator');
const validateResults = require('../utils/handleValidator');

const validadorLogin = [
    check("email").exists().isEmail().notEmpty().isLowercase().isLength({min:10,max:30}),
    check("contraseña").exists().notEmpty().isLength({min:10,max:20}),
    (req,res,next)=>{
        validateResults(req,res,next); 
    }
]

module.exports = {validadorLogin}