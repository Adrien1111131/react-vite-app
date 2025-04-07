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
      // Paramètres optimisés pour la synthèse vocale
      const voiceSettings = {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true
      };

      // Convertir les marqueurs en SSML
      const convertToSSML = (text) => {
        let ssmlText = text
          // Retirer les anciens marqueurs
          .replace(/\[(.*?)\]/g, '')
          .replace(/\[\/(.*?)\]/g, '');

        // Ajouter les balises SSML de base
        ssmlText = `<speak>${ssmlText}</speak>`;

        // Remplacer les marqueurs d'intensité par des balises SSML
        ssmlText = ssmlText
          // Chuchotement
          .replace(/\{chuchoté\}(.*?)\{\/chuchoté\}/g, '<amazon:effect name="whispered">$1</amazon:effect>')
          // Voix intense
          .replace(/\{intense\}(.*?)\{\/intense\}/g, '<prosody rate="fast" pitch="high" volume="loud">$1</prosody>')
          // Voix excitée
          .replace(/\{excité\}(.*?)\{\/excité\}/g, '<prosody rate="medium" pitch="high" volume="medium">$1</prosody>')
          // Voix douce
          .replace(/\{doux\}(.*?)\{\/doux\}/g, '<prosody rate="slow" pitch="low" volume="soft">$1</prosody>')
          // Pauses
          .replace(/\.\.\./g, '<break time="1s"/>')
          .replace(/;/g, '<break time="0.5s"/>');

        return ssmlText;
      };

      // Convertir le texte en SSML
      const ssmlText = convertToSSML(text);
      console.log('Texte SSML:', ssmlText.substring(0, 100) + '...');

      console.log('Configuration de la requête:', {
        url: `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
        model: "eleven_multilingual_v2",
        settings: voiceSettings
      });

      // Configuration de la requête avec support SSML
      const requestConfig = {
        text: ssmlText,
        model_id: "eleven_multilingual_v2",
        voice_settings: voiceSettings,
        optimize_streaming_latency: 0,
        output_format: "mp3_44100_128",
        generation_config: {
          enable_ssml: true
        }
      };

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
              ...requestConfig
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
