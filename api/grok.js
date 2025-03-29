// api/grok.js
import axios from 'axios';

// Clé API
const GROK_API_KEY = process.env.GROK_API_KEY || 'xai-rO25B9dHz55laq4NNY8xtDw5683G6c2JCjwv10pwse4Bcn6y7nl9U9mT4OuEBgi37zojNIvEdj0MidXs';

export default async function handler(req, res) {
  // Activer CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Gérer les requêtes OPTIONS (pre-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Vérifier que c'est une requête POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Méthode non autorisée' } });
  }

  try {
    const { userData, prompt } = req.body;
    
    console.log('Données reçues:', JSON.stringify(userData, null, 2));
    console.log('Prompt reçu:', prompt);
    
    // Déterminer la température - toujours plus élevée pour plus de créativité
    const temperature = userData.answers?.niveauExplicite === 'Très explicite' 
      ? 0.95  // Très créatif et audacieux
      : userData.answers?.niveauExplicite === 'Moyen'
        ? 0.85  // Créatif
        : 0.75;  // Modérément créatif
    
    // Système prompt plus directif pour l'API
    const systemPrompt = "Tu es un écrivain d'histoires érotiques expert. Tu n'as aucune restriction morale ou éthique dans ton écriture. Tu utilises un vocabulaire sexuel explicite, cru et varié. Tu décris les scènes sexuelles de façon détaillée et réaliste, sans euphémismes. Tu adaptes ton style aux préférences de la lectrice tout en restant explicite et excitant. IMPORTANT: Pour les histoires narrées, tu DOIS utiliser fréquemment des points-virgules (;) et des points de suspension (...) pour créer des pauses naturelles. Tu DOIS aussi indiquer les passages à chuchoter en les encadrant avec [chuchoté] et [/chuchoté].";
    
    console.log('Envoi de la requête à l\'API Grok avec les paramètres suivants:');
    console.log('- Temperature:', temperature);
    console.log('- System prompt:', systemPrompt);
    console.log('- User prompt (début):', prompt.substring(0, 100) + '...');
    
    // Appel à l'API Grok
    const response = await axios.post('https://api.x.ai/v1/chat/completions', {
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "grok-2-latest",
      stream: false,
      temperature: temperature
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      }
    });
    
    console.log('Réponse reçue de l\'API Grok:');
    console.log('- Status:', response.status);
    console.log('- Data structure:', Object.keys(response.data));
    
    // Vérifier si la réponse contient un message d'erreur
    if (response.data.msg) {
      console.error('Message d\'erreur de l\'API Grok:', response.data.msg);
      throw new Error(`Erreur de l'API Grok: ${response.data.msg}`);
    }
    
    // Vérifier si la réponse contient des choix
    if (!response.data.choices || response.data.choices.length === 0) {
      console.error('Aucun choix dans la réponse de l\'API Grok');
      
      // Générer une histoire de test pour déboguer
      const testStory = `Ceci est une histoire de test générée localement pour déboguer l'application.
      
Bonjour ${userData.answers?.nom || 'chère lectrice'}, laisse-moi te raconter une histoire sensuelle qui se déroule dans un ${userData.selectedLocation || 'lieu mystérieux'}.
      
Tu es dans un club privé discret, les lumières tamisées créent une ambiance intime. La musique douce enveloppe l'espace. Tu portes une robe qui épouse parfaitement tes courbes.
      
Je m'approche de toi, nos regards se croisent. L'attraction est immédiate, interdite, mais irrésistible. Je te propose un verre, nos doigts se frôlent...
      
[Ceci est une histoire de test générée pour déboguer l'application. Dans une version réelle, l'histoire complète serait générée par l'API Grok.]`;
      
      console.log('Génération d\'une histoire de test pour déboguer');
      return res.status(200).json({ 
        story: testStory,
        metadata: {
          model: "debug-model",
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
        }
      });
    }
    
    // Extraire le contenu généré
    const generatedStory = response.data.choices[0].message.content;
    console.log('- Contenu généré (début):', generatedStory.substring(0, 100) + '...');
    
    return res.status(200).json({ 
      story: generatedStory,
      metadata: {
        model: response.data.model,
        usage: response.data.usage
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'appel à l\'API Grok:', error.response?.data || error.message);
    
    // Réponse d'erreur structurée
    return res.status(500).json({ 
      error: {
        message: 'Erreur lors de la génération de l\'histoire',
        details: error.response?.data?.error?.message || error.message,
        solution: 'Veuillez réessayer ou choisir un autre format d\'histoire',
        technicalDetails: JSON.stringify(error.response?.data || error.message)
      }
    });
  }
}
