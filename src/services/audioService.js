// src/services/audioService.js
import axios from 'axios';

// Voix clonée de l'utilisateur
export const VOICE_ID = "yNvuJLb8o2Kg3JWiPBsR";

// Cache pour les segments audio
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

// Configuration des segments
const SEGMENT_CONFIG = {
  minLength: 150,          // Longueur minimum d'un segment
  maxLength: 200,          // Longueur maximum d'un segment
  overlapPercent: 20,      // Pourcentage de chevauchement
  transitionPoints: ['.', '!', '?', '...', ';'], // Points de découpage naturels
  crossfadeDuration: 0.5   // Durée du crossfade en secondes
};

// Fonction pour appliquer un crossfade entre deux buffers audio
const applyCrossfade = (buffer1, buffer2, audioContext) => {
  const sampleRate = audioContext.sampleRate;
  const crossfadeSamples = Math.floor(SEGMENT_CONFIG.crossfadeDuration * sampleRate);
  
  const buffer1Data = new Float32Array(buffer1);
  const buffer2Data = new Float32Array(buffer2);
  
  // Créer un nouveau buffer pour le résultat
  const combinedLength = buffer1Data.length + buffer2Data.length - crossfadeSamples;
  const result = new Float32Array(combinedLength);
  
  // Copier le premier buffer jusqu'au point de crossfade
  for (let i = 0; i < buffer1Data.length - crossfadeSamples; i++) {
    result[i] = buffer1Data[i];
  }
  
  // Appliquer le crossfade
  for (let i = 0; i < crossfadeSamples; i++) {
    const fadeOutGain = Math.cos((i / crossfadeSamples) * Math.PI / 2);
    const fadeInGain = Math.sin((i / crossfadeSamples) * Math.PI / 2);
    
    const pos1 = buffer1Data.length - crossfadeSamples + i;
    const pos2 = i;
    
    result[pos1] = buffer1Data[pos1] * fadeOutGain + 
                   buffer2Data[pos2] * fadeInGain;
  }
  
  // Copier le reste du deuxième buffer
  for (let i = crossfadeSamples; i < buffer2Data.length; i++) {
    result[buffer1Data.length - crossfadeSamples + i] = buffer2Data[i];
  }
  
  return result.buffer;
};

// Fonction pour concaténer les buffers audio avec crossfade
const concatenateArrayBuffers = async (buffers) => {
  if (buffers.length === 0) return new ArrayBuffer(0);
  if (buffers.length === 1) return buffers[0];
  
  // Créer un contexte audio temporaire pour le traitement
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  let result = buffers[0];
  for (let i = 1; i < buffers.length; i++) {
    result = await applyCrossfade(result, buffers[i], audioContext);
  }
  
  // Fermer le contexte audio
  await audioContext.close();
  
  return result;
};

