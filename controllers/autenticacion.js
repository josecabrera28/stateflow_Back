const {usuariosModel} = require('../models');
const handleHtttpError = require('../utils/handleError');
const { matchedData } = require('express-validator');
const { encrypt, compare } = require('../utils/handlePassword');
const { firmarToken } = require('../utils/handleJWT');

const controllerRegistro = async (req,res) => {
    try {
        req = matchedData(req);
        const esUsuario = await usuariosModel.findOne({email: req.email});
        if(esUsuario){
            res.status(401);
            res.send({message: "Ya tienes una cuenta registrada con este correo electronico. Inicia sesion o cambia de contraseña"});
        }else{
            const contraseñaEnc = await encrypt (req.contraseña);
            req.contraseña=contraseñaEnc;
            const infoUsuario = await usuariosModel.create(req);
            infoUsuario.set("contraseña", undefined, {strict:false});
            
            //firmar JWT Token 
            const dataUsuario ={
                token: await firmarToken(infoUsuario),
                usuario: infoUsuario
            }
            res.status(201);
            res.send(dataUsuario);            
        }
    } catch (error) {
        handleHtttpError(res, error);
    }
}

const controllerLogin = async (req,res) =>{
    try {
        req = matchedData(req);
        const infoUsuario = await usuariosModel.findOne({email:req.email});
        
        if(infoUsuario==null){
            res.send({message:"No existe una cuenta con este correo electronico"});
            res.status(401);
        }else{
            const contraseñaOk = await compare(req.contraseña,infoUsuario.contraseña);
            if(contraseñaOk){
                infoUsuario.set("contraseña", undefined, {strict:false});

                //firmar JWT Token
                const dataUsuario ={
                    token: await firmarToken(infoUsuario),
                    usuario: infoUsuario
                }
                res.send(dataUsuario);
                res.status(201);
            }else{
                res.send({message:"Contraseña o email incorrecto"});
                res.status(401);
            }
        } 
    } catch (error) {
        handleHtttpError(res,error);
    }
}

module.exports= {controllerRegistro, controllerLogin}