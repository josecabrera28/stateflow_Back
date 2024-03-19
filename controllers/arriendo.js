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
        const propiedad = await propiedadesModel.findOne({_id:id, propietario:user});
        if (!propiedad || propiedad.length === 0) {
            handleHtttpError(res, "La propiedad no existe o no pertenece a este usuario");
        }else{
            let nuevoArriendo;
            for(let i=0; i<propiedad.ingresos.arriendos.length; i++){
                if(propiedad.ingresos.arriendos[i].arriendoId==arriendo){
                    nuevoArriendo = await arriendosModel.findByIdAndUpdate(
                        arriendo,
                        { $set: { precio: nuevoPrecio } },
                        { new: true }
                    );
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
                        { $set: { arrendado: false }, $unset: { arrendatario: 1 } },
                        { new: true }
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
/**valida que 
 */
const adicionararrendatario = async(req,res,next)=>{
    try {
        const arriendo = req.params.arriendoId;
        const id = req.params.idPropiedad;
        const user = req.usuario._id;
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
                    const arriendoActualizado = await arriendosModel.findByIdAndUpdate(
                        arriendo,
                        { $set: { arrendado: true, arrendatario: infoUsuario} },
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
module.exports = {darPrecio, removerarrendatario, adicionararrendatario}