const express = require('express');
const { validarPropiedadNueva } = require('../validators/validadorPropiedades');
const {crearPropiedad, borrarPropiedad, listaPropiedades, obtenerPropiedad, nuevoGasto, listaGastosAño, listaGastosMes} = require('../controllers/propiedades');
const authMiddleware = require('../middlewares/authJWT');
const checkRole = require('../middlewares/rol');
const { darPrecio, removerarrendatario } = require('../controllers/arriendo');
const { validadorGasto } = require('../validators/validadorGasto');
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

//ingresar gastos de una propiedad
router.post('/:id/nuevogasto',authMiddleware, checkRole(["propietario"]),validadorGasto,nuevoGasto);

//lista de gastos por año
router.get('/listagastos/:idpropiedad/:periodo',authMiddleware, checkRole(["propietario"]),listaGastosAño);

//lista de gastos por mes
router.get('/gastosmes/:idpropiedad/:periodo/:mes',authMiddleware, checkRole(["propietario"]),listaGastosMes);

module.exports=router;