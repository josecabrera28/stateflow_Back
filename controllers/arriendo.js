const { arriendosModel, propiedadesModel } = require('../models');
const handleHtttpError = require('../utils/handleError');
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
                    nuevoArriendo = await arriendosModel.findByIdAndUpdate(
                        arriendo,
                        { $set: { arrendado: false }, $unset: { arrendatario: 1 } },
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
module.exports = {darPrecio, removerarrendatario}