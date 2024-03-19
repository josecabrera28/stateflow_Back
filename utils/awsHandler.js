const AWS = require("aws-sdk");
const os = require('os');
const path = require('path');
require("dotenv").config();
const fs = require("fs");

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

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

module.exports = { uploadFile };
