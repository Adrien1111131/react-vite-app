// src/services/grokService.js
import axios from 'axios';
import { prepareDataForGrok } from './dataValidationService';

export const generateStory = async (userData) => {
  try {
    // Préparer et valider les données
    const { success, data, error } = prepareDataForGrok(userData);
    
    if (!success) {
      throw new Error(error.message);
    }
    
    // Vérifier que les données sont correctement structurées
    console.log('Données formatées:', data);
    
    // S'assurer que les données ont la structure attendue par l'API
    if (!data.userData || !data.prompt) {
      throw new Error("Structure de données incorrecte pour l'API");
    }
    
    // Appel à l'API via le serveur proxy
    const response = await axios.post('http://localhost:3001/api/grok', data);
    
    return {
      story: response.data.story,
      metadata: response.data.metadata
    };
  } catch (error) {
    console.error('Erreur lors de la génération de l\'histoire:', error);
    
    // Structurer l'erreur pour l'affichage
    throw {
      message: 'Impossible de générer l\'histoire',
      details: error.response?.data?.error?.details || error.message,
      solution: error.response?.data?.error?.solution || 'Veuillez réessayer avec des paramètres différents',
      technicalDetails: error.response?.data?.error?.technicalDetails || error.stack
    };
  }
};
