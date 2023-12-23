const express = require('express');
const { validarPropiedadNueva, validarPropiedad } = require('../validators/validadorPropiedades');
const {crearPropiedad, borrarPropiedad, listaPropiedades, obtenerPropiedad} = require('../controllers/propiedades');
const authMiddleware = require('../middlewares/authJWT');
const checkRole = require('../middlewares/rol');
const router = express.Router();


//obtener lista de propiedades
router.get('/lista', authMiddleware, checkRole(["propietario","admin"]), listaPropiedades);

//obtener Propiedad
router.get('/:id',authMiddleware, checkRole(["propietario","admin"]), validarPropiedad, obtenerPropiedad);

//crear una propiedad
router.post('/nueva',authMiddleware, checkRole(["propietario"]),validarPropiedadNueva,crearPropiedad);

//borrar una propiedad
router.delete('/:id',authMiddleware, checkRole(["propietario"]), validarPropiedad,borrarPropiedad);


module.exports=router;