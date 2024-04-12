const request = require ("supertest");
const app = require("../app");
const { usuariosModel, propiedadesModel, rolesModel, arriendosModel, registrosModel } = require("../models");
const { testPropiedadNueva0, testUsuarioRegistro, testPropiedadNueva1, testArriendoPrecio, testNuevoArrendatario } = require("./testingData");
const { firmarToken } = require("../utils/handleJWT");

let JWT_TOKEN;
let USUARIO;
/**
 * se ejecuta antes de las pruebas
 */
beforeAll (async () => {
    await usuariosModel.deleteMany();
    await propiedadesModel.deleteMany();
    await arriendosModel.deleteMany();
    await registrosModel.deleteMany();
    const {_id} = await rolesModel.findOne({rol:"propietario"});
    testUsuarioRegistro.id_rol = _id;  
    USUARIO = await usuariosModel.create(testUsuarioRegistro);
    JWT_TOKEN = await firmarToken(USUARIO);
});

describe("[PROP] testing for /api/propiedades/nueva",()=>{
    test("Should create a Property", async ()=>{

        const response = await request(app)
        .post('/api/propiedades/nueva')
        .set("Authorization", `Bearer ${JWT_TOKEN}`)
        .send(testPropiedadNueva0);

        expect(response.statusCode).toEqual(200);
    })
});

describe("[PROP] testing for /api/propiedades/lista",()=>{
    test("Should get a list of Properties", async ()=>{

        const nuevaPropiedad = await propiedadesModel.create(testPropiedadNueva1);
        const response = await request(app)
        .get('/api/propiedades/lista')
        .set("Authorization", `Bearer ${JWT_TOKEN}`)
        .send();

        expect(response.statusCode).toEqual(200);
        expect(Array.isArray(response.body)).toBe(true);

        response.body.forEach(property => {
            expect(property).toHaveProperty('_id');
            expect(property).toHaveProperty('propietario');
            expect(property).toHaveProperty('ubicacion');
            expect(property).toHaveProperty('m2');
            expect(property).toHaveProperty('ingresos');
            expect(property.ingresos).toHaveProperty('arriendos');
            expect(property).toHaveProperty('gastos');
            expect(property).toHaveProperty('cuartos');
            expect(property).toHaveProperty('parqueaderos');
            expect(property).toHaveProperty('tipo');
            expect(property.tipo).toMatch(/^(apartamento|casa)$/);
        });
    })
});

describe("[PROP] testing for /api/propiedades/precio/[propiedadId]/[arriendoId]",()=>{
    test("Should update a room price", async ()=>{
        const propiedades = await propiedadesModel.find({propietario:USUARIO._id})
        .populate(
            {
                path: 'ingresos.arriendos.arriendoId',
                model: 'arriendos'
            }
        );
        const propiedad = propiedades[0];
        const arriendo = propiedad.ingresos.arriendos[0].arriendoId._id;
        const response = await request(app)
        .put(`/api/propiedades/precio/${propiedades[0]._id}/${propiedades[0].ingresos.arriendos[0].arriendoId._id}`)
        .set("Authorization", `Bearer ${JWT_TOKEN}`)
        .send(testArriendoPrecio);

        expect(response.body).toHaveProperty('tipo');
        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('arrendado');
        expect(response.body).toHaveProperty('historialPrecios');
        expect(response.body).toHaveProperty('precio');
        expect(response.body.precio).toEqual(testArriendoPrecio.precio);
        expect(response.statusCode).toEqual(200);
    })
});

