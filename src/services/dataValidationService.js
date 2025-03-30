// src/services/dataValidationService.js
import { validateUserData, formatDataForGroq } from '../utils/dataSchema';

export const prepareDataForGroq = (userData) => {
  console.log('prepareDataForGroq appelé avec:', userData);
  
  try {
    // Validation et formatage des données
    console.log('Appel à formatDataForGroq...');
    const formattedData = formatDataForGroq(userData);
    console.log('Données formatées avec succès:', formattedData);
    
    return {
      success: true,
      data: formattedData
    };
  } catch (error) {
    console.error('Erreur de validation des données:', error);
    console.error('Stack trace:', error.stack);
    
    return {
      success: false,
      error: {
        message: 'Les données recueillies sont incomplètes ou mal structurées',
        details: error.message,
        technicalDetails: error.stack
      }
    };
  }
};