export const generateAudio = async (text) => {
  // Nombre maximum de tentatives par segment
  const MAX_RETRIES = 3;
  
  try {
    console.log('Service audioService: Début de la génération audio');
    console.log('Texte reçu:', {
      longueur: text.length,
      aperçu: text.substring(0, 100) + '...'
    });
    
    // Diviser le texte en segments avec chevauchement
    const segments = splitTextIntoSegments(text, SEGMENT_CONFIG);
    console.log('Texte divisé en segments:', {
      nombreSegments: segments.length,
      tailles: segments.map(s => s.length)
    });
    
    // Fonction pour générer l'audio d'un segment avec retries
    const generateSegmentWithRetry = async (segment, index) => {
      let retryCount = 0;
      
      // Vérifier si le segment est dans le cache
      const cacheKey = segment.trim();
      if (audioCache.has(cacheKey)) {
        console.log(`Segment ${index + 1} trouvé dans le cache`);
        return {
          data: {
            audio: audioCache.get(cacheKey),
            format: "audio/mpeg"
          }
        };
      }
      
      const attemptGeneration = async () => {
        try {
          console.log(`Génération du segment ${index + 1}/${segments.length}:`, {
            tentative: retryCount + 1,
            longueur: segment.length,
            aperçu: segment.substring(0, 50) + '...'
          });
          
          // Appel à l'API avec timeout plus long
          const response = await axios.post('/api/text-to-speech', {
            text: segment,
            voice_id: VOICE_ID
          }, {
            timeout: 180000, // 180 secondes (3 minutes)
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          // Mettre en cache le segment réussi
          if (response.data.audio) {
            audioCache.set(cacheKey, response.data.audio);
          }
          
          console.log(`Segment ${index + 1}/${segments.length} généré avec succès:`, {
            tailleDonnées: response.data.audio?.length || 0
          });
          return response;
        } catch (error) {
          console.error(`Erreur lors de la génération du segment ${index + 1}:`, {
            message: error.message,
            response: {
              status: error.response?.status,
              data: error.response?.data,
              headers: error.response?.headers
            },
            config: {
              url: error.config?.url,
              method: error.config?.method,
              timeout: error.config?.timeout
            }
          });
          
          // Si nous n'avons pas atteint le nombre maximum de tentatives, réessayer
          if (retryCount < MAX_RETRIES - 1) {
            retryCount++;
            console.log(`Nouvelle tentative ${retryCount}/${MAX_RETRIES} pour le segment ${index + 1}...`);
            
            // Attendre un peu avant de réessayer (délai exponentiel)
            const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
            console.log(`Attente de ${delay}ms avant la prochaine tentative...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            
            return attemptGeneration();
          }
          
          // Si toutes les tentatives ont échoué, retourner un segment vide mais ne pas interrompre le processus
          console.error(`Toutes les tentatives ont échoué pour le segment ${index + 1}, on continue avec les autres segments`);
          return {
            data: {
              audio: "", // Segment vide
              format: "audio/mpeg"
            }
          };
        }
      };
      
      return attemptGeneration();
    };
    
    // Traiter les segments de manière séquentielle
    const processedSegments = [];
    for (let i = 0; i < segments.length; i++) {
      const response = await generateSegmentWithRetry(segments[i], i);
      processedSegments.push(response);
    }
    
    console.log('Traitement des segments terminé:', {
      total: processedSegments.length,
      réussis: processedSegments.filter(r => r.data.audio).length
    });
    
    // Filtrer les segments vides
    const validResponses = processedSegments.filter(response => response.data.audio);
    
    if (validResponses.length === 0) {
      throw new Error("Aucun segment audio n'a pu être généré");
    }
    
    console.log('Segments valides:', {
      nombre: validResponses.length,
      tailles: validResponses.map(r => r.data.audio.length)
    });
    
    // Convertir tous les segments base64 en ArrayBuffers
    const audioBuffers = validResponses.map(response => 
      base64ToArrayBuffer(response.data.audio)
    );
    
    // Concaténer tous les ArrayBuffers en un seul
    console.log('Concaténation des segments audio...');
    const combinedBuffer = concatenateArrayBuffers(audioBuffers);
    
    // Reconvertir en base64 pour le retour
    const combinedBase64 = arrayBufferToBase64(combinedBuffer);
    
    console.log('Audio combiné généré avec succès:', {
      tailleTotale: combinedBase64.length
    });
    
    // Retourner l'audio combiné
    return {
      success: true,
      audioData: [combinedBase64], // Toujours dans un tableau pour compatibilité
      format: validResponses[0].data.format
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

// Fonction améliorée pour diviser le texte en segments avec chevauchement
const splitTextIntoSegments = (text, config) => {
  const segments = [];
  let currentPos = 0;
  
  while (currentPos < text.length) {
    // Déterminer la fin potentielle du segment
    let endPos = currentPos + config.maxLength;
    if (endPos > text.length) endPos = text.length;
    
    // Chercher le meilleur point de coupure
    let cutPoint = endPos;
    let bestTransitionPoint = -1;
    
    // Chercher le dernier point de transition dans la plage acceptable
    for (const point of config.transitionPoints) {
      const lastIndex = text.lastIndexOf(point, endPos);
      if (lastIndex > currentPos + config.minLength && lastIndex > bestTransitionPoint) {
        bestTransitionPoint = lastIndex + 1; // Inclure le point de ponctuation
      }
    }
    
    // Si on a trouvé un bon point de transition, l'utiliser
    if (bestTransitionPoint !== -1) {
      cutPoint = bestTransitionPoint;
    }
    
    // Extraire le segment
    const segment = text.substring(currentPos, cutPoint).trim();
    if (segment) segments.push(segment);
    
    // Calculer la position suivante avec chevauchement
    const overlap = Math.floor((cutPoint - currentPos) * (config.overlapPercent / 100));
    currentPos = cutPoint - overlap;
    
    // S'assurer qu'on avance toujours
    if (currentPos <= 0 || currentPos >= text.length) break;
  }
  
  return segments;
};
