const express = require('express');
const { validarPropiedadNueva, validarPropiedad } = require('../validators/validadorPropiedades');
const {crearPropiedad, borrarPropiedad, listaPropiedades, obtenerPropiedad} = require('../controllers/propiedades');
const router = express.Router();


//obtener lista de propiedades
router.get('/lista',listaPropiedades);

//obtener Propiedad
router.get('/:id',validarPropiedad, obtenerPropiedad);

//crear una propiedad
router.post('/nueva',validarPropiedadNueva,crearPropiedad);

//borrar una propiedad
router.delete('/:id',validarPropiedad,borrarPropiedad);


module.exports=router;