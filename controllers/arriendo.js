const { arriendosModel, propiedadesModel, rolesModel, usuariosModel } = require('../models');
const handleHtttpError = require('../utils/handleError');
const { encrypt } = require('../utils/handlePassword');
/**valida que la propiedad a la que pertenece el arriendo que busca 
 * cambiar el precio sea del usuario que hace la consulta; busca el
 * arriendo al cual le quiere cambiar el precio y actualiza el valor
 * de esta propiedad
 */
const darPrecio = async (req,res) =>{
    try {
        const nuevoPrecio = req.body.precio;
        const arriendo = req.params.arriendoId;
        const id = req.params.idPropiedad;
        const user = req.usuario._id;
        const propiedad = await propiedadesModel.findOne({_id:id, propietario:user})
        .populate(
            {
                path: 'ingresos.arriendos.arriendoId',
                model: 'arriendos'
            }
        );
        if (!propiedad || propiedad.length === 0) {
            handleHtttpError(res, "La propiedad no existe o no pertenece a este usuario");
        }else{
            let nuevoArriendo;
            for(let i=0; i<propiedad.ingresos.arriendos.length; i++){
                if(propiedad.ingresos.arriendos[i].arriendoId._id == arriendo
                    && propiedad.ingresos.arriendos[i].arriendoId.arrendado == true){                    
                    // Primero, actualiza el campo 'historialPrecios.$[elem].fechaFin'
                    nuevoArriendo = await arriendosModel.findByIdAndUpdate(
                        arriendo,
                        {
                            $set: { "historialPrecios.$[elem].fechaFin": new Date() }
                        },
                        {
                            arrayFilters: [{ "elem.fechaFin": { $exists: false } }], 
                        }
                    );
                    /**actualiza el historialPrecios poniendo fechaFin con el precio anterior
                     */
                    let fechaMesProx = new Date();
                    fechaMesProx.setMonth(fechaMesProx.getMonth() + 1);
                    fechaMesProx.setDate(1);
                    // A continuación, agrega un nuevo objeto al array 'historialPrecios'
                    nuevoArriendo = await arriendosModel.findByIdAndUpdate(
                        arriendo,
                        {
                            $set: { precio: nuevoPrecio },
                            $push: { 
                                historialPrecios: {
                                    precioHistorico: nuevoPrecio, 
                                    fechaInicio: fechaMesProx
                                }
                            }
                        },
                        { new: true }
                    );
                    res.send(nuevoArriendo);
                    return;
                }
                else if(propiedad.ingresos.arriendos[i].arriendoId._id == arriendo
                    && propiedad.ingresos.arriendos[i].arriendoId.arrendado == false ){
                    nuevoArriendo = await arriendosModel.findByIdAndUpdate(
                        arriendo,
                        { $set: { precio: nuevoPrecio } },
                        { new: true }
                    );                    
                    res.send(nuevoArriendo);
                    return;
                }
            }if(nuevoArriendo==undefined){
                handleHtttpError(res, "El arriendo no existe o no pertenece a este usuario");
            }
        }        
    } catch (error) {
        console.log(error);
        handleHtttpError(res, "Error al conseguir propiedad");
    }
}

/**valida que la propiedad a la que pertenece el arrrendatario que busca 
 * remover sea del usuario que hace la consulta; busca el
 * arriendo que contiene dicho arrendatario y actualiza el valor
 * del atributo arrendado a falso y remueve el campo arrendatario del 
 * arriendo en mencion
 */
