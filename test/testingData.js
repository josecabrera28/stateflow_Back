const testUsuarioLogin0 = {
    "email": "cualquiercosa@gmail.com",
    "contraseña": "cualquieremail"
}
const testUsuarioLogin1 = {
    "email": "cabrerajosemiguel28@gmail.com",
    "contraseña": "Stateflow2024"
}
const testUsuarioRegistro = {
    "id_rol": "propietario",
    "nombre": "jose",
    "apellido": "cabrera",
    "edad": 34,
    "email": "cabrerajosemiguel28@gmail.com",
    "contraseña": "Stateflow2024"
}

const testPropiedadNueva0 = {
    "tipo": "casa",
    "ubicacion": "5 whitsand dr",
    "m2":65,
    "cuartos": 3,
    "parqueaderos": 1,
    "propietario":undefined,
    "gastos":[],
    "ingresos": {
        "arriendos": []
    }
}

const testPropiedadNueva1 = {
    "tipo": "apartamento",
    "ubicacion": "cra 54 # 65 - 23",
    "m2":50,
    "cuartos": 2,
    "parqueaderos": 0,
    "gastos":[],
    "ingresos": {
        "arriendos": []
    }
}

const testArriendoPrecio = {
    "precio": 500000
}

const testNuevoArrendatario = {
    "id_rol": "arrendatario",
    "nombre": "marta",
    "apellido": "gomez",
    "edad": 35,
    "email": "martagomez2024@gmail.com"
}

const testNuevoGasto = {
    "año": 2024,
    "mes": 8,
    "servicios": {
        "energia": 55000,
        "gas": 8000,
        "agua": 75000,
        "internet": 78000
        
    },
    "credito": {
    }
}

module.exports={
    testUsuarioLogin0, 
    testUsuarioLogin1, 
    testUsuarioRegistro,
    testPropiedadNueva0,
    testPropiedadNueva1,
    testArriendoPrecio,
    testNuevoArrendatario,
    testNuevoGasto
}