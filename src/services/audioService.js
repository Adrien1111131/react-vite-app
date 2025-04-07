// src/services/audioService.js - Version ultra simplifiée
import axios from 'axios';

export const VOICE_ID = "yNvuJLb8o2Kg3JWiPBsR";

export const generateAudio = async (text) => {
  try {
    console.log('Début de la génération audio');
    
    const response = await axios.post('/api/text-to-speech', {
      text: text,
      voice_id: VOICE_ID
    }, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.data?.audio) {
      throw new Error('Pas de données audio dans la réponse');
    }
    
    return {
      success: true,
      audioData: [response.data.audio],
      format: 'audio/mpeg'
    };
    
  } catch (error) {
    console.error('Erreur lors de la génération audio:', error);
    return {
      success: false,
      error: {
        message: error.message
      }
    };
  }
};
