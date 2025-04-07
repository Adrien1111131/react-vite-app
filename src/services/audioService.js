// src/services/audioService.js
import axios from 'axios';

// Voix clonée de l'utilisateur
export const VOICE_ID = "yNvuJLb8o2Kg3JWiPBsR";

// Cache pour les segments audio
const audioCache = new Map();

// Configuration des segments
const SEGMENT_CONFIG = {
  minLength: 500,          // Longueur minimum d'un segment
  maxLength: 1000,         // Longueur maximum d'un segment
  overlapPercent: 0,       // Pas besoin de chevauchement
  crossfadeDuration: 0,    // Pas besoin de crossfade
  
  // Points de découpage naturels
  transitionPoints: [
    '. ', '! ', '? ', '... ', '; ',  // Points de fin de phrase
    ' et ', ' mais ', ' car ',        // Conjonctions
    ' dans ', ' avec ', ' pour ',     // Prépositions communes
    ' alors ', ' tandis ', ' pendant' // Transitions temporelles
  ],
  
  // Expressions à préserver (ne pas couper)
  preserveExpressions: [
    'doucement', 'lentement', 'tendrement',
    'passionnément', 'intensément',
    'mmm', 'ahh', 'oh oui'
  ]
};

// Paramètres SSML optimisés
const ssmlParams = {
  intense: {
    rate: "85%",      // Plus lent pour plus d'intensité
    pitch: "-30%",    // Voix plus grave
    volume: "+6dB"    // Volume plus fort
  },
  excité: {
    rate: "95%",
    pitch: "-15%",
    volume: "+3dB"
  },
  doux: {
    rate: "90%",
    pitch: "-10%",
    volume: "medium"
  },
  râle: {
    rate: "70%",      // Très lent pour les râles
    pitch: "-40%",    // Très grave
    volume: "+8dB"    // Volume très fort
  }
};


// Fonction pour ajouter les pauses SSML
const addSSMLPauses = (text) => {
  // Entourer le texte avec les balises speak
  let ssmlText = `<speak>${text}</speak>`;

  // Fonction pour créer une balise prosody avec les paramètres
  const createProsody = (params, content) => 
    `<prosody rate="${params.rate}" pitch="${params.pitch}" volume="${params.volume}">${content}</prosody>`;

  // Remplacer les marqueurs d'intensité par des balises SSML
  ssmlText = ssmlText
    // Chuchotement
    .replace(/\{chuchoté\}(.*?)\{\/chuchoté\}/g, 
      (_, content) => createProsody(ssmlParams.doux, content))
    // Voix intense avec râles
    .replace(/\{intense\}([^{]*?(?:Mmmh|Ahhh|Oh oui)[^{]*?)\{\/intense\}/g, 
      (_, content) => createProsody(ssmlParams.râle, content))
    // Voix intense normale
    .replace(/\{intense\}(.*?)\{\/intense\}/g, 
      (_, content) => createProsody(ssmlParams.intense, content))
    // Voix excitée
    .replace(/\{excité\}(.*?)\{\/excité\}/g, 
      (_, content) => createProsody(ssmlParams.excité, content))
    // Voix douce
    .replace(/\{doux\}(.*?)\{\/doux\}/g, 
      (_, content) => createProsody(ssmlParams.doux, content))
    // Expressions de plaisir isolées
    .replace(/(Mmmh|Ahhh|Oh oui)(?:\.\.\.|!)/g, 
      (match) => createProsody(ssmlParams.râle, match))
    // Pauses
    .replace(/\.\.\./g, '<break time="1s"/>')
    .replace(/;/g, '<break time="0.5s"/>');

  return ssmlText;
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
          
          // Ajouter les pauses SSML
          const ssmlText = addSSMLPauses(segment);
          
          // Appel à l'API avec timeout plus long
          const response = await axios.post('/api/text-to-speech', {
            text: ssmlText,
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
    
    // Retourner directement le premier segment audio valide
    return {
      success: true,
      audioData: [validResponses[0].data.audio],
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

// Fonction pour vérifier si une position coupe une expression à préserver
const cutsPreservedExpression = (text, position, config) => {
  for (const expr of config.preserveExpressions) {
    const startPos = Math.max(0, position - expr.length);
    const endPos = Math.min(text.length, position + expr.length);
    const searchText = text.substring(startPos, endPos).toLowerCase();
    
    if (searchText.includes(expr)) {
      const exprStart = searchText.indexOf(expr);
      const exprEnd = exprStart + expr.length;
      const cutPoint = position - startPos;
      
      // Si la position de coupe est à l'intérieur de l'expression
      if (cutPoint > exprStart && cutPoint < exprEnd) {
        return true;
      }
    }
  }
  return false;
};

// Fonction améliorée pour diviser le texte en segments avec préservation des expressions
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
      const searchEndPos = endPos + point.length; // Inclure la longueur du point de transition
      let lastIndex = -1;
      let searchPos = searchEndPos;
      
      // Chercher tous les points de transition possibles
      while (searchPos > currentPos + config.minLength) {
        lastIndex = text.lastIndexOf(point, searchPos);
        if (lastIndex === -1 || lastIndex <= currentPos) break;
        
        // Vérifier si ce point ne coupe pas une expression à préserver
        if (!cutsPreservedExpression(text, lastIndex, config)) {
          if (lastIndex > bestTransitionPoint) {
            bestTransitionPoint = lastIndex + point.length; // Inclure le point de transition
            break;
          }
        }
        searchPos = lastIndex - 1;
      }
    }
    
    // Si on a trouvé un bon point de transition, l'utiliser
    if (bestTransitionPoint !== -1) {
      cutPoint = bestTransitionPoint;
    } else {
      // Si on n'a pas trouvé de point de transition, chercher un espace
      // qui ne coupe pas une expression à préserver
      for (let i = endPos; i > currentPos + config.minLength; i--) {
        if (text[i] === ' ' && !cutsPreservedExpression(text, i, config)) {
          cutPoint = i + 1;
          break;
        }
      }
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
