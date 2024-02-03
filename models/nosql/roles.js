const mongoose = require('mongoose');

/**modelo de roles con atributo rol
 */
const RolesScheme = mongoose.Schema({
    rol: String,
})

module.exports= mongoose.model("roles",RolesScheme);