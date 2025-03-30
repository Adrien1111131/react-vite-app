// src/services/grokService.js
import axios from 'axios';
import { prepareDataForGroq } from './dataValidationService';

export const generateStory = async (userData) => {
  // Nombre maximum de tentatives
  const MAX_RETRIES = 3;
  let retryCount = 0;
  
  const attemptGeneration = async () => {
    try {
      console.log(`Tentative ${retryCount + 1}/${MAX_RETRIES} de génération d'histoire`);
      
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
      
      // Appel à l'API avec timeout plus long
      console.log('Envoi de la requête à l\'API...');
      const response = await axios.post('/api/grok', data, {
        timeout: 60000, // 60 secondes
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Réponse reçue de l\'API');
      
      return {
        story: response.data.story,
        metadata: response.data.metadata
      };
    } catch (error) {
      console.error('Erreur lors de la tentative:', error);
      
      // Si nous n'avons pas atteint le nombre maximum de tentatives, réessayer
      if (retryCount < MAX_RETRIES - 1) {
        retryCount++;
        console.log(`Erreur, nouvelle tentative ${retryCount}/${MAX_RETRIES}...`);
        
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
  
  try {
    return await attemptGeneration();
  } catch (error) {
    console.error('Toutes les tentatives ont échoué:', error);
    
    // Générer une histoire de secours en cas d'échec complet
    const nom = userData.answers?.nom || 'chère lectrice';
    const lieu = userData.selectedLocation || 'lieu mystérieux';
    const personnage = userData.selectedCharacter || 'homme mystérieux';
    
    const fallbackStory = `[direct]Bonjour ${nom}, laisse-moi te raconter une histoire sensuelle qui se déroule dans un ${lieu}.[/direct]
    
[mystérieux]Tu es seule, les lumières tamisées créent une ambiance intime. La musique douce enveloppe l'espace. Tu portes une tenue qui épouse parfaitement tes courbes.[/mystérieux]

[direct]Sens-tu l'excitation monter en toi à l'idée de ce qui va se passer ? Ton cœur bat plus vite, ta respiration s'accélère légèrement...[/direct]

[intense]Soudain, ${personnage} apparaît. Vos regards se croisent. L'attraction est immédiate, interdite, mais irrésistible.[/intense]

[direct]Nous rencontrons actuellement des difficultés techniques avec notre service de génération d'histoires. Veuillez réessayer dans quelques instants.[/direct]`;
    
    return {
      story: fallbackStory,
      metadata: {
        model: "fallback-model",
        error: error.message
      }
    };
  }
};
