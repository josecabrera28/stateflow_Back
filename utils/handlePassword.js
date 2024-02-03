const bcrypt = require('bcryptjs');
//encripta contraseña plana con hash para el registro de los usuarios
const encrypt = async (passwordPlain)=>{
    const hash = await bcrypt.hash(passwordPlain,10);
    return hash;
}
//compara el contraseña plana contra la contraseña encriptada y devuelve un true o false
const compare = (passwordPlain, passwordHash)=>{
    return bcrypt.compare(passwordPlain,passwordHash);
}

module.exports = {encrypt, compare}