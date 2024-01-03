const models = {
    usuariosModel: require('./nosql/usuarios'),
    propiedadesModel: require('./nosql/propiedades'),
    rolesModel: require('./nosql/roles'),
    peticionesModel: require('./nosql/peticiones'),
    arriendosModel: require('./nosql/arriendos')
}

module.exports = models;