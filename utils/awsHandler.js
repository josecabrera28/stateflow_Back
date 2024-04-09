const AWS = require("aws-sdk");
const os = require("os");
const path = require("path");
require("dotenv").config();
const fs = require("fs");
const { options, list } = require("pdfkit");

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

//subir contrato a S3
const uploadFile = async (propiedad, arriendo, arrendatario, doc) => {
    try {
        // Subir el archivo a AWS S3
        await s3.upload({
            Bucket: 'stateflow-contracts',
            Key: `${propiedad}/${arriendo}/${arrendatario}.pdf`,
            Body: doc,
        }).promise();
    } catch (error) {
        console.error("Error al subir contrato a AWS:", error);
        throw error;
    }
};

//listar contratos de S3
const listFiles = async (propiedad, list = []) => {
    try {
        const options = {
        Bucket: "stateflow-contracts",
        Prefix: propiedad,
        };
        // listar archivos de un bucket de AWS S3 con de una carpeta especifica (propiedad)
        const data = await s3.listObjectsV2(options).promise();
        // Filtrar los archivos directamente en la carpeta actual
        const archivosEnCarpeta = data.Contents.filter(
        (objeto) => !objeto.Key.endsWith("/")
        );
        // Imprimir los nombres de los archivos encontrados
        archivosEnCarpeta.forEach((archivo) => {
        //console.log("Nombre de archivo:", archivo.Key);
        list.push(archivo.Key);
        });

        // Recorrer y listar subcarpetas recursivamente
        for (const prefijo of data.CommonPrefixes) {
            await listFiles(prefijo.Prefix);
        }
        return list;
    } catch (error) {
        console.error("Error listar pdfs del Bucket", error);
        throw error;
    }
};

//descargar contrato de S3
const downloadFile = async (propiedad, arriendo, arrendatario) => {
    try {
        const options = {
            Bucket: 'stateflow-contracts',
            Key: `${propiedad}/${arriendo}/${arrendatario}.pdf`,
        };
        const data = await s3.getObject(options).promise();
        return data.Body;
    } catch (error) {
        console.error('Error en el handler de decargar contrato de S3:', error);
        throw error;
    }
};

//eliminar contrato de S3
const deleteFile = async (propiedad, arriendo, arrendatario) => {
    try {
        const options = {
            Bucket: 'stateflow-contracts',
            Key: `${propiedad}/${arriendo}/${arrendatario}.pdf`,
        };
        await s3.deleteObject(options).promise();
    } catch (error) {
        console.error('Error en el handler de eliminar contrato de S3:', error);
        throw error;
    }
}
module.exports = { uploadFile, listFiles, downloadFile, deleteFile };
