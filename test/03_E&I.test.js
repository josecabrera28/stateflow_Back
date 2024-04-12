const request = require ("supertest");
const app = require("../app");
const { usuariosModel, propiedadesModel, arriendosModel, registrosModel, rolesModel } = require("../models");
const { firmarToken } = require("../utils/handleJWT");
const { testPropiedadNueva0, testUsuarioRegistro, testNuevoGasto } = require("./testingData");



let JWT_TOKEN;
let USUARIO;
let PROPIEDAD;
/**
 * se ejecuta antes de las pruebas
 */
beforeAll (async () => {
    await usuariosModel.deleteMany();
    await propiedadesModel.deleteMany();
    const {_id} = await rolesModel.findOne({rol:"propietario"});
    testUsuarioRegistro.id_rol = _id;  
    USUARIO = await usuariosModel.create(testUsuarioRegistro);
    JWT_TOKEN = await firmarToken(USUARIO);
    testPropiedadNueva0.propietario = USUARIO._id;
    PROPIEDAD = await propiedadesModel.create(testPropiedadNueva0);
});

describe("[PROP] testing for /api/propiedades/[propiedadId]/nuevogasto",()=>{
    test("Should create a new expense for the property", async ()=>{
        const propiedades = await propiedadesModel.find({propietario:USUARIO._id})
        .populate(
            {
                path: 'ingresos.arriendos.arriendoId',
                model: 'arriendos'
            }
        );
        const propiedad = propiedades[0]._id;
        const gasto = testNuevoGasto;
        const response = await request(app)
        .post(`/api/propiedades/${propiedad}/nuevogasto`)
        .set("Authorization", `Bearer ${JWT_TOKEN}`)
        .send(gasto);

        expect(response.statusCode).toEqual(200);
    })
});

describe("[PROP] testing for /api/propiedades/listagastos/[propiedadId]/[año]",()=>{
    test("Should get the the expenses for an specific property and year", async ()=>{
        const propiedades = await propiedadesModel.find({propietario:USUARIO._id})
        .populate(
            {
                path: 'ingresos.arriendos.arriendoId',
                model: 'arriendos'
            }
        );
        const {año} = testNuevoGasto;
        const propiedad = propiedades[0]._id;
        const response = await request(app)
        .get(`/api/propiedades/listagastos/${propiedad}/${año}`)
        .set("Authorization", `Bearer ${JWT_TOKEN}`)
        .send();

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('año');
    })
});

describe("[PROP] testing for /api/propiedades/listaingresos/[propiedadId]/[año]",()=>{
    test("Should get the the income for an specific property and year", async ()=>{
        const propiedades = await propiedadesModel.find({propietario:USUARIO._id})
        .populate(
            {
                path: 'ingresos.arriendos.arriendoId',
                model: 'arriendos'
            }
        );
        const año = 2024;
        const propiedad = propiedades[0]._id;
        const response = await request(app)
        .get(`/api/propiedades/listaingresos/${propiedad}/${año}`)
        .set("Authorization", `Bearer ${JWT_TOKEN}`)
        .send();

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('1');
        expect(response.body).toHaveProperty('2');
        expect(response.body).toHaveProperty('3');
        expect(response.body).toHaveProperty('4');
        expect(response.body).toHaveProperty('5');
        expect(response.body).toHaveProperty('6');
        expect(response.body).toHaveProperty('7');
        expect(response.body).toHaveProperty('8');
        expect(response.body).toHaveProperty('9');
        expect(response.body).toHaveProperty('10');
        expect(response.body).toHaveProperty('11');
        expect(response.body).toHaveProperty('12');
    })
});

describe("[PROP] testing for /api/propiedades/eliminargasto/[propiedadId]/[año]/[mes]",()=>{
    test("Should delete the expense records for an specific property, year and month", async ()=>{
        const propiedades = await propiedadesModel.find({propietario:USUARIO._id})
        .populate(
            {
                path: 'ingresos.arriendos.arriendoId',
                model: 'arriendos'
            }
        );
        const propiedad = propiedades[0]._id;
        const {año} = testNuevoGasto;
        const {mes} = testNuevoGasto;

        const response = await request(app)
        .delete(`/api/propiedades/eliminargasto/${propiedad}/${año}/${mes}`)
        .set("Authorization", `Bearer ${JWT_TOKEN}`)
        .send();

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('registroEliminado');
        expect(response.body.propiedadActualizada.acknowledged).toEqual(true);
    })
});