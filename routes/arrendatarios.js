const express = require('express');
const {getarrendatarios} = require('../controllers/arrendatarios');
const router = express.Router();


router.get("/",getarrendatarios);

module.exports = router;