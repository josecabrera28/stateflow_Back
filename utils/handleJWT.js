const jwt = require('jsonwebtoken');
const handleHtttpError = require('./handleError');
const JWT_SECRET = process.env.JWT_SECRET;

//crea el token al iniciar sesion un usuario
const firmarToken = async (usuario) =>{
    const firma = await jwt.sign(
        {
            _id: usuario._id,
            rol: usuario.id_rol.rol
        },
        JWT_SECRET,
        {
            expiresIn: "2h"
        }
    );

    return firma;
}
//valida que el token enviado en la solicitud sea valido
const verificarToken = async (jwtToken)=>{
    try {
        const esValido = await jwt.verify(jwtToken,JWT_SECRET);
        return esValido;        
    } catch (error) {
        return null;
    }
}

module.exports={firmarToken, verificarToken}