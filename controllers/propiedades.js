const { matchedData } = require('express-validator');
const {propiedadesModel, arriendosModel} = require('../models');
const handleHtttpError = require('../utils/handleError');
const { verificarToken } = require('../utils/handleJWT');

//Crear una propiedad con usuario propietario
const crearPropiedad = async (req, res) =>{
    try {
        req=matchedData(req);
        const cuartos = req.cuartos;
        const parqueaderos = req.parqueaderos;
        if(cuartos>=1 && cuartos<=10){
            for (let i=0; i<cuartos; i++){
                //crear arriendo de tipo cuarto en la base de datos
                const arriendoCuarto = await arriendosModel.create({
                    tipo: 'cuarto',
                    precio: 0,
                    arrendatario: undefined,
                    arrendado: false
                });

                //añadir arriendo a la lista de arriendos en la propiedad
                req.ingresos.arriendos.push({
                    tipo: 'cuarto',
                    arriendoId: arriendoCuarto._id
                })
            }
        }else {
            handleHtttpError(res,"numero de cuartos o parqueaderos invalido");
        }        
        if(parqueaderos>=0 && parqueaderos <=10){
            for(let i=0; i<parqueaderos; i++){
                //crear arriendo de tipo parqueadero en la base de datos
                const arriendoParqueadero = await arriendosModel.create({
                    tipo: 'parqueadero',
                    precio: 0,
                    arrendatario: undefined,
                    arrendado: false
                });

                //añadir arriendo a la lista de arriendos en la propiedad
                req.ingresos.arriendos.push({
                    tipo: 'parqueadero',
                    arriendoId: arriendoParqueadero._id
                })
            }
        }else{
            handleHtttpError(res,"numero de cuartos o parqueaderos invalido");
        }
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