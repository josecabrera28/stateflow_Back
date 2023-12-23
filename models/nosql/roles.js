const mongoose = require('mongoose');

const RolesScheme = mongoose.Schema({
    rol: String,
})

module.exports= mongoose.model("roles",RolesScheme);