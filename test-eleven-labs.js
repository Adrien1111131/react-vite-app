// Script de test pour l'API Eleven Labs
import axios from 'axios';
import fs from 'fs';

// Configuration
const ELEVEN_LABS_API_KEY = 'sk_6b26b8268a75f0232b247db9b7ae203294c61257443ab2c9';
const VOICE_ID = 'jYbIbRQItNRT50QRPtCj';
const TEST_TEXT = 'Ceci est un test de l\'API Eleven Labs pour vérifier que la génération audio fonctionne correctement.';

// Fonction de test
async function testElevenLabsAPI() {
  console.log('Démarrage du test de l\'API Eleven Labs...');
  console.log(`Voice ID: ${VOICE_ID}`);
  console.log(`Texte de test: "${TEST_TEXT}"`);
  
  try {
    console.log('Envoi de la requête à l\'API Eleven Labs...');
    
    const response = await axios({
      method: 'post',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVEN_LABS_API_KEY
      },
      data: {
        text: TEST_TEXT,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      responseType: 'arraybuffer'
    });
    
    console.log('Réponse reçue avec succès !');
    console.log('Status:', response.status);
    console.log('Headers:', JSON.stringify(response.headers));
    console.log('Taille des données audio:', response.data.length, 'octets');
    
    // Sauvegarder l'audio dans un fichier pour vérification
    fs.writeFileSync('test-audio.mp3', response.data);
    console.log('Audio sauvegardé dans test-audio.mp3');
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'appel à l\'API Eleven Labs:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', JSON.stringify(error.response.headers));
      
      // Convertir arraybuffer en texte si c'est une erreur
      const errorData = error.response.data instanceof Buffer 
        ? Buffer.from(error.response.data).toString('utf8')
        : error.response.data;
      
      console.error('Données d\'erreur:', errorData);
    } else if (error.request) {
      console.error('Requête envoyée mais pas de réponse reçue');
      console.error('Request:', error.request);
    } else {
      console.error('Erreur lors de la configuration de la requête:', error.message);
    }
    
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Exécuter le test
testElevenLabsAPI()
  .then(success => {
    if (success) {
      console.log('Test réussi ! L\'API Eleven Labs fonctionne correctement.');
    } else {
      console.log('Test échoué. Vérifiez les erreurs ci-dessus.');
    }
  })
  .catch(err => {
    console.error('Erreur inattendue lors du test:', err);
  });
