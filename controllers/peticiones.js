const { matchedData } = require('express-validator');
const { peticionesModel, arriendosModel, rolesModel, propiedadesModel } = require('../models');
const handleHtttpError = require('../utils/handleError');

//valida si ya existe una peticion el mismo arriendo y/o crea una nueva peticion 
const crearPeticion = async (req,res) =>{
    try {
        //valida que el cuerpo de la peticion concuerde con el modelo y descarta cualquier otra informacion innecesaria
        const arrendatario = req.usuario._id;
        req = matchedData(req);
        req.arrendatario = arrendatario;
        let arriendo = req.arriendo;
        /**valida que el estado de la peticion solo sea pendiente */
        if(req.estado != 'pendiente'){
            handleHtttpError(res,'Para solicitar un arriendo el estado debe ser pendiente');
            return;
        }
        /**busca en la bd si existe alguna otra peticion que concuerde con el arriendo, arrendatario y estado "pendiente"
         * enviado en la peticion
         * */
        let peticionExiste = await peticionesModel.find({arriendo,arrendatario, estado: 'pendiente'});
        /**en caso de encontrar almenos 1 peticion que concuerde responde con una alerta ya que nodeberia existir mas de una peticion
         * por usuario solicitante de un arriendo
        */
        if(peticionExiste.length>=1){
            handleHtttpError(res,'Ya existe una peticion con el arriendo seleccionado');
            return;
        } 
        //en caso de no encontrar ningun documento que concuerde busca el arriendo solicitado con el id
        arriendo = await arriendosModel.findById(arriendo);
        if(!arriendo){
            handleHtttpError(res,'No existe el arriendo seleccionado');
            return;
        }
        arriendo = arriendo.tipo;
        //define propiedades esCuarto y esParqueadero dependiendo si el arriendo obtenido es un cuarto o un parqueadero
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
        //crea una documento peticion con la informacion procesada a lo largo de la funcion
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
        //obtiene el id del usuario de la peticion para discriminar si es propietario o arrendatario
        const usuarioID = req.usuario._id;
        const usuarioRol = req.usuario.id_rol.rol;
        let lista= new Array;
        //caminos dependiendo de su rol si es propietario o arrendatario
        switch (usuarioRol) {
            case 'arrendatario':
                //busca peticiones con el arrendatario 
                lista = await peticionesModel.find({arrendatario: usuarioID});
                break;
            case 'propietario':
                //llama a todas las propiedades del usuario
                let propiedades = await  propiedadesModel.find({propietario: usuarioID});
                //una lista con todos los arriendos de todas la propiedades del usuario
                let arriendos = new Array;
                propiedades.forEach(propiedad => {
                    arriendos.push(propiedad.ingresos.arriendos);
                });
                let auxiliar;
                for(let i=0; i<arriendos.length;i++){
                    for(let j=0; j<arriendos[i].length;j++){
                        /**llama a las peticiones existentes en cada arriendo
                         * y si encuentra al menos una las agrega a la lista
                        */
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
        console.log(error);
        handleHtttpError(res,'Error al obtener lista de peticiones');
    }
}

//confirma o cancela una peticion
const responderPeticion = async(req,res,next) =>{
    try {
        const id = req.params.id;
        const respuesta = req.body.estado;
        //valida que la respuesta a la peticion solo tenga los valores validos
        if(respuesta!="confirmado" && respuesta!="cancelado" && respuesta!="pendiente"){
            handleHtttpError(res, "respuesta no valida, debe ser confirmado o cancelado");
            return;
        }
        //llama la peticion a responder
        const peticion = await peticionesModel.findById({_id:id});
        if (!peticion || peticion.length === 0) {
            handleHtttpError(res, "La peticion no existe");
            return;
        /**si la peticion esta confimado o cancelado quiere decir que ya ha
         * sido respondida*/ 
        }
        if(peticion.estado != "pendiente"){
            handleHtttpError(res,"esta peticion ya fue respondida");
            return;
        }
        let esMiPropiedad = false;
        const propiedadesPropias = await propiedadesModel.find({propietario: req.usuario._id});
        for (let index = 0; index < propiedadesPropias.length; index++) {
            for (let j = 0; j < propiedadesPropias[index].ingresos.arriendos.length; j++) {
                if(propiedadesPropias[index].ingresos.arriendos[j].arriendoId.equals(peticion.arriendo)){
                    esMiPropiedad = true;
                }
            }
        }
        if(esMiPropiedad){
            /**actualiza el estado de la peticion con confirmado o cancelado
             * segun sea la decision del propietario
            */
            const peticionActualizada = await peticionesModel.findByIdAndUpdate(
                id,
                { $set: { estado: respuesta } },
                { new: true }
            );
            req.actualizado = peticionActualizada;
            /**si el propietario responde la peticion cancelandola
             * se responde con la informacion actualizada de la petcion*/
            if(peticionActualizada.estado == 'cancelado'){
                res.send(peticionActualizada);
                return;
            }
            /**si el propietario respónde con confirmado igualmente 
             * actualiza la peticion y sigue al siguiente en la ruta
             */
            const arriendoActualizado = await arriendosModel.findByIdAndUpdate(
                peticion.arriendo,
                { $set: { arrendado: true, arrendatario: peticion.arrendatario} },
                { new: true }
            );
            next();
        }else{
            handleHtttpError(res, 'El arriendo no existe o no pertenece a este usuario');
        }          
    } catch (error) {
        console.log(error);
        handleHtttpError(res, 'Error al reponder peticion');
    }
}

module.exports = {crearPeticion, listaPeticiones, responderPeticion}