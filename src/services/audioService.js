// src/services/audioService.js
import axios from 'axios';

// Voix clonée de l'utilisateur
export const VOICE_ID = "jYbIbRQItNRT50QRPtCj";

export const generateAudio = async (text) => {
  // Nombre maximum de tentatives par segment
  const MAX_RETRIES = 3;
  
  try {
    console.log('Service audioService: Début de la génération audio');
    console.log('Texte reçu de longueur:', text.length);
    
    // Diviser le texte en segments si nécessaire (l'API a des limites de taille)
    const segments = splitTextIntoSegments(text);
    console.log('Texte divisé en', segments.length, 'segments');
    
    // Fonction pour générer l'audio d'un segment avec retries
    const generateSegmentWithRetry = async (segment, index) => {
      let retryCount = 0;
      
      const attemptGeneration = async () => {
        try {
          console.log(`Segment ${index + 1}/${segments.length}, tentative ${retryCount + 1}/${MAX_RETRIES}`);
          
          // Appel à l'API avec timeout plus long
          const response = await axios.post('/api/text-to-speech', {
            text: segment,
            voice_id: VOICE_ID
          }, {
            timeout: 60000, // 60 secondes
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          return response;
        } catch (error) {
          console.error(`Erreur lors de la génération du segment ${index + 1}:`, error.message);
          
          // Si nous n'avons pas atteint le nombre maximum de tentatives, réessayer
          if (retryCount < MAX_RETRIES - 1) {
            retryCount++;
            console.log(`Erreur, nouvelle tentative ${retryCount}/${MAX_RETRIES} pour le segment ${index + 1}...`);
            
            // Attendre un peu avant de réessayer (backoff exponentiel)
            const delay = 1000 * Math.pow(2, retryCount);
            console.log(`Attente de ${delay}ms avant la prochaine tentative...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            
            return attemptGeneration();
          }
          
          // Si toutes les tentatives ont échoué, lancer l'erreur
          throw error;
        }
      };
      
      return attemptGeneration();
    };
    
    // Générer l'audio pour chaque segment avec retries
    console.log('Envoi des requêtes à l\'API serverless avec retries...');
    const audioPromises = segments.map(generateSegmentWithRetry);
    
    // Attendre que tous les segments soient traités
    console.log('Attente des réponses de l\'API serverless...');
    const audioResponses = await Promise.all(audioPromises);
    console.log('Toutes les réponses reçues:', audioResponses.length);
    
    // Combiner les segments audio (ou renvoyer le premier si un seul segment)
    return {
      success: true,
      audioData: audioResponses.map(response => response.data.audio),
      format: audioResponses[0].data.format
    };
  } catch (error) {
    console.error('Erreur lors de la génération audio:', error);
    console.error('Stack trace:', error.stack);
    
    // Détails supplémentaires pour le débogage
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', JSON.stringify(error.response.headers));
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('Requête envoyée mais pas de réponse reçue');
      console.error('Request:', error.request);
    } else {
      console.error('Erreur lors de la configuration de la requête');
    }
    
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
  
  // Sinon, diviser en paragraphes et regrouper en segments
  const paragraphs = text.split('\n');
  const segments = [];
  let currentSegment = '';
  
  for (const paragraph of paragraphs) {
    // Si l'ajout du paragraphe dépasse la taille maximale, commencer un nouveau segment
    if (currentSegment.length + paragraph.length + 1 > maxLength) {
      segments.push(currentSegment);
      currentSegment = paragraph;
    } else {
      // Sinon, ajouter le paragraphe au segment actuel
      currentSegment += (currentSegment ? '\n' : '') + paragraph;
    }
  }
  
  // Ajouter le dernier segment s'il n'est pas vide
  if (currentSegment) {
    segments.push(currentSegment);
  }
  
  return segments;
};
