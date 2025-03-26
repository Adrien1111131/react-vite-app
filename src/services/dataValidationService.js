// src/services/dataValidationService.js
import { validateUserData, formatDataForGrok } from '../utils/dataSchema';

export const prepareDataForGrok = (userData) => {
  try {
    // Validation et formatage des données
    const formattedData = formatDataForGrok(userData);
    return {
      success: true,
      data: formattedData
    };
  } catch (error) {
    console.error('Erreur de validation des données:', error);
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
