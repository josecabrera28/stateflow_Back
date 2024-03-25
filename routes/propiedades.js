const express = require('express');
const { validarPropiedadNueva } = require('../validators/validadorPropiedades');
const {crearPropiedad, borrarPropiedad, listaPropiedades, obtenerPropiedad, nuevoGasto, listaGastosAño, listaGastosMes, elimiarGasto, listaContratos, descargarContrato} = require('../controllers/propiedades');
const authMiddleware = require('../middlewares/authJWT');
const checkRole = require('../middlewares/rol');
const { darPrecio, removerarrendatario, adicionararrendatario } = require('../controllers/arriendo');
const { validadorGasto } = require('../validators/validadorGasto');
const { generate } = require('../utils/generatePdf');
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

//adicionar arrendatario a un arriendo
router.put('/adicionararrendatario/:idPropiedad/:arriendoId',authMiddleware, checkRole(["propietario"]), adicionararrendatario,generate);

//remover arrendatario de un arriendo
router.put('/removerarrendatario/:idPropiedad/:arriendoId',authMiddleware, checkRole(["propietario"]), removerarrendatario);

//ingresar gastos de una propiedad
router.post('/:id/nuevogasto',authMiddleware, checkRole(["propietario"]),validadorGasto,nuevoGasto);

//lista de gastos por año
router.get('/listagastos/:idpropiedad/:periodo',authMiddleware, checkRole(["propietario"]),listaGastosAño);

//lista de gastos por mes
router.get('/gastosmes/:idpropiedad/:periodo/:mes',authMiddleware, checkRole(["propietario"]),listaGastosMes);

//eliminar gasto
router.delete('/eliminargasto/:idpropiedad/:periodo/:mes',authMiddleware, checkRole(["propietario"]),elimiarGasto);

//obtener lista de contratos en S3
router.get('/lista/s3/:idpropiedad', authMiddleware, checkRole(["propietario"]), listaContratos);

//descargar contrato de S3
router.get('/descargar/s3/:idpropiedad/:idarriendo/:arrendatario', authMiddleware, checkRole(["propietario"]), descargarContrato);

module.exports=router;