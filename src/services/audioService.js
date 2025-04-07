// src/services/audioService.js
import axios from 'axios';

// Voix clonée de l'utilisateur
export const VOICE_ID = "yNvuJLb8o2Kg3JWiPBsR";

// Cache pour l'audio
const audioCache = new Map();

// Fonction pour convertir une chaîne base64 en ArrayBuffer
const base64ToArrayBuffer = (base64) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Fonction pour convertir un ArrayBuffer en chaîne base64
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Fonction pour ajouter les pauses SSML
const addSSMLPauses = (text) => {
  // Entourer le texte avec les balises speak
  let ssmlText = `<speak>${text}</speak>`;

  // Remplacer les marqueurs d'intensité existants
  ssmlText = ssmlText
    // Chuchotement
    .replace(/\{chuchoté\}(.*?)\{\/chuchoté\}/g, '<prosody volume="soft" rate="90%">$1</prosody>')
    // Voix intense
    .replace(/\{intense\}(.*?)\{\/intense\}/g, '<prosody volume="+6dB" rate="85%" pitch="-15%">$1</prosody>')
    // Voix excitée
    .replace(/\{excité\}(.*?)\{\/excité\}/g, '<prosody volume="+3dB" rate="95%">$1</prosody>')
    // Voix douce
    .replace(/\{doux\}(.*?)\{\/doux\}/g, '<prosody volume="-3dB" rate="90%">$1</prosody>');

  // Ajouter les pauses naturelles
  ssmlText = ssmlText
    // Fins de phrases
    .replace(/\. /g, '.<break time="1s"/> ')
    .replace(/\! /g, '!<break time="1s"/> ')
    .replace(/\? /g, '?<break time="1s"/> ')
    .replace(/\.\.\. /g, '...<break time="1.5s"/> ')
    // Pauses moyennes
    .replace(/; /g, ';<break time="0.7s"/> ')
    .replace(/: /g, ':<break time="0.7s"/> ')
    // Pauses courtes
    .replace(/, /g, ',<break time="0.3s"/> ')
    // Expressions de plaisir
    .replace(/(Mmmh|Ahhh|Oh oui)([.!?])/g, '<prosody volume="+4dB" rate="80%" pitch="-20%">$1</prosody>$2');

  return ssmlText;
};

// Fonction principale pour générer l'audio
export const generateAudio = async (text) => {
  try {
    console.log('Service audioService: Début de la génération audio');
    console.log('Texte reçu:', {
      longueur: text.length,
      aperçu: text.substring(0, 100) + '...'
    });

    // Vérifier si le texte complet est dans le cache
    const cacheKey = text.trim();
    if (audioCache.has(cacheKey)) {
      console.log('Audio trouvé dans le cache');
      return {
        success: true,
        audioData: [audioCache.get(cacheKey)],
        format: "audio/mpeg"
      };
    }

    // Ajouter les pauses SSML
    const ssmlText = addSSMLPauses(text);
    console.log('SSML généré:', {
      longueur: ssmlText.length,
      aperçu: ssmlText.substring(0, 100) + '...'
    });

    // Fonction pour faire une requête avec retry
    const makeRequest = async (retryCount = 0) => {
      try {
        console.log(`Génération de l'audio (tentative ${retryCount + 1}/3)...`);
        
        const response = await axios.post('/api/text-to-speech', {
          text: ssmlText,
          voice_id: VOICE_ID
        }, {
          timeout: 300000, // 5 minutes
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log('Audio généré avec succès:', {
          tailleDonnées: response.data.audio?.length || 0
        });

        // Mettre en cache l'audio généré
        if (response.data.audio) {
          audioCache.set(cacheKey, response.data.audio);
        }

        return response;
      } catch (error) {
        console.error(`Erreur lors de la génération (tentative ${retryCount + 1}):`, {
          message: error.message,
          response: {
            status: error.response?.status,
            data: error.response?.data
          }
        });

        // Retry sur certaines erreurs
        if (retryCount < 2) {
          const delay = Math.min(2000 * Math.pow(2, retryCount), 8000);
          console.log(`Attente de ${delay}ms avant nouvelle tentative...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return makeRequest(retryCount + 1);
        }

        throw error;
      }
    };

    // Faire la requête avec retry
    const response = await makeRequest();

    // Retourner l'audio généré
    return {
      success: true,
      audioData: [response.data.audio],
      format: response.data.format || "audio/mpeg"
    };
  } catch (error) {
    console.error('Erreur lors de la génération audio:', {
      message: error.message,
      stack: error.stack,
      response: {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      }
    });
    
    return {
      success: false,
      error: {
        message: 'Impossible de générer l\'audio',
        details: error.response?.data?.error?.details || error.message
      }
    };
  }
};
