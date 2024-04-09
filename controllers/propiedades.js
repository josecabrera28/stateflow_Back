const { matchedData } = require('express-validator');
const {propiedadesModel, arriendosModel, registrosModel, usuariosModel, } = require('../models');
const handleHtttpError = require('../utils/handleError');
const { listFiles, downloadFile, deleteFile } = require('../utils/awsHandler');

//Crear una propiedad con usuario propietario
const crearPropiedad = async (req, res) =>{
    try {        
        const usuarioMiddleware = req.usuario._id;
        req=matchedData(req);
        req.propietario = usuarioMiddleware;
        const cuartos = req.cuartos;
        const parqueaderos = req.parqueaderos;
        if(req.tipo != 'casa' && req.tipo != 'apartamento'){
            handleHtttpError(res, 'El campo tipo de propiedad debe ser casa o apartamento en minusculas');
            return;
        }
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
            handleHtttpError(res,"numero de cuartos o parqueaderos fuera de rango [1-10]");
            return;
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
        console.log(error);
        handleHtttpError(res,"Error al crear la propiedad");
    }
}
//Lista las propiedades de un usuario propietario o admin
const listaPropiedades = async (req,res)=>{
    let lista = {};
    try {
        if(req.usuario.id_rol.rol == "admin"){
            lista = await propiedadesModel.find({});
        }else{
            lista = await propiedadesModel.find({propietario: req.usuario._id})
            .populate({
                path: 'ingresos.arriendos.arriendoId',
                model: 'arriendos',
                select: 'precio arrendado arrendatario',
                populate: {
                    path: 'arrendatario',
                    model: 'usuarios',
                    select: 'nombre apellido edad'
                }
            })
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
        const propiedad = await propiedadesModel.findOne({_id:id, propietario:user});
        if (!propiedad) {
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
        //id de la propiedad lo obtiene por la url en su parametro id
        const id = req.params.id;
        const user = req.usuario._id;
        let arriendoEliminado;
        let nombreCompleto;
        /**valida que la propiedad a eliminar sea del usuario
         * que esta haciendo la solicitud
         */
        const propiedad = await propiedadesModel.findOne({_id:id, propietario:user});
        if (!propiedad) {
            handleHtttpError(res, "La propiedad no existe o no pertenece a este usuario");
        }else{
            //eliminar referencias de arriendos
            for(let i=0; i<propiedad.ingresos.arriendos.length; i++){
                arriendoEliminado = await arriendosModel.findByIdAndDelete(propiedad.ingresos.arriendos[i].arriendoId);
                if(arriendoEliminado.arrendatario){
                    nombreCompleto = await usuariosModel.findByIdAndDelete(arriendoEliminado.arrendatario);
                    nombreCompleto = nombreCompleto.nombre + '_' + nombreCompleto.apellido;
                    await deleteFile(id,arriendoEliminado._id.toString(),nombreCompleto);
                }
            }
            //eliiminar referencias de registros
            for(let i=0; i<propiedad.gastos.length; i++){
                for(let j=0; j<propiedad.gastos[i].registros.length;j++){
                    await registrosModel.deleteOne({_id: propiedad.gastos[i].registros[j]});
                }
            }
            //eliminar propiedad
            const propiedadEliminada = await propiedadesModel.deleteOne({_id:id, propietario:user});
            res.send({propiedadEliminada,propiedad});    
        }        
    } catch (error) {
        console.log(error);
        handleHtttpError(res,"Error al borrar propiedad");
    }
}
//ingresar un nuevo gasto con usuario propietario
const nuevoGasto = async (req,res) =>{
    try {
        const id = req.params.id;
        const user = req.usuario._id;
        const gastos = matchedData(req);
        /**valida que la propiedad a crear el nuevo gasto sea del usuario
         * que esta haciendo la solicitud
         */
        const propiedad = await propiedadesModel.findOne({_id:id, propietario:user})
        .populate(
            {
                path: 'gastos.registros',
                model: 'registros',
            }
        );
        
        if (!propiedad) {
            handleHtttpError(res, "La propiedad no existe o no pertenece a este usuario");
            return;
        }

        /**valida que el no exista un gasto en la propiedad para el año
         * y mes de la solicitud, en caso de ya existir alguno, responde
         * con una error informando que ya existe un gasto y/o solicitando
         * que elimine el actual en caso de querer actualizarlo 
         */
        const existingExpense = propiedad.gastos.some(
            (gasto) => gasto.año === gastos.año && gasto.registros.some((registro) => registro.mes === gastos.mes)
        );
        
        if (existingExpense) {
            handleHtttpError(res, `Ya existe un registro de gastos para el año ${gastos.año} y mes ${gastos.mes}` +
                `. Si deseas actualizar dicho registro, debes primero eliminar el gasto actual y luego crear el nuevo gasto`);
            return;
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
        handleHtttpError(res, "Error al ingresar gasto");
    }
}
//obtener gastos de una propiedad de un mes de un año 
const listaGastosMes = async (req, res) => {
    try {
        const id = req.params.idpropiedad;
        const año = parseInt(req.params.periodo);
        const mes = parseInt(req.params.mes);
        const user = req.usuario._id;
        /**valida que la propiedad refernte a los gastos a listar
         * sea del usuario que esta haciendo la solicitud
         */
        const propiedad = await propiedadesModel.findOne({_id:id, propietario:user})
        .populate({
            path: 'gastos.registros',
            model: 'registros',
        });
        if (!propiedad) {
            handleHtttpError(res, "La propiedad no existe o no pertenece a este usuario");
            return;
        }
        /**busca el gasto del mes especificado recorriendo el objeto
         * del año
         *  */
        for(let i=0; i<propiedad.gastos.length; i++){
            if(propiedad.gastos[i].año == año){
                for(let j=0; j<propiedad.gastos[i].registros.length;j++){
                    if(propiedad.gastos[i].registros[j].mes == mes){
                        res.send(propiedad.gastos[i].registros[j]);
                        return;
                    }
                }
            }
        }
        handleHtttpError(res, `No se tienen registros del año ${año} y/o mes ${mes}`);
    } catch (error) {
        console.log(error);
        handleHtttpError(res, "Error al conseguir gastos del año");
    }
}
//obtener gastos de una propiedad de un año
const listaGastosAño = async (req, res) => {
    try {
        const id = req.params.idpropiedad;
        const año = parseInt(req.params.periodo);
        const user = req.usuario._id;
        /**valida que la propiedad referente a los gastos a listar
         * sea del usuario que esta haciendo la solicitud
         */
        const propiedad = await propiedadesModel.findOne({_id:id, propietario:user})
        .populate({
            path: 'gastos.registros',
            model: 'registros',
        });
        if (!propiedad) {
            handleHtttpError(res, "La propiedad no existe o no pertenece a este usuario");
            return;
        }
        /**busca el año solicitado y traer todo el objeto con los gastos
         * del todo el año
        */
        for(let i=0; i<propiedad.gastos.length; i++){
            if(propiedad.gastos[i].año == año){
                res.send(propiedad.gastos[i]);
                return;
            }
        }
        handleHtttpError(res, `Error al conseguir gastos del año ${año}`);
    } catch (error) {
        console.log(error);
        handleHtttpError(res, "Error al conseguir gastos por año");
    }
}
//eliminar un gasto de una propiedad de un mes especifico como propietario
const elimiarGasto = async (req, res) => {
    try {
        const id = req.params.idpropiedad;
        const año = parseInt(req.params.periodo);
        const mes = parseInt(req.params.mes);
        const user = req.usuario._id;
        const propiedad = await propiedadesModel.findOne({_id:id, propietario:user})
        .populate({
            path: 'gastos.registros',
            model: 'registros',
        });
        if (!propiedad) {
            handleHtttpError(res, "La propiedad no existe o no pertenece a este usuario");
            return;
        }
        for(let i=0; i<propiedad.gastos.length; i++){
            if(propiedad.gastos[i].año == año){
                for(let j=0; j<propiedad.gastos[i].registros.length;j++){
                    if(propiedad.gastos[i].registros[j].mes == mes){
                        const registroId = propiedad.gastos[i].registros[j]._id;
                        const propiedadActualizada = await propiedadesModel.updateOne(
                            { _id: propiedad._id },
                            { $pull: { [`gastos.${i}.registros`]: registroId } },
                            { new: true }
                        );
                        const registroEliminado = await registrosModel.findByIdAndDelete(registroId);
                        res.send({registroEliminado, propiedadActualizada});
                        return;
                    }
                }
            }
        }
        handleHtttpError(res, `No se tienen registros del año ${año} y/o mes ${mes}`);
    } catch (error) {
        console.log(error);
        handleHtttpError(res, "Error al conseguir gastos del año");
    }
}
//Lista las contratos de una propiedad de propietario
const listaContratos = async (req,res)=>{
    try {
        const propiedad = req.params.idpropiedad;
        const data = await listFiles(propiedad);
        
        res.send(data);    
    } catch (error) {
        handleHtttpError(res,"Error al listar contratos de S3")
    }
}
//Lista las contratos de una propiedad de propietario
const descargarContrato = async (req,res)=>{
    try {
        const propiedad = req.params.idpropiedad;
        const arriendo = req.params.idarriendo;
        const arrendatario = req.params.arrendatario;
        const data = await downloadFile(propiedad, arriendo, arrendatario);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=contrato.pdf');
        res.send(data);    
    } catch (error) {
        handleHtttpError(res,"Error al descargar contrato de S3")
    }
}

module.exports = {
    crearPropiedad,
    borrarPropiedad,
    listaPropiedades,
    obtenerPropiedad,
    nuevoGasto,
    listaGastosMes,
    listaGastosAño,
    elimiarGasto,
    listaContratos,
    descargarContrato
};