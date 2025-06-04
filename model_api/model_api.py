from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import io
import os

# Load model and class labels
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'dog_breed_xception.keras')
model = load_model(MODEL_PATH)
# model = load_model("dog_breed_xception.keras")
class_labels =  [
    "Chihuahua", "Japanese_spaniel", "Maltese_dog", "Pekinese", "Shih-Tzu",
    "Blenheim_spaniel", "Papillon", "Toy_terrier", 'Rhodesian_ridgeback',
    'Afghan_hound',
    'Basset',
    'Beagle',
    'Bloodhound',
    'Bluetick',
    'black-and-tan_coonhound',
    'Walker_hound',
    'English_foxhound',
    'Redbone',
    'Borzoi',
    'Irish_wolfhound',
    'Italian_greyhound',
    'Whippet',
    'Ibizan_hound',
    'Norwegian_elkhound',
    'Otterhound',
    'Saluki',
    'Scottish_deerhound',
    'Weimaraner',
    'Staffordshire_bullterrier',
    'American_Staffordshire_terrier',
    'Bedlington_terrier',
    'Border_terrier',
    'Kerry_blue_terrier',
    'Irish_terrier',
    'Norfolk_terrier',
    'Norwich_terrier',
    'Yorkshire_terrier',
    'wire-haired_fox_terrier',
    'Lakeland_terrier',
    'Sealyham_terrier',
    'Airedale',
    'Cairn',
    'Australian_terrier',
    'Dandie_Dinmont',
    'Boston_bull',
    'miniature_schnauzer',
    'Giant_schnauzer',
    'Standard_schnauzer',
    'Scotch_terrier',
    'Tibetan_terrier', 
    'Silky_terrier',
    'soft-coated_wheaten_terrier',
    'West_Highland_white_terrier',
    'Lhasa',
    'flat-coated_retriever',
    'curly-coated_retriever',
    'golden_retriever',
    'Labrador_retriever',
    'Chesapeake_Bay_retriever',
    'German_short-haired_pointer',
    'Vizsla',
    'English_setter',
    'Irish_setter',
    'Gordon_setter',
    'Brittany_spaniel',
    'Clumber',
    'English_springer',
    'Welsh_springer_spaniel',
    'cocker_spaniel',
    'Sussex_spaniel',
    'Irish_water_spaniel',
    'kuvasz',
    'schipperke',
    'groenendael',
    'malinois',
    'briard',
    'kelpie',
    'komondor',
    'Old_English_sheepdog',
    'Shetland_sheepdog',
    'collie',
    'Border_collie',
    'Bouvier_des_Flandres',
    'Rottweiler',
    'German_shepherd',
    'doberman',
    'miniature_pinscher',
    'Greater_Swiss_Mountain_dog',
    'Bernese_mountain_dog',
    'Appenzeller',
    'EntleBucher',
    'boxer',
    'bull_mastiff',
    'Tibetan_mastiff',
    'French_bulldog',
    'Great_Dane',
    'Saint_Bernard',
    'Eskimo_dog',
    'malamute',
    'Siberian_husky',
    'affenpinscher',
    'basenji',
    'pug',
    'Leonberg',
    'Newfoundland',
    'Great_Pyrenees',
    'Samoyed',
    'Pomeranian',
    'chow',
    'keeshond',
    'Brabancon_griffon',
    'Pembroke',
    'Cardigan',
    'toy_poodle',
    'miniature_poodle',
    'standard_poodle',
    'Mexican_hairless',
    'dingo',
    'dhole',
    'African_hunting_dog',  
]

app = Flask(__name__)

@app.route("/", methods=["GET"])
def home():
    return "🐶 Dog Breed Classifier API is running!"

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file = request.files['file']
    img = image.load_img(io.BytesIO(file.read()), target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0

    prediction = model.predict(img_array)
    predicted_index = np.argmax(prediction)
    breed = class_labels[predicted_index]
    confidence = float(prediction[0][predicted_index]) * 100

    return jsonify({
        'breed': breed,
        'confidence': round(confidence, 2)
    })

if __name__ == '__main__':
    app.run(port=5000)
