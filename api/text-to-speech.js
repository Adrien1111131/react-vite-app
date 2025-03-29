// api/text-to-speech.js
import axios from 'axios';

// Clé API
const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY || 'sk_9d60c1fd5b3a2a89f13918268561766d648450f4042d4809';

// Fonction pour traiter le texte avant la synthèse vocale
const processTextForSpeech = (text) => {
  console.log('Traitement du texte pour la synthèse vocale');
  
  // Vérifier si le texte contient des marqueurs de chuchotement
  if (text.includes('[chuchoté]') && text.includes('[/chuchoté]')) {
    console.log('Marqueurs de chuchotement détectés, conversion en balises SSML');
    
    // Envelopper le texte dans des balises SSML
    let processedText = '<speak>';
    
    // Remplacer les marqueurs de chuchotement par des balises SSML
    let currentIndex = 0;
    let startIndex, endIndex;
    
    while ((startIndex = text.indexOf('[chuchoté]', currentIndex)) !== -1) {
      // Ajouter le texte avant le marqueur
      processedText += text.substring(currentIndex, startIndex);
      
      // Trouver la fin du passage à chuchoter
      endIndex = text.indexOf('[/chuchoté]', startIndex);
      if (endIndex === -1) {
        // Si pas de marqueur de fin, considérer le reste du texte
        endIndex = text.length;
        processedText += '<amazon:effect name="whispered">' + 
          text.substring(startIndex + 10) + 
          '</amazon:effect>';
        break;
      }
      
      // Ajouter le passage à chuchoter avec les balises SSML
      processedText += '<amazon:effect name="whispered">' + 
        text.substring(startIndex + 10, endIndex) + 
        '</amazon:effect>';
      
      // Mettre à jour l'index courant
      currentIndex = endIndex + 11; // 11 = longueur de "[/chuchoté]"
    }
    
    // Ajouter le reste du texte
    if (currentIndex < text.length) {
      processedText += text.substring(currentIndex);
    }
    
    // Fermer la balise SSML
    processedText += '</speak>';
    
    console.log('Texte converti en SSML (début):', processedText.substring(0, 100) + '...');
    return processedText;
  } else {
    // Si pas de marqueurs de chuchotement, simplement envelopper dans des balises SSML
    console.log('Pas de marqueurs de chuchotement détectés');
    return '<speak>' + text + '</speak>';
  }
};

export default async function handler(req, res) {
  // Activer CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Gérer les requêtes OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Vérifier que c'est une requête POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Méthode non autorisée' } });
  }

  try {
    console.log('Requête reçue pour la génération audio');
    const { text, voice_id } = req.body;
    
    console.log('Génération audio pour:', text.substring(0, 50) + '...');
    console.log('Voice ID:', voice_id);
    console.log('API Key présente:', ELEVEN_LABS_API_KEY ? 'Oui' : 'Non');
    
    // Traiter le texte pour convertir les marqueurs de chuchotement en balises SSML
    const processedText = processTextForSpeech(text);
    console.log('Texte traité pour la synthèse vocale (début):', processedText.substring(0, 100) + '...');
    
    // Appel à l'API Eleven Labs
    const response = await axios({
      method: 'post',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVEN_LABS_API_KEY
      },
      data: {
        text: processedText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.30,           // Encore plus réduit pour plus de naturel
          similarity_boost: 0.60,    // Légèrement réduit pour plus de variations
          style: 0.25,               // Augmenté pour plus d'expressivité
          use_speaker_boost: true,   // Améliore la clarté
          speaking_rate: 0.95        // Légèrement plus lent pour plus de naturel
        }
      },
      responseType: 'arraybuffer'
    });
    
    // Renvoyer l'audio au format base64
    const audioBase64 = Buffer.from(response.data).toString('base64');
    return res.status(200).json({ 
      audio: audioBase64,
      format: 'audio/mpeg'
    });
  } catch (error) {
    console.error('Erreur lors de l\'appel à l\'API Eleven Labs:', error.response?.data || error.message);
    console.error('Stack trace:', error.stack);
    
    // Détails supplémentaires pour le débogage
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', JSON.stringify(error.response.headers));
      console.error('Data:', error.response.data);
    }
    
    return res.status(500).json({ 
      error: {
        message: 'Erreur lors de la génération audio',
        details: error.response?.data?.detail || error.message
      }
    });
  }
}
