#Librerias
import os
import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dropout, Flatten, Dense, Activation
from tensorflow.keras.layers import Conv2D, MaxPooling2D
from tensorflow.keras.optimizers import Adam
#from tensorflow.keras import backend as K
#K.clear_session()

os.chdir("C:/Users/ariel/Documents/quemaduras")

data_entrenamiento='./data/entrenamiento'
data_validacion='./data/validacion'

###Parametros
#Renato ten piedad
epocas=30 #numero de veces de iteracion en el entrenamiento
batch_size = 5 #numero de imagenes en cada paso (entrenamiento)
pasos =20 #numero de veces que se procesa en cada epoca 1000?
validation_steps = 10 #30 funcionaba                    300?
altura, longitud = 150, 150 #tamaño al cual vamos a procesar nuestras imagenes
filtrosConv1 = 32           #profundidad de los filtros convolucionales en cada capa convolucional.
filtrosConv2 = 64           
filtrosConv3 = 128

tamano_filtro1 = (3, 3)     #tamaño de los filtros convolucionales en cada capa convolucional.
tamano_filtro2 = (2, 2)
tamano_filtro3 = (1, 1)

tamano_pool = (2, 2)
clases = 3 
lr = 0.000008

###Preprocesamiento 1
entrenamiento_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest',
    preprocessing_function=tf.keras.applications.resnet.preprocess_input,
    )

validacion_datagen = ImageDataGenerator(
    rescale=1./255,
    preprocessing_function=tf.keras.applications.resnet.preprocess_input,
    )

imagen_entrenamiento = entrenamiento_datagen.flow_from_directory(
    data_entrenamiento,
    target_size=(altura, longitud),
    batch_size=batch_size,
    class_mode='categorical',
    shuffle=True
)

imagen_validacion = validacion_datagen.flow_from_directory(
    data_validacion,
    target_size=(altura, longitud),
    batch_size=batch_size,
    class_mode='categorical',
    shuffle=True
)

###Modelo CNN con 3 capas convolucionales

modelo = Sequential()
# Capa convolucional 1
modelo.add(Conv2D(filtrosConv1, tamano_filtro1, padding='same', input_shape=(longitud, altura, 3), activation='relu'))
modelo.add(MaxPooling2D(pool_size=tamano_pool))

# Capa convolucional 2
modelo.add(Conv2D(filtrosConv2, tamano_filtro2, padding='same', activation='relu'))
modelo.add(MaxPooling2D(pool_size=tamano_pool))

# Capa convolucional 3
modelo.add(Conv2D(filtrosConv2, tamano_filtro2, padding='same', activation='relu'))
modelo.add(MaxPooling2D(pool_size=tamano_pool))

# Capa flatten y capa densa
modelo.add(Flatten())

modelo.add(Dense(256, activation='relu')) #mandar a capa normal
modelo.add(Dropout(0.5)) #apagan 50%-evitar sobreajuste"""

# Capa de salida con activación softmax
modelo.add(Dense(clases, activation='softmax'))

#Compilación del modelo
modelo.compile(loss='categorical_crossentropy', optimizer=Adam(learning_rate=lr), metrics=['accuracy'])


history=modelo.fit(
    imagen_entrenamiento,
    steps_per_epoch=pasos,
    epochs=epocas,
    validation_data=imagen_validacion,
    validation_steps=validation_steps
)

dir='./modelo/'

if not os.path.exists(dir):
    os.mkdir(dir)
modelo.save('./modelo/modelo.h5')
modelo.save_weights('./modelo/pesos.h5')