const { usuariosModel } = require('../models');
const handleHtttpError = require('../utils/handleError');
const {verificarToken} = require ('../utils/handleJWT');

const authMiddleware = async (req, res, next) => {
    try {
        if(!req.headers.authorization){
            handleHtttpError(res,"Token de sesion requerido");
        }    
        const session = await verificarToken(req.headers.authorization.split(" ").pop());
        if(session){
            const dataUsuario = await usuariosModel.findById(session._id);
            req.usuario=dataUsuario;
            next();
        }else{
            handleHtttpError(res, "Error de Token")
        }
    } catch (error) {
        handleHtttpError(res, "Error no identificado en la autenticacion");
    }
}

module.exports = authMiddleware;