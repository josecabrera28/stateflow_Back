const {usuariosModel, rolesModel} = require('../models');
const handleHtttpError = require('../utils/handleError');
const { matchedData } = require('express-validator');
const { encrypt, compare } = require('../utils/handlePassword');
const { firmarToken } = require('../utils/handleJWT');

/**funciona asincrona para registrar un usuario propietario o arrendatario */
const controllerRegistro = async (req,res) => {
    try {
        /**busca el rol id del rol requerido y lo actualiza en el request y luego deja unicamente lo que hace match con
         * el validador del registro*/ 
        let desiredrol = req.body.id_rol;
        desiredrol = await rolesModel.findOne({rol: desiredrol});
        req = matchedData(req);
        req.id_rol = desiredrol._id;
        /**busca en la base de datos si ya existe un usuario con el mismo email para responder con una mensaje de que
         * el email ya existe y debe registrarse con otro*/ 
        const esUsuario = await usuariosModel.findOne({email: req.email});
        if(esUsuario){
            res.status(401);
            res.send({message: "Ya tienes una cuenta registrada con este correo electronico. Inicia sesion o cambia de contraseña"});
        }else{
            //encripta la contraseña con bcrypt
            const contraseñaEnc = await encrypt (req.contraseña);
            req.contraseña=contraseñaEnc;
            //crea un documento en la base de datos de usuarios
            const infoUsuario = await usuariosModel.create(req);
            //cambia el valor del atributo contraseña a undefined para cuando se envie la respuesta no se incluya dicha contraseña
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
//funcion asincrona para login y validar la contraseña plana contra la encriptada sea la misma
const controllerLogin = async (req,res) =>{
    try {
        req = matchedData(req);
        //busca si existe algun usuario con el mismo email usado para loguearse
        const infoUsuario = await usuariosModel.findOne({email:req.email});
        //caso en que no encuentre ningun usuario con el email enviado
        if(infoUsuario==null){
            res.send({message:"No existe una cuenta con este correo electronico"});
            res.status(401);
        }else{
            //compara la contraseña plana contra la contraseña encriptada del usuario obtenido en linea 48
            const contraseñaOk = await compare(req.contraseña,infoUsuario.contraseña);
            //caso en que la contraseña sea la misma que la que se encuentra en la base de datos desencriptada
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