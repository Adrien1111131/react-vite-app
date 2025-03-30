// src/services/audioService.js
import axios from 'axios';

// Voix clonée de l'utilisateur
export const VOICE_ID = "jYbIbRQItNRT50QRPtCj";

export const generateAudio = async (text) => {
  try {
    console.log('Service audioService: Début de la génération audio');
    console.log('Texte reçu de longueur:', text.length);
    
    // Diviser le texte en segments si nécessaire (l'API a des limites de taille)
    const segments = splitTextIntoSegments(text);
    console.log('Texte divisé en', segments.length, 'segments');
    
    // Générer l'audio pour chaque segment
    console.log('Envoi des requêtes à l\'API serverless...');
    const audioPromises = segments.map((segment, index) => {
      console.log(`Segment ${index + 1}/${segments.length}, longueur: ${segment.length} caractères`);
      return axios.post('/api/text-to-speech', {
        text: segment,
        voice_id: VOICE_ID
      });
    });
    
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
const splitTextIntoSegments = (text, maxLength = 4000) => {
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
