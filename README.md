# ChatDoc
Agente Conversacional para el sector público, este nos permite agendar citas y realizar pre-diagnosticos para luego una atención con el medico a consultar.

## Como instalarlo

1. Para instalar todos los paquetes necesarios, tendrás que instalar los paquetes necesarios con `npm`. Para esto ejecuta:

```bash
npm install 

```
2. Ejecutamos el archivo index.js

```bash
node index.js 

```
3. Instalamos ngrok, nos logueamos y en otra terminal ejecutamos

```bash
ngrok http 3000

```
4. Copiamos la url que nos da el ngrok y lo publicamos en el webhook del fulfillment

```bash
https://4490-38-25-8-181.sa.ngrok.io/webhook

```
