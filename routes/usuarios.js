const express = require ('express');
const router = express.Router();
const { validadorRegistro } = require('../validators/validadorRegistro');
const { controllerRegistro, controllerLogin } = require('../controllers/autenticacion');
const { validadorLogin } = require('../validators/validadorLogin');

//registro
router.post("/registro", validadorRegistro, controllerRegistro);

//login
router.post("/login",validadorLogin,controllerLogin);

module.exports = router;