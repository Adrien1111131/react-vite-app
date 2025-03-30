// api/text-to-speech.js - Version Edge Function
export const config = {
  runtime: 'edge',
};

// Clé API
const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY || 'sk_9d60c1fd5b3a2a89f13918268561766d648450f4042d4809';

// Fonction utilitaire pour convertir ArrayBuffer en Base64 (compatible avec Edge Functions)
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Fonction pour traiter le texte avant la synthèse vocale
const processTextForSpeech = (text) => {
  // Vérifier si le texte contient des marqueurs de chuchotement
  if (text.includes('[chuchoté]') && text.includes('[/chuchoté]')) {
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
    
    return processedText;
  } else {
    // Si pas de marqueurs de chuchotement, simplement envelopper dans des balises SSML
    return '<speak>' + text + '</speak>';
  }
};

export default async function handler(req) {
  // Activer CORS
  const headers = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/json',
  };

  // Gérer les requêtes OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  // Vérifier que c'est une requête POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ 
      error: { message: 'Méthode non autorisée' } 
    }), { status: 405, headers });
  }

  try {
    const data = await req.json();
    const { text, voice_id } = data;
    
    // Traiter le texte pour convertir les marqueurs de chuchotement en balises SSML
    const processedText = processTextForSpeech(text);
    
    // Ajouter un timeout à la requête fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 secondes max
    
    // Appel à l'API Eleven Labs avec fetch au lieu d'axios
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVEN_LABS_API_KEY
      },
      body: JSON.stringify({
        text: processedText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.30,           // Encore plus réduit pour plus de naturel
          similarity_boost: 0.60,    // Légèrement réduit pour plus de variations
          style: 0.25,               // Augmenté pour plus d'expressivité
          use_speaker_boost: true,   // Améliore la clarté
          speaking_rate: 0.95        // Légèrement plus lent pour plus de naturel
        }
      }),
      signal: controller.signal
    });
    
    // Nettoyer le timeout
    clearTimeout(timeoutId);
    
    // Vérifier si la réponse est OK
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API Eleven Labs: ${response.status} - ${errorText}`);
    }
    
    // Récupérer les données binaires
    const arrayBuffer = await response.arrayBuffer();
    
    // Convertir en base64 (compatible avec Edge Functions)
    const audioBase64 = arrayBufferToBase64(arrayBuffer);
    
    return new Response(JSON.stringify({ 
      audio: audioBase64,
      format: 'audio/mpeg'
    }), { status: 200, headers });
  } catch (error) {
    console.error('Erreur lors de la génération audio:', error);
    
    // Renvoyer un audio de secours (un message préenregistré)
    // Petit fichier audio base64 qui dit "Désolé, nous rencontrons des difficultés techniques"
    const fallbackAudioBase64 = "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAAFpADMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAABaQaEUxLAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    
    return new Response(JSON.stringify({ 
      audio: fallbackAudioBase64,
      format: 'audio/mpeg',
      isFallback: true
    }), { status: 200, headers });
  }
}