const removerarrendatario = async(req,res)=>{
    try {
        const arriendo = req.params.arriendoId;
        const id = req.params.idPropiedad;
        const user = req.usuario._id;
        const propiedad = await propiedadesModel.findOne({_id:id, propietario:user});
        if (!propiedad || propiedad.length === 0) {
            handleHtttpError(res, "La propiedad no existe o no pertenece a este usuario");
        }else{
            let nuevoArriendo;
            for(let i=0; i<propiedad.ingresos.arriendos.length; i++){
                if(propiedad.ingresos.arriendos[i].arriendoId==arriendo){
                    let arrendatarioId = await arriendosModel.findById(arriendo);
                    arrendatarioId = arrendatarioId.arrendatario;
                    nuevoArriendo = await arriendosModel.findByIdAndUpdate(
                        arriendo,
                        {
                        $unset: { arrendatario: 1 },
                        $set: { "historialPrecios.$[elem].fechaFin": new Date() }
                        },
                        { 
                            arrayFilters: [{ "elem.fechaFin": { $exists: false } }] // Filtro para actualizar solo si fechaFin no existe
                        }
                    );
                    nuevoArriendo = await arriendosModel.findByIdAndUpdate(
                        arriendo,
                        { $set: { arrendado: false }},
                        { 
                            new: true,
                        }
                    );
                    usuarioRemovido = await usuariosModel.findByIdAndDelete(arrendatarioId);
                    res.send(nuevoArriendo);
                }
            }if(nuevoArriendo==undefined){
                handleHtttpError(res, "El arriendo no existe o no pertenece a este usuario");
            }
        }        
    } catch (error) {
        console.log(error);
        handleHtttpError(res, "Error al conseguir propiedad");
    }
}
/**valida que la propiedad exista y pertenezca al propietario
 * tambien valida que el arriendo no este arrendado
 * valida el email del arrendatario con regex 
 */
const adicionararrendatario = async(req,res,next)=>{
    try {
        const arriendo = req.params.arriendoId;
        const id = req.params.idPropiedad;
        const user = req.usuario._id;
        let precioActual;
        let copiaHistorialPrecios;
        const propiedad = await propiedadesModel.findOne({_id:id, propietario:user});
        if (!req.actualizado) {
            // Si no está definido, inicialízalo como un objeto vacío
            req.actualizado = {};
        }
        if (!propiedad || propiedad.length === 0) {
            handleHtttpError(res, "La propiedad no existe o no pertenece a este usuario");
        }else{
            let esMiPropiedad = false;
            const propiedadesPropias = await propiedadesModel.find({propietario: user});
            for (let index = 0; index < propiedadesPropias.length; index++) {
                for (let j = 0; j < propiedadesPropias[index].ingresos.arriendos.length; j++) {
                    if(propiedadesPropias[index].ingresos.arriendos[j].arriendoId.equals(arriendo)){
                        esMiPropiedad = true;
                        const esarrendado = await arriendosModel.findOne({_id:arriendo});
                        if(esarrendado.arrendado){
                            handleHtttpError(res, `El ${esarrendado.tipo} ya esta arrendado`);
                            return;
                        }
                        precioActual = esarrendado.precio;
                        esarrendado.historialPrecios ? copiaHistorialPrecios = esarrendado.historialPrecios : copiaHistorialPrecios = undefined;
                        esarrendado.tipo == 'cuarto' ? req.actualizado.esCuarto = true : req.actualizado.esCuarto = false ;
                        esarrendado.tipo == 'parqueadero' ? req.actualizado.esParqueadero = true : req.actualizado.esParqueadero = false;
                    }
                }
            }
            if(esMiPropiedad){
                /**busca el rol id del rol requerido y lo actualiza en el request y luego deja unicamente lo que hace match con
                * el validador del registro*/ 
                let nuevoArrendatario = req.body;
                nuevoArrendatario.contraseña = '1234567890';
                let desiredrol = nuevoArrendatario.id_rol;
                if(desiredrol != 'arrendatario'){
                    handleHtttpError(res,'Campo rol debe ser arrendatario');
                    return;
                }
                desiredrol = await rolesModel.findOne({rol: desiredrol});
                nuevoArrendatario.id_rol = desiredrol._id;
                // Validación del formato del correo electrónico
                const emailRegex = /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/;
                if (!emailRegex.test(nuevoArrendatario.email)) {
                    handleHtttpError(res, 'El formato del correo electrónico no es válido.');
                    return;
                }
                /**busca en la base de datos si ya existe un usuario con el mismo email para responder con una mensaje de que
                 * el email ya existe y debe registrarse con otro*/ 
                const esUsuario = await usuariosModel.findOne({email: nuevoArrendatario.email});
                if(esUsuario){
                    res.status(401);
                    res.send({message: "Ya existe una cuenta registrada con el correo del arrendatario."});
                }else{
                    //encripta la contraseña con bcrypt
                    const contraseñaEnc = await encrypt (nuevoArrendatario.contraseña);
                    nuevoArrendatario.contraseña=contraseñaEnc;
                    //crea un documento en la base de datos de usuarios
                    const infoUsuario = await usuariosModel.create(nuevoArrendatario);
                    //cambia el valor del atributo contraseña a undefined para cuando se envie la respuesta no se incluya dicha contraseña
                    infoUsuario.set("contraseña", undefined, {strict:false});
                    /**si el propietario respónde con confirmado igualmente 
                     * actualiza la peticion y sigue al siguiente en la ruta
                     */
                    /**actualiza el historialPrecios del arriendo con el precio actual del
                     * arriendo y la fecha en que se realiza el contrato de arrendamiento
                     */
                    const arriendoActualizado = await arriendosModel.findByIdAndUpdate(
                        arriendo,
                        { $set: { arrendado: true, arrendatario: infoUsuario},
                        $push: { 
                            historialPrecios: {
                                precioHistorico: precioActual, 
                                fechaInicio: new Date(),
                            }
                        }
                        },
                        { new: true }
                    );
                    req.actualizado.arrendatario = infoUsuario._id;
                    req.actualizado.arriendo = req.params.arriendoId;
                    next();            
                }
            }else{
                handleHtttpError(res, 'El arriendo no existe o no pertenece a este usuario');
            }          
        }        
    } catch (error) {
        console.log(error);
        handleHtttpError(res, "Error al conseguir propiedad");
    }
}

