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

// Fonction pour concaténer plusieurs ArrayBuffers en un seul
const concatenateArrayBuffers = (buffers) => {
  // Calculer la taille totale
  const totalLength = buffers.reduce((acc, buffer) => acc + buffer.byteLength, 0);
  
  // Créer un nouveau buffer de la taille totale
  const result = new Uint8Array(totalLength);
  
  // Copier chaque buffer dans le résultat
  let offset = 0;
  buffers.forEach(buffer => {
    result.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  });
  
  return result.buffer;
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
    
    // Diviser le texte en segments plus petits pour une meilleure fiabilité
    const segments = splitTextIntoSegments(text, 100); // Réduire à 100 caractères pour plus de stabilité
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

// Fonction utilitaire pour diviser le texte en segments plus petits
const splitTextIntoSegments = (text, maxLength = 1000) => {
  // Si le texte est déjà assez court, le renvoyer tel quel
  if (text.length <= maxLength) {
    return [text];
  }
  
  // Diviser le texte en respectant les structures naturelles
  const segments = [];
  
  // D'abord, diviser par paragraphes
  const paragraphs = text.split('\n');
  let currentSegment = '';
  let currentParagraphGroup = [];
  
  for (const paragraph of paragraphs) {
    // Si le paragraphe lui-même est très long, le diviser en phrases
    if (paragraph.length > maxLength) {
      // Ajouter le segment courant s'il existe
      if (currentSegment) {
        segments.push(currentSegment);
        currentSegment = '';
        currentParagraphGroup = [];
      }
      
      // Diviser le paragraphe en phrases
      const sentenceDelimiters = /(?<=[.!?])\s+/g;
      const sentences = paragraph.split(sentenceDelimiters);
      
      let sentenceGroup = '';
      for (const sentence of sentences) {
        if (!sentence.trim()) continue;
        
        // Si l'ajout de cette phrase dépasse la limite, créer un nouveau segment
        if (sentenceGroup.length + sentence.length > maxLength) {
          if (sentenceGroup) {
            segments.push(sentenceGroup);
          }
          
          // Si la phrase elle-même est trop longue, la diviser en morceaux
          if (sentence.length > maxLength) {
            const chunks = [];
            let i = 0;
            while (i < sentence.length) {
              // Chercher un bon point de coupure (après une virgule ou un espace)
              let cutPoint = i + maxLength;
              if (cutPoint >= sentence.length) {
                cutPoint = sentence.length;
              } else {
                // Reculer jusqu'à trouver une virgule ou un espace
                const lastComma = sentence.lastIndexOf(',', cutPoint);
                const lastSpace = sentence.lastIndexOf(' ', cutPoint);
                
                if (lastComma > i && lastComma > lastSpace) {
                  cutPoint = lastComma + 1; // Inclure la virgule
                } else if (lastSpace > i) {
                  cutPoint = lastSpace + 1; // Inclure l'espace
                }
                // Si on n'a pas trouvé de bon point de coupure, on coupe simplement à maxLength
              }
              
              chunks.push(sentence.substring(i, cutPoint));
              i = cutPoint;
            }
            
            // Ajouter les morceaux comme segments séparés
            for (const chunk of chunks) {
              segments.push(chunk);
            }
          } else {
            sentenceGroup = sentence;
          }
        } else {
          sentenceGroup += (sentenceGroup ? ' ' : '') + sentence;
        }
      }
      
      // Ajouter le dernier groupe de phrases s'il n'est pas vide
      if (sentenceGroup) {
        segments.push(sentenceGroup);
      }
    } else {
      // Pour les paragraphes normaux, essayer de les regrouper intelligemment
      if (currentSegment.length + paragraph.length + 1 > maxLength) {
        // Si l'ajout du paragraphe dépasse la taille maximale, commencer un nouveau segment
        segments.push(currentSegment);
        currentSegment = paragraph;
        currentParagraphGroup = [paragraph];
      } else {
        // Sinon, ajouter le paragraphe au segment actuel
        currentSegment += (currentSegment ? '\n' : '') + paragraph;
        currentParagraphGroup.push(paragraph);
      }
    }
  }
  
  // Ajouter le dernier segment s'il n'est pas vide
  if (currentSegment) {
    segments.push(currentSegment);
  }
  
  return segments;
};
