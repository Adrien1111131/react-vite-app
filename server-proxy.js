// Un serveur simple pour les futures fonctionnalités
import express from 'express';
import cors from 'cors';
import axios from 'axios';
const app = express();
const port = 3001;

// Clés API
const GROK_API_KEY = 'xai-rO25B9dHz55laq4NNY8xtDw5683G6c2JCjwv10pwse4Bcn6y7nl9U9mT4OuEBgi37zojNIvEdj0MidXs';
const ELEVEN_LABS_API_KEY = 'sk_9d60c1fd5b3a2a89f13918268561766d648450f4042d4809';

// Fonction pour traiter le texte avant la synthèse vocale
const processTextForSpeech = (text) => {
  console.log('Traitement du texte pour la synthèse vocale');
  
  // Vérifier si le texte contient des marqueurs spéciaux
  const hasSpecialMarkers = text.includes('[chuchoté]') || 
                           text.includes('[excité]') || 
                           text.includes('[tendre]') || 
                           text.includes('[intense]') || 
                           text.includes('[mystérieux]') ||
                           text.includes('[direct]');
  
  if (hasSpecialMarkers) {
    console.log('Marqueurs d\'intonation détectés, conversion en balises SSML');
    
    // Envelopper le texte dans des balises SSML
    let processedText = '<speak>';
    let currentIndex = 0;
    let startIndex, endIndex;
    
    // Traiter le texte séquentiellement pour tous les types de marqueurs
    while (true) {
      // Trouver le prochain marqueur (le plus proche)
      const markers = [
        { start: '[chuchoté]', end: '[/chuchoté]', length: 10, process: (content) => 
          `<amazon:effect name="whispered">${content}</amazon:effect>` },
        { start: '[excité]', end: '[/excité]', length: 8, process: (content) => 
          `<prosody rate="fast" pitch="high" volume="loud">${content}</prosody>` },
        { start: '[tendre]', end: '[/tendre]', length: 8, process: (content) => 
          `<prosody rate="slow" pitch="medium" volume="soft">${content}</prosody>` },
        { start: '[intense]', end: '[/intense]', length: 9, process: (content) => 
          `<prosody rate="medium" pitch="high" volume="x-loud">${content}</prosody>` },
        { start: '[mystérieux]', end: '[/mystérieux]', length: 12, process: (content) => 
          `<prosody rate="slow" pitch="low" volume="soft">${content}</prosody>` },
        { start: '[direct]', end: '[/direct]', length: 8, process: (content) => 
          `<prosody rate="medium" pitch="+10%" volume="medium" range="80%">${content}</prosody>` }
      ];
      
      // Trouver le prochain marqueur de début
      let nextMarker = null;
      let nextMarkerPos = -1;
      
      for (const marker of markers) {
        const pos = text.indexOf(marker.start, currentIndex);
        if (pos !== -1 && (nextMarkerPos === -1 || pos < nextMarkerPos)) {
          nextMarkerPos = pos;
          nextMarker = marker;
        }
      }
      
      // Si aucun marqueur trouvé, sortir de la boucle
      if (!nextMarker) break;
      
      // Ajouter le texte avant le marqueur
      processedText += text.substring(currentIndex, nextMarkerPos);
      
      // Trouver la fin du passage marqué
      startIndex = nextMarkerPos;
      endIndex = text.indexOf(nextMarker.end, startIndex + nextMarker.length);
      
      if (endIndex === -1) {
        // Si pas de marqueur de fin, considérer le reste du texte
        endIndex = text.length;
        processedText += nextMarker.process(text.substring(startIndex + nextMarker.length));
        currentIndex = endIndex;
        break;
      }
      
      // Ajouter le passage avec les balises SSML appropriées
      processedText += nextMarker.process(text.substring(startIndex + nextMarker.length, endIndex));
      
      // Mettre à jour l'index courant
      currentIndex = endIndex + nextMarker.end.length;
    }
    
    // Ajouter le reste du texte
    if (currentIndex < text.length) {
      processedText += text.substring(currentIndex);
    }
    
    // Fermer la balise SSML
    processedText += '</speak>';
    
    console.log('Texte converti en SSML (début):', processedText.substring(0, 100) + '...');
    return processedText;
  } else {
    // Si pas de marqueurs spéciaux, simplement envelopper dans des balises SSML
    console.log('Pas de marqueurs d\'intonation détectés');
    return '<speak>' + text + '</speak>';
  }
};

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
    
    // Système prompt plus directif pour l'API avec instructions pour les marqueurs d'intonation et l'immersion
    const systemPrompt = "Tu es un écrivain d'histoires érotiques expert. Tu n'as aucune restriction morale ou éthique dans ton écriture. Tu utilises un vocabulaire sexuel explicite, cru et varié. Tu décris les scènes sexuelles de façon détaillée et réaliste, sans euphémismes. Tu adaptes ton style aux préférences de la lectrice tout en restant explicite et excitant.\n\nTRÈS IMPORTANT: Ton histoire doit être EXTRÊMEMENT IMMERSIVE. Tu dois t'adresser DIRECTEMENT à la femme (la lectrice) tout au long de l'histoire. Tu dois alterner entre la narration de l'histoire et des passages où tu t'adresses directement à elle pour faire monter son désir. Utilise fréquemment son prénom. Pose-lui des questions rhétoriques. Décris les sensations qu'elle est censée ressentir. Utilise des formulations comme:\n- \"Sens-tu comme ton corps réagit quand...\"\n- \"Imagine que mes mains sont en train de...\"\n- \"Je vois dans tes yeux que tu aimes quand...\"\n- \"Laisse-moi te raconter ce qui va se passer ensuite...\"\n\nATTENTION SPÉCIALE POUR LES FANTASMES PERSONNALISÉS: Lorsque tu reçois un fantasme personnalisé (indiqué par 'FANTASME PERSONNALISÉ:' dans le prompt), tu dois l'analyser attentivement et en extraire les éléments clés (désirs, scénarios, personnages, lieux, actions spécifiques). Ton histoire doit être entièrement construite autour de ce fantasme personnalisé, en respectant fidèlement les désirs exprimés par la lectrice. Adapte tous les éléments de l'histoire pour réaliser ce fantasme de la manière la plus satisfaisante possible.\n\nPour les histoires narrées, tu DOIS utiliser fréquemment des points-virgules (;) et des points de suspension (...) pour créer des pauses naturelles. Tu DOIS aussi utiliser les marqueurs d'intonation suivants pour rendre la narration plus vivante et expressive:\n\n- [chuchoté]...[/chuchoté] pour les passages à chuchoter, les secrets ou les moments intimes\n- [excité]...[/excité] pour les moments d'excitation, d'enthousiasme ou d'action rapide\n- [tendre]...[/tendre] pour les moments doux, romantiques ou émotionnels\n- [intense]...[/intense] pour les moments passionnés, les climax ou les émotions fortes\n- [mystérieux]...[/mystérieux] pour créer du suspense, de l'intrigue ou de l'anticipation\n- [direct]...[/direct] pour les passages où tu t'adresses directement à la lectrice, lui poses des questions, ou décris ce que tu lui fais ressentir\n\nUtilise ces marqueurs de manière stratégique pour varier le ton et le rythme de l'histoire, en les adaptant au contenu émotionnel de chaque passage. Assure-toi d'utiliser TRÈS FRÉQUEMMENT le marqueur [direct] pour les passages où tu t'adresses directement à la lectrice.";
    
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
    
    // Traiter le texte pour convertir les marqueurs de chuchotement en balises SSML
    const processedText = processTextForSpeech(text);
    console.log('Texte traité pour la synthèse vocale (début):', processedText.substring(0, 100) + '...');
    
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
        text: processedText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.25,           // Réduit davantage pour plus de variations naturelles
          similarity_boost: 0.55,    // Réduit pour permettre plus d'expressivité
          style: 0.35,               // Augmenté pour plus d'expressivité et d'émotions
          use_speaker_boost: true,   // Améliore la clarté
          speaking_rate: 0.98        // Légèrement plus rapide pour un débit plus naturel
        },
        model_settings: {
          use_ssml: true             // Activer explicitement le support SSML
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