const listarIngresos = async (req,res)=>{
    const id = req.params.idpropiedad;
    const user = req.usuario._id;
    const periodo = Number.parseInt(req.params.periodo);
    let ingresos = {'1':0, '2':0, '3':0, '4':0, '5':0, '6':0, '7':0, '8':0, '9':0, '10':0, '11':0, '12':0};
    const propiedad = await propiedadesModel.findOne({_id:id, propietario:user})
    .populate(
        {
            path: 'ingresos.arriendos.arriendoId',
            model: 'arriendos'
        }
    );
    if (!propiedad || propiedad.length === 0) {
        handleHtttpError(res, "La propiedad no existe o no pertenece a este usuario");
    }else{
        let fecha0;
        let fecha1;
        let ano0;
        let ano1;
        let mes0;
        let mes1;
        const arriendos = propiedad.ingresos.arriendos;
        for (let index = 0; index < arriendos.length; index++) {
            for (let x = 0; x < arriendos[index].arriendoId.historialPrecios.length; x++) {
                fecha0 = arriendos[index].arriendoId.historialPrecios[x].fechaInicio;
                fecha1 = arriendos[index].arriendoId.historialPrecios[x].fechaFin;
                if (fecha1 !== undefined) {
                    ano1 = fecha1.getFullYear();
                    mes1 = fecha1.getMonth() + 1;
                }else {
                    // Si fecha1 es undefined, asigna la fecha actual
                    fecha1 = new Date();
                    ano1 = fecha1.getFullYear();
                    mes1 = fecha1.getMonth() + 1;
                }
                ano0 = fecha0.getFullYear();
                mes0 = fecha0.getMonth() + 1;
                if(ano0 == periodo && ano1 == periodo){
                    do{
                        ingresos[mes0] += arriendos[index].arriendoId.historialPrecios[x].precioHistorico;
                        mes0++;
                    }while(mes0 <= mes1);
                }else if(ano0 != periodo && ano1 == periodo){
                    let counter =1;
                    do{
                        ingresos[counter] += arriendos[index].arriendoId.historialPrecios[x].precioHistorico;
                        counter++;
                    }while(counter <= mes1);
                }else if(ano0 == periodo && ano1 != periodo){
                    do{
                        ingresos[mes0] += arriendos[index].arriendoId.historialPrecios[x].precioHistorico;
                        mes0++;
                    }while(mes0 <= 12);
                }
            }
        }
        //const historialIngresos = propiedad.ingresos.arriendoId.historialPrecios;
        res.send(ingresos);
    }
}
module.exports = {darPrecio, removerarrendatario, adicionararrendatario, listarIngresos}