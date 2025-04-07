// api/text-to-speech.js - Version Edge Function
export const config = {
  runtime: 'edge',
};

// Clé API
const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY || 'sk_9d60c1fd5b3a2a89f13918268561766d648450f4042d4809';

// Fonction utilitaire pour convertir ArrayBuffer en Base64
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

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
    
    console.log('Données reçues:', {
      textLength: text?.length,
      textPreview: text?.substring(0, 100) + '...',
      voice_id
    });
    
    if (!text || !voice_id) {
      throw new Error('Le texte et l\'ID de la voix sont requis');
    }
    
    // Ajouter un timeout à la requête fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes max
    
    try {
      // Fonction pour ajuster les paramètres vocaux selon l'intensité
      const getVoiceSettings = (text) => {
        // Paramètres par défaut
        const defaultSettings = {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
          speaking_rate: 1.0
        };

        // Détecter l'intensité du passage
        if (text.includes('[intense]')) {
          return {
            stability: 0.3,            // Plus instable pour plus d'émotion
            similarity_boost: 0.85,     // Garder la voix reconnaissable
            style: 0.7,                // Style plus expressif
            use_speaker_boost: true,
            speaking_rate: 1.1         // Plus rapide
          };
        } else if (text.includes('[excité]')) {
          return {
            stability: 0.4,
            similarity_boost: 0.8,
            style: 0.6,
            use_speaker_boost: true,
            speaking_rate: 1.05
          };
        } else if (text.includes('[doux]')) {
          return {
            stability: 0.6,            // Plus stable pour une voix douce
            similarity_boost: 0.7,
            style: 0.4,                // Style plus doux
            use_speaker_boost: true,
            speaking_rate: 0.95        // Plus lent
          };
        }

        return defaultSettings;
      };

      // Obtenir les paramètres vocaux selon le contenu
      const voiceSettings = getVoiceSettings(text);

      console.log('Configuration de la requête:', {
        url: `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
        model: "eleven_multilingual_v2",
        settings: voiceSettings
      });

      // Préparer le texte en conservant les expressions vocales
      const cleanText = text
        .replace(/\[(doux|excité|intense|mystérieux|direct)\]/g, '')
        .replace(/\[\/(doux|excité|intense|mystérieux|direct)\]/g, '')
        .replace(/\.\.\./g, '... ') // Ajouter un espace après les points de suspension
        .replace(/;/g, '... ') // Convertir les points-virgules en pauses
        .replace(/,/g, ', '); // Assurer un espace après les virgules
      console.log('Texte nettoyé:', cleanText.substring(0, 100) + '...');

      // Fonction pour faire une requête avec retry
      const makeRequest = async (retryCount = 0) => {
        try {
          const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': ELEVEN_LABS_API_KEY
            },
            body: JSON.stringify({
              text: cleanText,
              model_id: "eleven_multilingual_v2",
              voice_settings: voiceSettings
            }),
            signal: controller.signal
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Erreur de l\'API:', {
              status: response.status,
              error: errorText,
              headers: Object.fromEntries(response.headers),
              attempt: retryCount + 1
            });

            // Retry sur certaines erreurs
            if ((response.status === 500 || response.status === 429) && retryCount < 2) {
              const delay = Math.min(2000 * Math.pow(2, retryCount), 8000);
              console.log(`Attente de ${delay}ms avant retry ${retryCount + 1}/2...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              return makeRequest(retryCount + 1);
            }

            throw new Error(`Erreur API Eleven Labs: ${response.status} - ${errorText}`);
          }

          return response;
        } catch (error) {
          if (retryCount < 2) {
            const delay = Math.min(2000 * Math.pow(2, retryCount), 8000);
            console.log(`Retry ${retryCount + 1}/2 après erreur:`, error.message);
            await new Promise(resolve => setTimeout(resolve, delay));
            return makeRequest(retryCount + 1);
          }
          throw error;
        }
      };

      // Faire la requête avec retry
      const response = await makeRequest();
      
      // Nettoyer le timeout
      clearTimeout(timeoutId);
      
      // Log de la réponse
      console.log('Réponse reçue:', {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers)
      });
      
      // Récupérer les données binaires
      const arrayBuffer = await response.arrayBuffer();
      console.log('Données audio reçues:', {
        size: arrayBuffer.byteLength,
        type: response.headers.get('content-type')
      });
      
      // Convertir en base64
      const audioBase64 = arrayBufferToBase64(arrayBuffer);
      
      return new Response(JSON.stringify({ 
        audio: audioBase64,
        format: 'audio/mpeg'
      }), { status: 200, headers });
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Timeout de la requête après 3 minutes');
        throw new Error('La requête a été interrompue après le délai maximum');
      }
      throw error;
    }
  } catch (error) {
    console.error('Erreur détaillée:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    // Détails supplémentaires pour le débogage
    const errorDetails = {
      message: 'Impossible de générer l\'audio',
      details: error.message,
      type: error.name,
      stack: error.stack
    };
    
    if (error.response) {
      errorDetails.status = error.response.status;
      errorDetails.headers = error.response.headers;
      errorDetails.data = error.response.data;
      console.error('Détails de la réponse en erreur:', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data
      });
    }
    
    return new Response(JSON.stringify({ 
      error: errorDetails
    }), { status: 500, headers });
  }
}
