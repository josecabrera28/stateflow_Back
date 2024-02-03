//models object with each no sql model for destructured importing
const models = {
    usuariosModel: require('./nosql/usuarios'),
    propiedadesModel: require('./nosql/propiedades'),
    rolesModel: require('./nosql/roles'),
    peticionesModel: require('./nosql/peticiones'),
    arriendosModel: require('./nosql/arriendos'),
    registrosModel: require('./nosql/registros')
}

module.exports = models;