// src/services/grokService.js
import axios from 'axios';
import { prepareDataForGroq } from './dataValidationService';

export const generateStory = async (userData) => {
  try {
    console.log('generateStory appelé avec:', userData);
    
    // Préparer et valider les données
    console.log('Appel à prepareDataForGroq...');
    const { success, data, error } = prepareDataForGroq(userData);
    
    console.log('Résultat de prepareDataForGroq:', { success, data, error });
    
    if (!success) {
      console.error('Échec de la préparation des données:', error);
      throw new Error(error.message);
    }
    
    // Vérifier que les données sont correctement structurées
    console.log('Données formatées:', data);
    
    // S'assurer que les données ont la structure attendue par l'API
    if (!data.userData || !data.prompt) {
      console.error('Structure de données incorrecte:', data);
      throw new Error("Structure de données incorrecte pour l'API");
    }
    
    // Appel à l'API Grok via la fonction serverless avec URL complète
    const response = await axios.post('https://mystory-agtkfyktn-adriens-projects-894e8500.vercel.app/api/grok', data);
    
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
