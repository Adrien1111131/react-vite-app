// src/services/audioService.js
import axios from 'axios';

// Voix clonée de l'utilisateur
export const VOICE_ID = "yNvuJLb8o2Kg3JWiPBsR";

// Cache pour l'audio
const audioCache = new Map();

// Configuration des segments
const SEGMENT_CONFIG = {
  maxChars: 2000,  // Limite de caractères par segment
  // Points de découpage naturels, par priorité
  breakPoints: [
    /\. (?=[A-Z])/,  // Fin de phrase suivie d'une majuscule
    /[.!?] /,        // Fins de phrases normales
    /[;:] /,         // Ponctuation moyenne
    /, /,            // Virgules
    / /              // Dernier recours : espaces
  ]
};

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

// Fonction pour trouver le meilleur point de coupure
const findBreakPoint = (text, maxLength) => {
  // Si le texte est déjà assez court, le retourner tel quel
  if (text.length <= maxLength) {
    return text.length;
  }

  // Chercher le meilleur point de coupure
  for (const pattern of SEGMENT_CONFIG.breakPoints) {
    let lastMatch = -1;
    let match;
    const regex = new RegExp(pattern);

    // Trouver le dernier point de coupure avant maxLength
    while ((match = regex.exec(text)) !== null) {
      if (match.index > maxLength) break;
      lastMatch = match.index + match[0].length;
      regex.lastIndex = match.index + 1; // Continuer la recherche
    }

    if (lastMatch > 0) {
      return lastMatch;
    }
  }

  // Si aucun point de coupure n'est trouvé, couper au maxLength
  return maxLength;
};

// Fonction pour découper le texte en segments
const splitIntoSegments = (text) => {
  const segments = [];
  let currentPos = 0;

  while (currentPos < text.length) {
    const remainingText = text.slice(currentPos);
    const breakPoint = findBreakPoint(remainingText, SEGMENT_CONFIG.maxChars);
    const segment = remainingText.slice(0, breakPoint).trim();
    
    if (segment) segments.push(segment);
    currentPos += breakPoint;
  }

  return segments;
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

// Fonction pour générer l'audio d'un segment
const generateSegmentAudio = async (segment, retryCount = 0) => {
  try {
    console.log('Génération du segment:', {
      longueur: segment.length,
      aperçu: segment.substring(0, 50) + '...'
    });

    // Ajouter les pauses SSML
    const ssmlText = addSSMLPauses(segment);

    const response = await axios.post('/api/text-to-speech', {
      text: ssmlText,
      voice_id: VOICE_ID
    }, {
      timeout: 60000, // 1 minute par segment
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Erreur génération segment:', error);

    // Retry sur certaines erreurs
    if (retryCount < 2) {
      const delay = Math.min(2000 * Math.pow(2, retryCount), 8000);
      console.log(`Attente de ${delay}ms avant nouvelle tentative...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateSegmentAudio(segment, retryCount + 1);
    }

    throw error;
  }
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

    // Découper le texte en segments
    const segments = splitIntoSegments(text);
    console.log('Texte découpé en segments:', {
      nombre: segments.length,
      tailles: segments.map(s => s.length)
    });

    // Générer l'audio pour chaque segment
    const audioSegments = [];
    for (const segment of segments) {
      const result = await generateSegmentAudio(segment);
      if (result.audio) {
        audioSegments.push(result.audio);
      }
    }

    // Vérifier qu'on a des segments valides
    if (audioSegments.length === 0) {
      throw new Error("Aucun segment audio n'a pu être généré");
    }

    // Combiner les segments
    const combinedBase64 = audioSegments.join('');

    // Mettre en cache le résultat final
    audioCache.set(cacheKey, combinedBase64);

    console.log('Audio combiné généré avec succès:', {
      nombreSegments: audioSegments.length,
      tailleTotale: combinedBase64.length
    });

    // Retourner l'audio combiné
    return {
      success: true,
      audioData: [combinedBase64],
      format: "audio/mpeg"
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
