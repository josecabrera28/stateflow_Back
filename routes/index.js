const express = require('express');
const router = express.Router();
const fs = require('fs');
//directorio actual 
const PATH_ROUTES = __dirname;
/**divide el nombre de un archivo que se pasa en filename por el punto "." y toma el primer valor de la lista resultante
 * por ejemplo hojadevida.pdf lo divide por el punto y se queda con "hojadevida" y lo retorna.
 * */
const removeExtension = (filename) =>{
    return filename.split(".").shift();
}
/**crea un router dinamico el cual toma como valores de ruta los archivos de la capeta donde se encuentra este archivo
 * sin tener en cuenta si el archivo que obtiene es "index" y lo exporta de tal manera que las rutas seguiran el siguiente 
 * patron: http://localhost:2000/api/[filename]/....
 */
fs.readdirSync(PATH_ROUTES).filter((file)=>{
    const name = removeExtension(file);
    if(name != "index"){
        router.use(`/${name}`,require(`./${file}`));
    }
});

module.exports = router;