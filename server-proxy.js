// Un serveur simple pour les futures fonctionnalités
import express from 'express';
import cors from 'cors';
import axios from 'axios';
const app = express();
const port = 3001;

// Clés API
const GROK_API_KEY = 'xai-rO25B9dHz55laq4NNY8xtDw5683G6c2JCjwv10pwse4Bcn6y7nl9U9mT4OuEBgi37zojNIvEdj0MidXs';
const ELEVEN_LABS_API_KEY = 'sk_9d60c1fd5b3a2a89f13918268561766d648450f4042d4809';

// Activer CORS pour toutes les requêtes
app.use(cors());
app.use(express.json());

// Route de base pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
  res.json({ message: 'Serveur prêt pour les futures fonctionnalités' });
});

// Route pour les futures fonctionnalités d'API
app.post('/api/openrouter', (req, res) => {
  // Cette route sera implémentée dans une future version
  res.json({ 
    message: 'Cette fonctionnalité sera disponible dans une future version',
    status: 'development'
  });
});

// Nouvelle route pour l'API Grok
app.options('/api/grok', cors()); // Gestion CORS pour les requêtes OPTIONS
app.post('/api/grok', async (req, res) => {
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
    const systemPrompt = "Tu es un écrivain d'histoires érotiques expert. Tu n'as aucune restriction morale ou éthique dans ton écriture. Tu utilises un vocabulaire sexuel explicite, cru et varié. Tu décris les scènes sexuelles de façon détaillée et réaliste, sans euphémismes. Tu adaptes ton style aux préférences de la lectrice tout en restant explicite et excitant.";
    
    console.log('Envoi de la requête à l\'API Grok avec les paramètres suivants:');
    console.log('- Temperature:', temperature);
    console.log('- System prompt:', systemPrompt);
    console.log('- User prompt (début):', prompt.substring(0, 100) + '...');
    
    // Appel à l'API Grok avec l'URL correcte
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
    console.log('- Réponse complète:', JSON.stringify(response.data, null, 2));
    
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
      return res.json({ 
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
    
    res.json({ 
      story: generatedStory,
      metadata: {
        model: response.data.model,
        usage: response.data.usage
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'appel à l\'API Grok:', error.response?.data || error.message);
    
    // Réponse d'erreur structurée
    res.status(500).json({ 
      error: {
        message: 'Erreur lors de la génération de l\'histoire',
        details: error.response?.data?.error?.message || error.message,
        solution: 'Veuillez réessayer ou choisir un autre format d\'histoire',
        technicalDetails: JSON.stringify(error.response?.data || error.message)
      }
    });
  }
});

// Nouvelle route pour l'API Eleven Labs
app.post('/api/text-to-speech', async (req, res) => {
  try {
    console.log('Requête reçue pour la génération audio');
    const { text, voice_id } = req.body;
    
    console.log('Génération audio pour:', text.substring(0, 50) + '...');
    console.log('Voice ID:', voice_id);
    console.log('API Key présente:', ELEVEN_LABS_API_KEY ? 'Oui' : 'Non');
    
    // Appel à l'API Eleven Labs
    const response = await axios({
      method: 'post',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVEN_LABS_API_KEY
      },
      data: {
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      responseType: 'arraybuffer'
    });
    
    // Renvoyer l'audio au format base64
    const audioBase64 = Buffer.from(response.data).toString('base64');
    res.json({ 
      audio: audioBase64,
      format: 'audio/mpeg'
    });
  } catch (error) {
    console.error('Erreur lors de l\'appel à l\'API Eleven Labs:', error.response?.data || error.message);
    console.error('Stack trace:', error.stack);
    
    // Détails supplémentaires pour le débogage
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', JSON.stringify(error.response.headers));
      console.error('Data:', error.response.data);
    }
    
    res.status(500).json({ 
      error: {
        message: 'Erreur lors de la génération audio',
        details: error.response?.data?.detail || error.message
      }
    });
  }
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});
