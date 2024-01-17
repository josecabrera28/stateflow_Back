const express = require('express');
const { validarPropiedadNueva } = require('../validators/validadorPropiedades');
const {crearPropiedad, borrarPropiedad, listaPropiedades, obtenerPropiedad} = require('../controllers/propiedades');
const authMiddleware = require('../middlewares/authJWT');
const checkRole = require('../middlewares/rol');
const { darPrecio, removerarrendatario } = require('../controllers/arriendo');
const router = express.Router();


//obtener lista de propiedades
router.get('/lista', authMiddleware, checkRole(["propietario","admin"]), listaPropiedades);

//obtener Propiedad
router.get('/:id',authMiddleware, checkRole(["propietario","admin"]), obtenerPropiedad);

//crear una propiedad
router.post('/nueva',authMiddleware, checkRole(["propietario"]),validarPropiedadNueva,crearPropiedad);

//borrar una propiedad
router.delete('/:id',authMiddleware, checkRole(["propietario"]),borrarPropiedad);

//actualizar precio de un arriendo
router.put('/precio/:idPropiedad/:arriendoId',authMiddleware, checkRole(["propietario"]), darPrecio);

//remover arrendatario de un arriendo
router.put('/removerarrendatario/:idPropiedad/:arriendoId',authMiddleware, checkRole(["propietario"]), removerarrendatario);

module.exports=router;