describe("[PROP] testing for /api/propiedades/adicionararrendatario/[propiedadId]/[arriendoId]",()=>{
    test("Should add a tenant to one room/parking", async ()=>{
        const propiedades = await propiedadesModel.find({propietario:USUARIO._id})
        .populate(
            {
                path: 'ingresos.arriendos.arriendoId',
                model: 'arriendos'
            }
        );
        const propiedad = propiedades[0];
        const arriendo = propiedad.ingresos.arriendos[0].arriendoId._id;
        const response = await request(app)
        .put(`/api/propiedades/adicionararrendatario/${propiedades[0]._id}/${propiedades[0].ingresos.arriendos[0].arriendoId._id}`)
        .set("Authorization", `Bearer ${JWT_TOKEN}`)
        .send(testNuevoArrendatario);

        expect(response.statusCode).toEqual(200);
    })
});

describe("[PROP] testing for /api/propiedades/lista/s3/[propiedadId]",()=>{
    test("Should get a list of contract strings in aws s3 location", async ()=>{
        const propiedades = await propiedadesModel.find({propietario:USUARIO._id})
        .populate(
            {
                path: 'ingresos.arriendos.arriendoId',
                model: 'arriendos'
            }
        );
        const propiedad = propiedades[0];
        const arriendo = propiedad.ingresos.arriendos[0].arriendoId._id;
        const response = await request(app)
        .get(`/api/propiedades/lista/s3/${propiedades[0]._id}`)
        .set("Authorization", `Bearer ${JWT_TOKEN}`)
        .send();

        expect(Array.isArray(response.body)).toEqual(true);
        expect(response.body[0]).toMatch(new RegExp(`^${propiedad._id}/.*$`));
        expect(response.statusCode).toEqual(200);
    })
});

describe("[PROP] testing for /api/propiedades/descargar/s3/[propiedadId]/[arriendoId]/[arrendatario]",()=>{
    test("Should get the pdf contract for specific tenant", async ()=>{
        const propiedades = await propiedadesModel.find({propietario:USUARIO._id})
        .populate(
            {
                path: 'ingresos.arriendos.arriendoId',
                model: 'arriendos'
            }
        );
        const propiedad = propiedades[0];
        const arriendo = propiedad.ingresos.arriendos[0].arriendoId._id;
        let arrendatario = propiedad.ingresos.arriendos[0].arriendoId.arrendatario;
        arrendatario  = await usuariosModel.findById(arrendatario);
        const response = await request(app)
        .get(`/api/propiedades/descargar/s3/${propiedades[0]._id}/${propiedades[0].ingresos.arriendos[0].arriendoId._id}/${arrendatario.nombre}_${arrendatario.apellido}`)
        .set("Authorization", `Bearer ${JWT_TOKEN}`)
        .send();

        expect(response.statusCode).toEqual(200);
        expect(response.headers['content-type']).toMatch(/^application\/pdf/);
    })
});

describe("[PROP] testing for /api/propiedades/removerarrendatario/[propiedadId]/[arriendoId]",()=>{
    test("Should remove a tenant from one room/parking", async ()=>{
        const propiedades = await propiedadesModel.find({propietario:USUARIO._id})
        .populate(
            {
                path: 'ingresos.arriendos.arriendoId',
                model: 'arriendos'
            }
        );
        const propiedad = propiedades[0];
        const arriendo = propiedad.ingresos.arriendos[0].arriendoId._id;

        const response = await request(app)
        .put(`/api/propiedades/removerarrendatario/${propiedad._id}/${arriendo}`)
        .set("Authorization", `Bearer ${JWT_TOKEN}`)
        .send();

        expect(response.statusCode).toEqual(200);
    })
});

describe("[PROP] testing for /api/propiedades/[propiedadId]",()=>{
    test("Should delete a property", async ()=>{
        const propiedades = await propiedadesModel.find({propietario:USUARIO._id})
        .populate(
            {
                path: 'ingresos.arriendos.arriendoId',
                model: 'arriendos'
            }
        );
        const propiedad = propiedades[0];

        const response = await request(app)
        .delete(`/api/propiedades/${propiedad._id}`)
        .set("Authorization", `Bearer ${JWT_TOKEN}`)
        .send();

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('propiedadEliminada');
        expect(response.body.propiedadEliminada.acknowledged).toEqual(true);
    })
});