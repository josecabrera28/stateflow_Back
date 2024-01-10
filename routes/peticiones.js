const express = require('express');
const authMiddleware = require('../middlewares/authJWT');
const checkRole = require('../middlewares/rol');
const { crearPeticion, listaPeticiones, responderPeticion } = require('../controllers/peticiones');
const { validarPeticionNueva } = require('../validators/validadorPeticion');
const { generate } = require('../utils/generatePdf');
const router = express.Router();

//crear una peticion a una propiedad
router.post('/crearpeticion',authMiddleware, checkRole(["arrendatario"]),validarPeticionNueva,crearPeticion);

//obtener lista peticiones relacionadas con un propietario o arrendatario
router.get('/listapeticiones',authMiddleware,checkRole(["arrendatario","propietario"]),listaPeticiones);

//reponder peticion
router.put('/:id',authMiddleware,checkRole(["propietario"]),responderPeticion, generate);

module.exports=router;