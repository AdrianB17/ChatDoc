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

    function getEspecialidades(agent){
        const distrito = agent.parameters.location.city;
        agent.add(`Seleccionaste el distrito ${distrito}`);
        agent.add(`En que especialidad?`);
    }

    // Get Distritos
    function getDistritos(agent){
        try {
            const ciudad = agent.parameters["geo-city"];
            agent.add(`Seleccionaste una ciudad ${ciudad}`);
            return db.collection('distritos').get().then(function(documents){
                if(documents === 0){
                    agent.add("No existen documentos");
                }
                else{
                    let response = '';
                    let arr = [];
                    documents.forEach(function(document){
                        const dataOutput = document.data();
                        const objOutput = [{
                            "text": dataOutput.descripcion,
                            "callback_data": "distrito de " + dataOutput.descripcion
                        }];
                        arr.push(objOutput);

                        
                        response += "\n"+ dataOutput.descripcion + "";
                    });
                    //agent.add(response);

                    const payload = {
                        "telegram": {
                          "text": "¿En qué distrito?",
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
    
    // Get Ciudades
    function getCiudades(agent){
        try {
            return db.collection('ciudades').get().then(function(documents){
                if(documents === 0){
                    agent.add("No existen documentos");
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
                          "text": "Hola, ¿en que ciudad te gustaría atenderte?",
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
            agent.add(new Text('Hola, en qué ciudad te gustaría atenderte'));  
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
            agent.add('Ocurrio un error');
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
    intentMap.set('WebHook', getCiudades);
    intentMap.set('WebHook - ciudad', getDistritos);
    intentMap.set('WebHook - distrito', getEspecialidades);
    agent.handleRequest(intentMap);
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Servidor montado en el puerto ${PORT}`);
})
