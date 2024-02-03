const mongoose = require ('mongoose');
const handleHtttpError = require('../utils/handleError');
const { rolesModel } = require('../models');

/**chequea el rol que tiene el usuario y el array de roles permitidos
 * para la ruta especifica y si lo incluye pasa al siguiente
 */
const checkRole = (roles) => async (req,res,next) =>{
    try {
        const dbRol = req.usuario.id_rol.rol;
        const checkValueRole = roles.includes(dbRol);
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