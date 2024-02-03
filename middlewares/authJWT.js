const { usuariosModel } = require('../models');
const handleHtttpError = require('../utils/handleError');
const {verificarToken} = require ('../utils/handleJWT');

/**chequea que tenga un token y que sea valido */
const authMiddleware = async (req, res, next) => {
    try {
        if(!req.headers.authorization){
            handleHtttpError(res,"Token de sesion requerido");
        }    
        const session = await verificarToken(req.headers.authorization.split(" ").pop());
        if(session){
            const dataUsuario = await usuariosModel.findById(session._id)
            .populate(
                {
                    path: 'id_rol',
                    model: 'roles',
                    select: 'rol -_id'
                }
            );
            dataUsuario.contraseña = undefined;
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