const { matchedData } = require('express-validator');
const {propiedadesModel} = require('../models');
const handleHtttpError = require('../utils/handleError');
const { verificarToken } = require('../utils/handleJWT');

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

const listaPropiedades = async (req,res)=>{
    try {
        const usuarioAutorizado = await verificarToken (req.body.token);
        if(usuarioAutorizado){
            const lista = await propiedadesModel.find({});
            res.send(lista);    
        }else{
            handleHtttpError(res,"El usuario no tiene permisos");
        }
    } catch (error) {
        handleHtttpError(res,"Error al cargar lista de propiedades")
    }
}

const obtenerPropiedad = async (req, res) =>{
    try {
        const usuarioAutorizado = await verificarToken (req.body.token);
        if(usuarioAutorizado){
            req = matchedData(req);
            const {id} = req;
            const data = await propiedadesModel.find({_id:id});
            res.send(data);    
        }else{
            handleHtttpError(res,"El usuario no tiene permisos");
        }
    } catch (error) {
        handleHtttpError(res,"Error al obtener propiedad");
    }
}

const borrarPropiedad = async (req, res) =>{
    try {
        const usuarioAutorizado = await verificarToken (req.body.token);
        if(usuarioAutorizado){
            req = matchedData(req);
            const {id} = req;
            const data = await propiedadesModel.findByIdAndDelete({_id:id});
            res.send(data);    
        }else{
            handleHtttpError(res,"El usuario no tiene permisos");
        }
    } catch (error) {
        handleHtttpError(res,"Error al borrar propiedad");
    }
}

module.exports = {crearPropiedad, borrarPropiedad, listaPropiedades, obtenerPropiedad};