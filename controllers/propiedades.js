const { matchedData } = require('express-validator');
const {propiedadesModel, arriendosModel, registrosModel, } = require('../models');
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
//ingresar un nuevo gasto con usuario propietario
const nuevoGasto = async (req,res) =>{
    try {
        const id = req.params.id;
        const user = req.usuario._id;
        const gastos = matchedData(req);
        const propiedad = await propiedadesModel.findOne({_id:id, propietario:user});
        
        if (!propiedad) {
            handleHtttpError(res, "La propiedad no existe o no pertenece a este usuario");
        }
        //crear nuevo gasto
        const nuevoGasto = await registrosModel.create(gastos);
        //ingresar nuevo gasto si no hay ningun gasto
        if(propiedad.gastos.length==0){
            const propiedadActualizada = await propiedadesModel.findByIdAndUpdate(
                id,
                {
                    $set: {gastos: [
                            {
                                año: gastos.año,
                                registros: [nuevoGasto],
                            },
                        ]}
                },
                { new: true, select: { _id: 0 }  }
            ).populate({
                path: 'gastos.registros',
                model: 'registros', 
                select: '-_id', 
            });;

            res.send(propiedadActualizada);
        }else{
            // Busca un año existente en los gastos
            let propiedadActualizada;
            // Busca un año existente en los gastos
            const añoExistenteIndex = propiedad.gastos.findIndex(gasto => gasto.año === gastos.año);

            if (añoExistenteIndex !== -1) {
                // Si el año existe, agrega el nuevo gasto al año existente
                propiedad.gastos[añoExistenteIndex].registros.push(nuevoGasto);
            } else {
                // Si el año no existe, agrega un nuevo objeto de gastos con el nuevo año y gasto
                propiedad.gastos.push({ año: gastos.año, registros: [nuevoGasto] });
            }
                    // Actualiza la propiedad con los nuevos gastos
            propiedadActualizada = await propiedadesModel.findByIdAndUpdate(
                id,
                { $set: { gastos: propiedad.gastos } },
                { new: true, select: { _id: 0 } }
            ).populate({
                path: 'gastos.registros',
                model: 'registros', 
                select: '-_id', 
            });

            res.send(propiedadActualizada);
        }
    } catch (error) {
        console.log(error);
        handleHtttpError(res, "Error al ingresar gasto");
    }
}
module.exports = {crearPropiedad, borrarPropiedad, listaPropiedades, obtenerPropiedad, nuevoGasto};