const { arriendosModel, propiedadesModel } = require('../models');
const handleHtttpError = require('../utils/handleError');

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
                handleHtttpError(res, "La propiedad no existe o no pertenece a este usuario");
            }
        }        
    } catch (error) {
        console.log(error);
        handleHtttpError(res, "Error al conseguir propiedad");
    }

}

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
                handleHtttpError(res, "La propiedad no existe o no pertenece a este usuario");
            }
        }        
    } catch (error) {
        console.log(error);
        handleHtttpError(res, "Error al conseguir propiedad");
    }
}
module.exports = {darPrecio, removerarrendatario}