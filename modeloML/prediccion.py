import numpy as np
import os
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from keras.models import load_model

os.chdir("C:/Users/ariel/Documents/quemaduras")

altura, longitud=150,150
modelo = './modelo/modelo.h5'
pesos_modelo = './modelo/pesos.h5'
modelo = load_model(modelo)
modelo.load_weights(pesos_modelo)

#Prediccion

def prediccion(file):
    etiquetas = {0: 'primer', 1: 'segundo', 2: 'tercer'}
    img = load_img(file, target_size=(longitud, altura), color_mode='rgb', interpolation='nearest')
    x = img_to_array(img)
    x = np.expand_dims(x, axis=0)
    arreglo = modelo.predict(x)
    resultado = np.argmax(arreglo)
    clase = etiquetas[resultado]
    print("Predicción:", clase)

    return resultado

#Ejecutar
prediccion('foto3.jpeg')