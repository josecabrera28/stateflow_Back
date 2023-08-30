const {arrendatariosModel} = require('../models');

/**
 * create async functions to make a http request with GET method and retrieve all arrendatarios from DB
 */
const getarrendatarios = async (req, res) =>{
    try {
        const listArrendatarios = await arrendatariosModel.find();
        res.send(listArrendatarios);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {getarrendatarios}