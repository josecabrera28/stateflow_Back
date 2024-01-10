const PDFDocument = require('pdfkit');
const handleHtttpError = require('./handleError');
const { usuariosModel, propiedadesModel, arriendosModel } = require('../models');
const { default: mongoose } = require('mongoose');


const generate = async (req, res) =>{
    try { 
        let arrendatario = req.actualizado.arrendatario;
        let propietario;
        let propiedad;
        let arriendo = new mongoose.Types.ObjectId(req.actualizado.arriendo);
        const fecha = new Date();
        let fechaInicio = fecha.toISOString();
        fechaInicio = fechaInicio.substring(0,10);

        const fechaActual = new Date();
        fechaActual.setMonth(fechaActual.getMonth() + 6);
        let fechaFinal = fechaActual.toISOString();
        fechaFinal = fechaFinal.substring(0,10);

        //busca el arrendatario
        arrendatario = await usuariosModel.findById(arrendatario);
        //propietario
        propietario = req.usuario;
        //busca la propiedad del arriendo
        let propiedades = await  propiedadesModel.find({propietario: propietario._id});
        for(let i=0; i<propiedades.length; i++){
            for(let j=0; j<propiedades[i].ingresos.arriendos.length;j++){
                if(arriendo.equals(propiedades[i].ingresos.arriendos[j].arriendoId)){
                    propiedad = propiedades[i];
                }
            }
        }
        //busca el arriendo
        let arriendoDetalles = await arriendosModel.findById(req.actualizado.arriendo);
        
        //texto de pdf
        const titulo = 'CONTRATO DE ARRENDAMIENTO \n';
        const encabezado = 
        `ARRENDATARIO: ${arrendatario.nombre} ${arrendatario.apellido}\n`+
        'CEDULA: ________________ de ___________\n'+
        `ARRENDADOR: ${propietario.nombre} ${propietario.apellido}\n`+
        'CEDULA: ________________ de ___________\n'+
        `DIRECCION DEL INMUEBLE: ${propiedad.ubicacion}\n`+
        `NUMERO DE HABITACION: ${arriendoDetalles._id}\n`+
        `CANON MENSUAL: ${arriendoDetalles.precio}\n`+
        'FECHA DE PAGO: LOS CINCO (5) PRIMEROS DIAS DE CADA MES \nTERMINO DE DURACIÓN DEL CONTRATO: SEIS (6) meses\n'+
        `FECHA DE INICIACIÓN DEL CONTRATO: ${fechaInicio}.\n`+
        `FECHA DE TERMINACIÓN DEL CONTRATO: ${fechaFinal}.\n`;        
        
        let cuerpo;
        if(req.actualizado.esCuarto){
            cuerpo = '\nLas partes contratantes adquieren los derechos y contraen las obligaciones que el presente contrato y la ley les imponen de conformidad con las siguientes clausulas:\n'+
            `PRIMERA. Para el presente contrato se tendrán como partes las siguientes: ARRENDATARIO: ${arrendatario.nombre} ${arrendatario.apellido}, persona mayor de edad, identificado con C.C. No. ________________ ARRENDADOR: ${propietario.nombre} ${propietario.apellido}, persona mayor de edad, identificada con C.C. No. ________________.\n`+
            `SEGUNDA: OBJETO: El arrendador entrega a título de arrendamiento una HABITACION ubicada en ${propiedad.ubicacion}, que consta de 1 closet, zona de lavandería, cocina y sala de uso compartido con los residentes del inmueble. El objeto del arriendo es EXCLUSIVAMENTE la habitación que se indica, sin derecho a utilizar los otros dormitorios del apartamento.\n`+
            'TERCERA: SERVICIOS: Los servicios de agua, energía, gas, administración e internet, serán cancelados oportunamente por el arrendatario, valores que se encuentran incluidos dentro del CANON de arrendamiento.\n'+
            `CUARTA. TERMINO: El termino de arrendamiento del presente contrato será de SEIS (06) meses, contados a partir del ${fechaInicio} hasta el día ${fechaFinal}, EL ARRENDADOR se reserva el derecho de rescindir el contrato por cualquier eventualidad siempre y cuando comunique al arrendatario con un mes de antelación. En caso de que el arrendatario no desee prorrogar el contrato al finalizar su término deberá notificar al arrendador por escrito con un mínimo de un mes de antelación. En caso de que el arrendatario desee rescindir del contrato antes de los 6 meses deberá notificar al arrendador por escrito con un mínimo de un mes de antelación, de lo contrario deberá pagar 1 mes adicional de arrendamiento.\n`+
            `QUINTA. CANON: El valor del canon de arrendamiento del presente contrato será de ${propiedad.precio} mensuales, que el arrendatario pagará por transferencia bancaria anticipadamente dentro de los cinco (05) primeros días de cada mes en la cuenta de ___________ # __________________ de ___________ a nombre de ________________. A partir del sexto día el arrendatario pagará un interés bancario corriente vigente sobre el canon de arrendamiento. La mera tolerancia del arrendador de aceptar el pago del precio del arrendamiento con posterioridad a los cinco (05) primeros días de cada mes, no se entenderá con ánimo de modificar el término establecido para efectuar el pago en el presente contrato.\n`+
            'PARÁGRAFO PRIMERO: En caso de mora o retardo en el pago del precio del arrendamiento, de acuerdo con lo previsto en la presente cláusula, EL ARRENDADOR podrá dar por terminado unilateralmente con justa causa el presente contrato y exigir la entrega inmediata del inmueble, para lo cual el ARRENDATARIO renuncia expresamente a los requerimientos privados y judiciales previstos en la Ley (Artículos 1594 y 2007 del Código Civil).\n'+
            'SEXTA. DESTINACIÓN: El arrendatario se compromete a darle al inmueble el uso para vivienda de él, y no podrá darle otro uso, ni ceder, ni transferir el arrendamiento sin la autorización escrita del arrendador. El incumplimiento de esta obligación dará derecho al arrendador para dar por terminado este contrato y exigir la entrega del inmueble.\n'+
            'SEPTIMA. CESION: La cesión de este contrato por parte del arrendatario solo es válida previa autorización del arrendador dada por escrito, En caso de que EL ARRENDATARIO tenga la voluntad de finalizar el contrato antes de la fecha fijada, tendrá que comunicarlo al propietario con un mes de antelación.\n'+
            'OCTAVA. REPARACIONES Y MEJORAS: No podrá el arrendatario efectuar reparaciones que no tengan el carácter de locativas y/o mejoras, sin previo permiso por escrito del arrendador. Si las ejecutare sin esta autorización accederán al inmueble sin perjuicio de que el arrendatario pueda exigir su retiro, caso en el cual el arrendatario se obliga a entregar el inmueble en el mismo estado en que lo recibió en términos de aseo y pintura.\n'+
            'NOVENA. SUBARRIENDO: El arrendatario no podrá sin autorización escrita por el arrendador, subarrendar total o parcialmente, ni darle destinación diferente a la prevista. Lo mismo aplica para la contratación de cualquier tipo de servicio sin previo permiso del ARRENDATARIO.\n'+
            'DECIMA. SANCIONES: En caso de incumplimiento de cualquiera de las cláusulas y al reglamento interno se aplicará una sanción penal, equivalente al valor de una (1) mensualidad según el precio del arrendamiento, sin perjuicio de que se exijan las demás acciones otorgadas por la Ley al arrendador, sin necesidad de requerimiento privados o judiciales a los cuales renuncia expresamente el arrendatario, como el requerimiento, revocaciones y desahucios exigidos por los Artículos 2035 y 2007 del C.C. y 424 del C.P.C. y al derecho de oponerse a la cesación de arrendamiento mediante caución en caso de juicio de restitución de inmueble. Si el arrendatario desocupa el inmueble antes de su vencimiento se dará aplicación a lo dispuesto en el Art. 2033 del C.C.\n'+
            'DECIMA PRIMERA. TERCERAS PERSONAS: Queda prohibida la pernoctación de terceras personas al inmueble.\n'+
            'DECIMA SEGUNDA: CONVIVENCIA: EL ARRENDATARIO está obligado a cumplir las normas de mínima convivencia respetando el descanso de las habitaciones vecinas, especialmente desde las 9:00 pm hasta las 08:00 am.\n'+
            'DECIMA TERCERA: Siendo objeto de arriendo exclusivamente la habitación expresada en el objeto del presente contrato, EL ARRENDADOR conserva su derecho a entrar y salir del apartamento, por lo que el arrendatario se obliga a no cambiar la cerradura de la puerta. Por pérdida de llaves se abonará su importe para una nueva copia.\n'+
            'DECIMA CUARTA: El ARRENDADOR no se hace responsable de pérdidas o hurtos en las habitaciones. A tal efecto todas las habitaciones cuentan con cerradura privada. El ARRENDADOR tampoco se hace responsable de los posibles daños que pudieran surgir en los dispositivos eléctricos enchufados en la red eléctrica del piso. *******************\n'+
            `En constancia se firma el ${fechaInicio} y en dos (2) ejemplares.\n`;
            
        }else if(req.actualizado.esParqueadero){
            cuerpo = `\nPor una parte, la señora ${propietario.nombre} ${propietario.apellido}, identificado con Cédula de Ciudadanía N°`+
            '_________________, quien para todos los efectos de este'+
            `contrato se denominará en adelante El ARRENDADOR, y de otra parte el ${arrendatario.nombre} ${arrendatario.apellido}`+
            ',identificado con la Cédula de Ciudadanía N° _____________________, quien para todos los'+
            'efectos de este contrato se denominarán EL ARRENDATARIO, han convenido celebrar el presente'+
            'CONTRATO DE ARRENDAMIENTO DE PARQUEADERO ubicado en'+
            `${propiedad.ubicacion} que se regirá por lo establecido en el Código Civil`+
            'Colombiano, sus normas concordantes y las siguientes CLÁUSULAS:'+
            '\nPRIMERA. - OBJETO: Mediante el presente contrato, EL ARRENDADOR da en arrendamiento al'+
            `ARRENDATARIO, un (1) espacio de parqueadero cubierto # ${arriendo._id} ubicado en ${propiedad.ubicacion}`+
            '\nSEGUNDA. – DESTINACION: El inmueble objeto del presente contrato será destinado por los'+
            'arrendatarios única y exclusivamente para parqueadero, y se obligan a no cambiar su destinación, sin'+
            'previo consentimiento escrito del arrendador y a no permitir que en él se guarden sustancias'+
            'perjudiciales para su conservación, salubridad seguridad e higiene.'+
            '\nTERCERA. – DURACIÓN: El termino de duración del presente contrato será de seis meses (6) contados a'+
            `partir de ${fechaInicio}.`+ 
            '\nCUARTA. – CANON Y FORMA DE PAGO: El canon mensual del arrendamiento es de la suma de $'+
            `${arriendo.precio} pesos colombianos, que EL ARRENDATARIO se obliga a pagar al ARRENDADOR en su`+            
            'totalidad de la siguiente manera: a). por concepto de mes anticipado se cancela a partir de la fecha de'+
            'legalización del presente contrato, b). los siguientes pagos se realizará los cinco (5) primeros días'+
            'hábiles del mes de cada mes correspondiente. c). el valor que se incrementará anualmente en un'+
            'porcentaje igual al incremento que tenga el índice de precios al consumidor.'+
            'PARÁGRAFO PRIMERO: Los pagos aquí previstos se realizarán a la orden de _________________,'+
            'identificado con Cedula de Ciudadanía N° __________________, en la cuenta de ___________ # '+
            '______________ de la entidad bancaria _______________.'+
            'PARÁGRAFO SEGUNDO: En caso de mora o retardo en el pago del precio del arrendamiento,de'+
            'acuerdo con lo previsto en la presente cláusula, EL ARRENDADOR podrá dar por terminado'+
            'unilateralmente con justa causa el presente contrato y exigir la entrega inmediatadel inmueble, para'+
            'lo cual el ARRENDATARIO renuncia expresamente a los requerimientos privados y judiciales previstos'+
            'en la Ley (Artículos 1594 y 2007 del Código Civil).'+
            '\nQUINTA. – RECIBO Y ESTADO: EL ARRENDATARIO declara que ha recibido el inmueble objeto de este'+
            'contrato en buen estado de servicio y presentación; que se obliga a cuidarlo, conservarlo y mantenerlo'+
            'y, que en el mismo estado lo restituirá al ARRENDADOR. Parágrafo: Los daños al inmueble derivados'+
            'del mal trato o descuido que deterioren en forma inusual la calidad del inmueble por parte del'+
            'ARRENDATARIO, durante su tenencia, serán de su cargo y EL ARRENDADOR estará facultado para'+
            'hacerlos por su cuenta y posteriormente reclamar su valor hasta por el monto de un canon mensual'+
            'al ARRENDATARIO.'+
            '\nSEXTA: El arrendatario se hará responsable por los perjuicios que cause a los demás usuarios de la zona'+
            'de parqueo.'+
            'PARÁGRAFO PRIMERO: En caso de destruir o dañar cualquier pieza, elemento, llave, vidrio,tanque,'+
            'puertas, chapas, baldosín, o vehículo etc., existente en la zona de parqueo, el arrendatario se obliga a'+
            'reponerlo o repararlo garantizando que se quedara de la misma calidad.'+
            '\nSEPTIMA. - OBLIGACIONES DEL ARRENDATARIO: 1. Pagar el precio del arrendamiento dentro del plazo'+
            'estipulado en este contrato a nombre del ARRENDADOR, de acuerdo con loestipulado en el presente'+
            'contrato en la CLAUSULA TERCERA. 2. Gozar del inmueble según los términos de éste contrato. 3.'+
            'Velar por la conservación del inmueble. En caso de daños o deterioros distintos a los derivados del uso'+
            'normal o de la acción del tiempo, que fueren imputables al mal uso del inmueble, o a su propia culpa,'+
            'EL ARRENDATARIO deberá efectuar oportunamente y por su cuenta las reparaciones o sustituciones'+
            'necesarias. 4. Pagar a tiempo los servicios, cosas o usos conexos y adicionales, así como las expensas'+
            'comunes en los casos en que haya lugar de conformidad con lo aquí establecido. 5. Cumplir las normas'+
            'consagradas en los reglamentos de propiedad horizontal en los casos aplicables y las que expida el'+
            'gobierno en protección de los derechos de todos los vecinos. 6. Restituir el inmueble a la terminación'+
            'del contrato en el estado en que le fue entregado, salvo el deterioro natural causado por el tiempo y'+
            'el uso legítimo, poniéndolo a disposición del ARRENDADOR.'+
            '\nOCTAVA - OBLIGACIONES DEL ARRENDADOR. 1. Entregar al ARRENDATARIO en la fecha convenida,'+
            'o en el momento de la celebración del contrato, el inmueble dado en arrendamiento en buen estado de'+
            'servicios, seguridad y sanidad. 2. Suministrar al ARRENDATARIO copia del presente contrato con firmas'+
            'originales, en un plazo máximo diez (10) días, contados a partir de la suscripción del mismo. 4. Hacer las'+
            'reparaciones necesarias del bien objeto del Arriendo, y las locativas solo cuando éstas provengan de'+
            'fuerza mayor o caso fortuito, o se deriven de la mala calidad del parqueadero o de los materiales'+
            'utilizados en el inmueble arrendado. 5. Las demás obligaciones consagradas para los arrendadores en el'+
            'Capítulo II, Titulo XXVI, Libro IV del Código Civil Colombiano.'+
            '\nNOVENA - SUBARRIENDO Y CESIÓN: El ARRENDATARIO no está facultado para ceder el arriendo ni'+
            'subarrendar, a menos que medie autorización previa y escrita del ARRENDADOR. En caso de'+
            'contravención, el ARRENDADOR podrá dar por terminado el contrato de arrendamiento y exigir la'+
            'entrega del inmueble.'+
            '\nDÉCIMA. - EXENCIÓN DE RESPONSABILIDAD: El ARRENDADOR no asume responsabilidad alguna'+
            'por los daños o perjuicios que el ARRENDATARIO pueda sufrir por causas atribuibles a terceros o a otros'+
            'arrendatarios de partes del mismo inmueble, o la culpaleve del ARRENDADOR o de otros arrendatarios o'+
            'de sus empleados o dependientes, ni por robos, hurtos, ni por siniestros causados por incendio,'+
            'inundación o terrorismo. Serán de cargo del ARRENDATARIO las medidas, dirección y manejo tomadas'+
            'para la seguridad del bien.'+
            '\nDÉCIMA PRIMERA. - CAUSALES DE TERMINACIÓN POR PARTE DEL ARRENDADOR: Son causales'+
            'para que el arrendador pueda pedir unilateralmente la terminación del contrato, las siguientes: 1. La no'+
            'cancelación por parte del arrendatario del precio del canon de arrendamiento, dentro del término'+
            'estipulado en el contrato. 2. El subarriendo total o parcial del inmueble, la cesión del contrato o del goce'+
            'del inmueble o el cambio de destinación del mismo por parte del arrendatario, sin expresa autorización'+
            'del arrendador. 3. La realización de mejoras, cambios o ampliaciones del inmueble, sin expresa'+
            'autorización del arrendador o la destrucción total o parcial del inmueble o área arrendada por parte del'+
            'ARRENDATARIO. 4. La violación por el ARRENDATARIO a las normas del respectivo reglamento de'+
            'propiedad horizontal cuando se trate de viviendas sometidas a ese régimen. 5. El ARRENDADOR podrá'+
            'dar por terminado unilateralmente el contrato de arrendamiento de conformidad con la normatividad'+
            'vigente.'+
            '\nDÉCIMA SEGUNDA. - TERMINACIÓN POR MUTUO ACUERDO: Las partes podrán dar por terminado de'+
            'mutuo acuerdo en cualquier tiempo este contrato sin que se ocasione pago deindemnización alguna.'+
            'Para efectos de recibir notificaciones judiciales y extrajudiciales, las partes en cumplimiento del Art.'+
            '12 de la Ley 820 de 2003, a continuación, y al suscribir este contrato indican sus respectivas'+
            'direcciones.\n'
        }
        
        const firmas = 'Arrendatario:\n\n\n'+
        `______________________\n`+
        `${arrendatario.nombre} ${arrendatario.apellido}\n`+
        'C.C. ______________________\n\n'+
        'Arrendador:\n\n\n'+
        `______________________\n`+
        `${propietario.nombre} ${propietario.apellido}\n`+
        'C.C. ______________________';

        const doc = new PDFDocument({size: 'LETTER'});

        doc
        .text(titulo,{align: 'center', paragraphGap: 10})
        .text(encabezado,{align: 'left'})
        .text(cuerpo,{align: 'justify', paragraphGap: 10})
        .text(firmas,{align: 'left', paragraphGap: 10})
        .font('Times-Roman', 12)
        .end();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=contrato.pdf');

        // Pipe directamente los datos del documento al stream de respuesta
        doc.pipe(res);

        // Cerramos el stream al finalizar el documento
        doc.on('end', () => res.end());
    } catch (error) {
        console.log(error);
        handleHtttpError(res, "Error al generar Pdf");
    }
}

module.exports={generate};