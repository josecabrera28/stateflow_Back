const bcrypt = require('bcryptjs');

const encrypt = async (passwordPlain)=>{
    const hash = await bcrypt.hash(passwordPlain,10);
    return hash;
}

const compare = (passwordPlain, passwordHash)=>{
    return bcrypt.compare(passwordPlain,passwordHash);
}

module.exports = {encrypt, compare}