// Script de test pour le serveur proxy
import axios from 'axios';
import fs from 'fs';

// Configuration
const TEST_TEXT = 'Ceci est un test du serveur proxy pour vérifier que la génération audio fonctionne correctement.';
const VOICE_ID = 'jYbIbRQItNRT50QRPtCj';

// Fonction de test
async function testProxyServer() {
  console.log('Démarrage du test du serveur proxy...');
  console.log(`Voice ID: ${VOICE_ID}`);
  console.log(`Texte de test: "${TEST_TEXT}"`);
  
  try {
    console.log('Envoi de la requête au serveur proxy...');
    
    const response = await axios.post('http://localhost:3001/api/text-to-speech', {
      text: TEST_TEXT,
      voice_id: VOICE_ID
    });
    
    console.log('Réponse reçue avec succès !');
    console.log('Status:', response.status);
    console.log('Headers:', JSON.stringify(response.headers));
    
    // Vérifier si la réponse contient des données audio
    if (response.data && response.data.audio) {
      console.log('Données audio reçues, longueur:', response.data.audio.length);
      
      // Convertir les données base64 en buffer
      const audioBuffer = Buffer.from(response.data.audio, 'base64');
      
      // Sauvegarder l'audio dans un fichier pour vérification
      fs.writeFileSync('test-proxy-audio.mp3', audioBuffer);
      console.log('Audio sauvegardé dans test-proxy-audio.mp3');
      
      return true;
    } else {
      console.error('Pas de données audio dans la réponse');
      console.error('Réponse:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de l\'appel au serveur proxy:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', JSON.stringify(error.response.headers));
      console.error('Data:', error.response.data);
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
testProxyServer()
  .then(success => {
    if (success) {
      console.log('Test réussi ! Le serveur proxy fonctionne correctement avec l\'API Eleven Labs.');
    } else {
      console.log('Test échoué. Vérifiez les erreurs ci-dessus.');
    }
  })
  .catch(err => {
    console.error('Erreur inattendue lors du test:', err);
  });
