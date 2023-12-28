const mongoose = require ('mongoose');
const handleHtttpError = require('../utils/handleError');
const { rolesModel } = require('../models');


const checkRole = (roles) => async (req,res,next) =>{
    try {
        const reqUserRol = req.usuario.id_rol;
        const dbRol = await rolesModel.findById(reqUserRol);
        const checkValueRole = roles.some((rolSingle) => dbRol.rol.includes(rolSingle));
        if(checkValueRole){
            next();
        }else{
            handleHtttpError(res, "El usuario no tiene permisos");
        }    
    } catch (error) {
        handleHtttpError(res, "Error no identificado con el chequeo de permisos")
    }
}

module.exports = checkRole