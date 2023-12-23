const mongoose = require ('mongoose');
const handleHtttpError = require('../utils/handleError');
const { rolesModel } = require('../models');


const checkRole = (rol) => async (req,res,next) =>{
    try {
        const reqUserRol = req.usuario.id_rol;
        const dbRol = await rolesModel.findById(reqUserRol);
        if(dbRol.rol == rol){
            next();
        }else{
            handleHtttpError(res, "El usuario no tiene permisos");
        }    
    } catch (error) {
        handleHtttpError(res, "Error no identificado con el chequeo de permisos")
    }
}

module.exports = checkRole