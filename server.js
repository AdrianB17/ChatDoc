const express = require('express')
const app = express();
const {WebhookClient} = require('dialogflow-fulfillment');
const Suggestion = require('dialogflow-fulfillment/src/rich-responses/suggestions-response.js');
const Text = require('dialogflow-fulfillment/src/rich-responses/text-response.js');
const {Card, Image, Payload } = require('dialogflow-fulfillment');
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

let cID = "";
let nom_ciudad = "";
let nom_distrito = "";
let nom_espec = "";
let nom_hospital = "";
const db = admin.firestore();

app.get('/', function (req, res) {
    res.send('Hello world');
});

app.post('/webhook', express.json(), function (req, res) {
    const agent = new WebhookClient({ request: req, response: res });
    console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(req.body));
   
    function welcome(agent) {
      agent.add(`Welcome to my agent!`);
    }

/*    // Get Fecha y Hora
    function getFechayHora(agent){
      try {
          return db.collection('fechayhora').get().then(function(documents){
              if(documents === 0){
                  agent.add("No existen horarios disponibles.");
              }
              else{
                  let response = '';
                  let arr = [];
                  documents.forEach(function(document){
                      const dataOutput = document.data();
                      const objOutput = [{
                          "text": dataOutput.descripcion,
                          "callback_data": "fecha y hora " + dataOutput.descripcion
                      }];
                      arr.push(objOutput);

                      
                      response += "\n"+ dataOutput.descripcion + "";
                  });
                  //agent.add(response);

                  const payload = {
                      "telegram": {
                        "text": "Escoge los horarios disponibles",
                        "reply_markup": {
                          "inline_keyboard": arr
                        }
                      }
                    }; 
                    
                    agent.add(
                      new Payload(agent.TELEGRAM, payload, {rawPayload: true, sendAsMessage: true})
                    );                        

              }
          }).catch(() => {
              agent.add('hola, ocurrio un error');
          });   
      } catch (error) {
          
      }
  }
*/

    // Get Hospitales
    function getHospitales(agent){
      try {

        const especialidad = agent.parameters.especialidades;
        agent.add(`Seleccionaste la especialidad ${especialidad}.`);

        return db.collection('hospitales').where("ciudad_id", "==", cID).get().then(function(documents){
            if(documents === 0){
                agent.add("No existen hospitales.");
            }
            else{
                let response = '';
                let arr = [];
                documents.forEach(function(document){
                    const dataOutput = document.data();
                    const objOutput = [{
                        "text": dataOutput.descripcion,
                        "callback_data": "Hospital " + dataOutput.descripcion
                    }];
                    arr.push(objOutput);

                    
                    response += "\n"+ dataOutput.descripcion + "";
                });

                const payload = {
                    "telegram": {
                      "text": "¿En cúal hospital?",
                      "reply_markup": {
                        "inline_keyboard": arr
                      }
                    }
                  }; 
                  
                  agent.add(
                    new Payload(agent.TELEGRAM, payload, {rawPayload: true, sendAsMessage: true})
                  );                        

            }
        }).catch(() => {
            agent.add('hola, ocurrio un error');
        });   
    } catch (error) {      
    }
    }

    // Get Especialidad
    function getEspecialidades(agent){
        try {
          const distrito = agent.parameters.location.city;
          agent.add(`Seleccionaste el distrito ${distrito}.`);

          return db.collection('especialidades').get().then(function(documents){
              if(documents === 0){
                  agent.add("No existen especialidades.");
              }
              else{
                  let arr = [];
                  documents.forEach(function(document){
                      const dataOutput = document.data();
                      const objOutput = [{
                          "text": dataOutput.descripcion,
                          "callback_data": "especialidad de " + dataOutput.descripcion
                      }];
                      arr.push(objOutput);
                  });

                  const payload = {
                      "telegram": {
                        "text": "¿Cuál es la especialidad a tratar?",
                        "reply_markup": {
                          "inline_keyboard": arr
                        }
                      }
                    }; 
                    
                    agent.add(
                      new Payload(agent.TELEGRAM, payload, {rawPayload: true, sendAsMessage: true})
                    );                        

              }
          }).catch(() => {
              agent.add('hola, ocurrio un error');
          });   
        } catch (error) {
          agent.add('Ocurrió un error: getEspecialidades');
        }
    }
    
    // Get Distritos
    function getDistritos(agent) {
      try {
        const ciudad = agent.parameters["geo-city"];
        agent.add(`Seleccionaste la ciudad ${ciudad}.`);

        // Buscar la ciudad en la colección "ciudades"
        return db.collection("ciudades")
          .where("descripcion", "==", ciudad)
          .get()
          .then(function(documents){
            if(documents === 0){
              agent.add(`No se encontró la ciudad ${ciudad}.`);
              return;
            }

            // Obtener el identificador de la ciudad
            let ciudadId = [];
            documents.forEach((document) => {
              const idRead = document.data().id;
              ciudadId.push(idRead);
            });

            cID = ciudadId[0];

            // Buscar los distritos en la colección "distritos" filtrando por la ciudad
            return db.collection("distritos")
              .where("ciudad_id", "==", ciudadId[0])
              .get()
              .then(function(documents){
                if (documents === 0) {
                  agent.add(`No se encontraron distritos para la ciudad ${ciudad}.`);
                  return;
                }

                let arr = [];
                documents.forEach((document) => {
                  const dataOutput = document.data();
                  const objOutput = [{
                    "text": dataOutput.descripcion,
                    "callback_data": "distrito de " + dataOutput.descripcion
                  }];
                  arr.push(objOutput);
                });

                const payload = {
                  "telegram": {
                    "text": "¿En qué distrito?",
                    "reply_markup": {
                      "inline_keyboard": arr
                    }
                  }
                };

                agent.add(
                  new Payload(agent.TELEGRAM, payload, {
                    rawPayload: true,
                    sendAsMessage: true
                  })
                );
              });
          })
          .catch(() => {
            agent.add("Ocurrió un error al obtener los datos de la base de datos.");
          });
      } catch (error) {
        agent.add("Ocurrió un error al procesar la solicitud.");
      }
    }

    
    // Get Ciudades
    function getCiudades(agent){
        try {
            return db.collection('ciudades').get().then(function(documents){
                if(documents === 0){
                    agent.add("No existen documentos.");
                }
                else{
                    let response = '';
                    let arr = [];
                    documents.forEach(function(document){
                        const dataOutput = document.data();
                        const objOutput = [{
                            "text": dataOutput.descripcion,
                            "callback_data": "ciudad de " + dataOutput.descripcion
                        }];
                        arr.push(objOutput);

                        
                        response += "\n"+ dataOutput.descripcion + "";
                    });
                    //agent.add(response);

                    const payload = {
                        "telegram": {
                          "text": "Puedo agendarte una cita médica. ¿En qué ciudad te gustaría atenderte?",
                          "reply_markup": {
                            "inline_keyboard": arr
                          }
                        }
                      }; 
                      
                      agent.add(
                        new Payload(agent.TELEGRAM, payload, {rawPayload: true, sendAsMessage: true})
                      );                        

                }
            }).catch(() => {
                agent.add('hola, ocurrio un error');
            });   
        } catch (error) {
            
        }
    }

    // Get Botones
    function getBotones(agent){
        try {
            agent.add(new Text('Hola, ¿en qué ciudad te gustaría atenderte?'));  
            agent.add(
                new Image({
                  imageUrl: "https://via.placeholder.com/150"
                })
              );   
              const payload = {
                "telegram": {
                  "text": "Pick a color",
                  "reply_markup": {
                    "inline_keyboard": [
                      [
                        {
                          "text": "Lima",
                          "callback_data": "Lima"
                        }
                      ],
                      [
                        {
                          "text": "Trujillo",
                          "callback_data": "Trujillo"
                        }
                      ],
                      [
                        {
                          "text": "Chiclayo",
                          "callback_data": "Chiclayo"
                        }
                      ],
                      [
                        {
                          "text": "Arequipa",
                          "callback_data": "Arequipa"
                        }
                      ],
                      [
                        {
                          "text": "Piura",
                          "callback_data": "Piura"
                        }
                      ]
                    ]
                  }
                }
              };
              
              agent.add(
                new Payload(agent.TELEGRAM, payload, {rawPayload: true, sendAsMessage: true})
              );              

        } catch (error) {
            agent.add('Ocurrió un error.');
        }      
    }

    // Get all hospitales
    function getAll(agent){
      return db.collection('hospitales').get().then(function(documents){
          if(documents === 0){
              agent.add("No existen documentos");
          }
          else{
                let response = '';
              documents.forEach(function(document){
                  const dataOutput = document.data();
                    response += "\n"+ dataOutput.descripcion + "";
              });
                agent.add(response);
          }
      }).catch(() => {
          agent.add('hola, ocurrio un error');
      });
    }

    function fallback(agent) {
      agent.add(`I didn't understand`);
      agent.add(`I'm sorry, can you try again?`);
    }
  
    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('cita medica', getCiudades);
    intentMap.set('cita medica - ciudad', getDistritos);
    intentMap.set('cita medica - distrito', getEspecialidades);
    intentMap.set('cita medica - especialidad', getHospitales);
    intentMap.set('cita medica - hospital', getCita);
    agent.handleRequest(intentMap);
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Servidor montado en el puerto ${PORT}`);
})
