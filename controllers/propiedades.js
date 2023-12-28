const { matchedData } = require('express-validator');
const {propiedadesModel} = require('../models');
const handleHtttpError = require('../utils/handleError');
const { verificarToken } = require('../utils/handleJWT');

//Crear una propiedad con usuario propietario
const crearPropiedad = async (req, res) =>{
    try {
        req=matchedData(req);
        const propiedadNueva = await propiedadesModel.create(req);
        res.send(propiedadNueva);
        res.status(201);    
    } catch (error) {
        handleHtttpError(res,error);
    }
}
//Crear una propiedad con usuario propietario o admin
const listaPropiedades = async (req,res)=>{
    let lista = {};
    try {
        if(req.usuario.id_rol == "65860823a6118723dcbc0ac3"){
            lista = await propiedadesModel.find({});
        }else{
            lista = await propiedadesModel.find({propietario: req.usuario._id});
        }
        res.send(lista);    
    } catch (error) {
        handleHtttpError(res,"Error al cargar lista de propiedades")
    }
}
//obtener una propiedad con usuario propietario o admin
const obtenerPropiedad = async (req, res) =>{
    try {
        const id = req.params.id;
        const user = req.usuario._id;
        const propiedad = await propiedadesModel.find({_id:id, propietario:user});
        if (!propiedad || propiedad.length === 0) {
            handleHtttpError(res, "La propiedad no existe o no pertenece a este usuario");
        }else{
            res.send(propiedad);    
        }        
    } catch (error) {
        handleHtttpError(res, "Error al conseguir propiedad");
    }
}
//borrar una propiedad con usuario propietario
const borrarPropiedad = async (req, res) =>{
    try {
        const id = req.params.id;
        const user = req.usuario._id;
        const propiedad = await propiedadesModel.find({_id:id, propietario:user});
        if (!propiedad || propiedad.length === 0) {
            handleHtttpError(res, "La propiedad no existe o no pertenece a este usuario");
        }else{
            const propiedadEliminada = await propiedadesModel.deleteOne({_id:id, propietario:user});
            res.send({propiedadEliminada,propiedad});    
        }        
    } catch (error) {
        handleHtttpError(res,"Error al borrar propiedad");
    }
}

module.exports = {crearPropiedad, borrarPropiedad, listaPropiedades, obtenerPropiedad};