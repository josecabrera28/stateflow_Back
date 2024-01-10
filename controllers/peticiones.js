const { matchedData } = require('express-validator');
const { peticionesModel, arriendosModel, rolesModel, propiedadesModel } = require('../models');
const handleHtttpError = require('../utils/handleError');

//valida si ya existe una peticion el mismo arriendo y/o crea una nueva peticion 
const crearPeticion = async (req,res) =>{
    try {
        req = matchedData(req);
        let arriendo = req.arriendo;
        let arrendatario = req.arrendatario;
        let peticionExiste = await peticionesModel.find({arriendo,arrendatario});
        if(peticionExiste.length>=1){
            console.log(peticionExiste);
            handleHtttpError(res,'Ya existe una peticion con el arriendo seleccionado');
            return;
        } 
        arriendo = await arriendosModel.findById(arriendo);
        arriendo = arriendo.tipo;
        switch (arriendo) {
            case "cuarto":
                req.esCuarto = true;
                req.esParqueadero = false;
                break;
            case "parqueadero":
                req.esCuarto = false;
                req.esParqueadero = true;
                break;
            default:
                break;
        }
        const peticion = await peticionesModel.create(req);
        res.status(201); 
        res.send(peticion);
    } catch (error) {
        handleHtttpError(res, "Error al crear peticion");
    }    
}

//obtener una lista de peticiones de un arrendatario o propietario
const listaPeticiones = async(req,res) =>{
    try {
        let usuarioID = req.usuario._id;
        let usuarioRol = await rolesModel.findById(req.usuario.id_rol);
        usuarioRol = usuarioRol.rol;
        let lista= new Array;
        switch (usuarioRol) {
            case 'arrendatario':
                lista = await peticionesModel.find({arrendatario: usuarioID});
                break;
            case 'propietario':
                let propiedades = await  propiedadesModel.find({propietario: usuarioID});
                let arriendos = new Array;
                propiedades.forEach(propiedad => {
                    arriendos.push(propiedad.ingresos.arriendos);
                });
                let auxiliar;
                for(let i=0; i<arriendos.length;i++){
                    for(let j=0; j<arriendos[i].length;j++){
                        auxiliar = await peticionesModel.find({arriendo: arriendos[i][j].arriendoId});
                        if(auxiliar.length>0){
                            lista.push(auxiliar[0]);
                        }
                    }
                }
                break;
            default:
                break;
        }
        res.send(lista);   
    } catch (error) {
        handleHtttpError(res,'Error al obtener lista de peticiones');
    }
}

//confirma o cancela una peticion
const responderPeticion = async(req,res,next) =>{
    try {
        const id = req.params.id;
        const respuesta = req.body.estado;
        if(respuesta!="confirmado" && respuesta!="cancelado" && respuesta!="pendiente"){
            handleHtttpError(res, "respuesta no valida, debe ser confirmado o cancelado");
            return;
        }
        const peticion = await peticionesModel.findById({_id:id});
        if (!peticion || peticion.length === 0) {
            handleHtttpError(res, "La peticion no existe o no pertenece a este usuario");
            return;
        }if(peticion.estado != "pendiente"){
            handleHtttpError(res,"esta peticion ya fue respondida");
            return;
        }
        else{
            const actualizado = await peticionesModel.findByIdAndUpdate(
                id,
                { $set: { estado: respuesta } },
                { new: true }
            );
            req.actualizado = actualizado;
            if(actualizado.estado == 'cancelado'){
                res.send(actualizado);
                return;
            }
            next();
        }                     
    } catch (error) {
        console.log(error);
        handleHtttpError(res, error);
    }
}

module.exports = {crearPeticion, listaPeticiones, responderPeticion}