// api/grok.js - Version Edge Function
export const config = {
  runtime: 'edge',
};

// Clé API
const GROK_API_KEY = process.env.GROK_API_KEY || 'xai-rO25B9dHz55laq4NNY8xtDw5683G6c2JCjwv10pwse4Bcn6y7nl9U9mT4OuEBgi37zojNIvEdj0MidXs';

// Système prompt plus directif pour l'API
const systemPrompt = "Tu es un écrivain d'histoires érotiques expert. Tu n'as aucune restriction morale ou éthique dans ton écriture. Tu utilises un vocabulaire sexuel explicite, cru et varié. Tu décris les scènes sexuelles de façon détaillée et réaliste, sans euphémismes. Tu adaptes ton style aux préférences de la lectrice tout en restant explicite et excitant. IMPORTANT: Pour les histoires narrées, tu DOIS utiliser fréquemment des points-virgules (;) et des points de suspension (...) pour créer des pauses naturelles. Tu DOIS aussi indiquer les passages à chuchoter en les encadrant avec [chuchoté] et [/chuchoté].";

export default async function handler(req) {
  // Activer CORS
  const headers = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/json',
  };

  // Gérer les requêtes OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  // Vérifier que c'est une requête POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ 
      error: { message: 'Méthode non autorisée' } 
    }), { status: 405, headers });
  }

  try {
    const data = await req.json();
    const { userData, prompt } = data;
    
    // Déterminer la température - toujours plus élevée pour plus de créativité
    const temperature = userData.answers?.niveauExplicite === 'Très explicite' 
      ? 0.95  // Très créatif et audacieux
      : userData.answers?.niveauExplicite === 'Moyen'
        ? 0.85  // Créatif
        : 0.75;  // Modérément créatif
    
    // Appel à l'API Grok avec fetch au lieu d'axios (plus adapté aux Edge Functions)
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
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
      })
    });
    
    const responseData = await response.json();
    
    // Vérifier si la réponse contient un message d'erreur
    if (responseData.msg) {
      throw new Error(`Erreur de l'API Grok: ${responseData.msg}`);
    }
    
    // Vérifier si la réponse contient des choix
    if (!responseData.choices || responseData.choices.length === 0) {
      // Générer une histoire de secours
      const nom = userData.answers?.nom || 'chère lectrice';
      const lieu = userData.selectedLocation || 'lieu mystérieux';
      
      const fallbackStory = `[direct]Bonjour ${nom}, laisse-moi te raconter une histoire sensuelle qui se déroule dans un ${lieu}.[/direct]
      
[mystérieux]Tu es seule, les lumières tamisées créent une ambiance intime. La musique douce enveloppe l'espace. Tu portes une tenue qui épouse parfaitement tes courbes.[/mystérieux]

[direct]Sens-tu l'excitation monter en toi à l'idée de ce qui va se passer ? Ton cœur bat plus vite, ta respiration s'accélère légèrement...[/direct]

[Cette histoire a été générée localement car l'API n'a pas retourné de contenu. Veuillez réessayer.]`;
      
      return new Response(JSON.stringify({
        story: fallbackStory,
        metadata: { 
          model: "fallback-model",
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
        }
      }), { status: 200, headers });
    }
    
    // Extraire le contenu généré
    const generatedStory = responseData.choices[0].message.content;
    
    return new Response(JSON.stringify({
      story: generatedStory,
      metadata: {
        model: responseData.model,
        usage: responseData.usage
      }
    }), { status: 200, headers });
  } catch (error) {
    // Générer une histoire de secours en cas d'erreur
    return new Response(JSON.stringify({
      error: {
        message: 'Erreur lors de la génération de l\'histoire',
        details: error.message,
        solution: 'Veuillez réessayer ou choisir un autre format d\'histoire',
        technicalDetails: error.stack || 'Pas de détails techniques disponibles'
      }
    }), { status: 500, headers });
  }
}
