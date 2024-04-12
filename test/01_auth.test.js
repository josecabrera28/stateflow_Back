const request = require ("supertest");
const app = require("../app");
const { usuariosModel } = require("../models");
const { testUsuarioLogin0, testUsuarioRegistro, testUsuarioLogin1 } = require("./testingData");

/**
 * se ejecuta antes de las pruebas
 */

beforeAll (async () => {
    await usuariosModel.deleteMany();
});

describe("[AUTH] testing for /api/usuarios/login",()=>{
    test("Should return 403", async ()=>{

        const response = await request(app)
        .post('/api/usuarios/login')
        .send(testUsuarioLogin0)

        expect(response.statusCode).toEqual(403);
    })
});

describe("[AUTH] testing for /api/usuarios/registro",()=>{
    test("Should return 201", async ()=>{

        const response = await request(app)
        .post('/api/usuarios/registro')
        .send(testUsuarioRegistro)

        expect(response.statusCode).toEqual(201);
        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("usuario");
    })
});

describe("[AUTH] testing for /api/usuarios/login",()=>{
    test("Should return 201", async ()=>{

        const response = await request(app)
        .post('/api/usuarios/login')
        .send(testUsuarioLogin1)

        expect(response.statusCode).toEqual(201);
    })
});

