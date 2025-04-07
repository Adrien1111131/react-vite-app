// api/text-to-speech.js - Version ultra simplifiée
export const config = {
  runtime: 'edge',
};

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Méthode non autorisée' }), { 
      status: 405, 
      headers 
    });
  }

  try {
    const { text, voice_id } = await req.json();
    
    if (!text || !voice_id) {
      throw new Error('Le texte et l\'ID de la voix sont requis');
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': 'sk_9d60c1fd5b3a2a89f13918268561766d648450f4042d4809'
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBase64 = arrayBufferToBase64(arrayBuffer);

    return new Response(JSON.stringify({ 
      audio: audioBase64,
      format: 'audio/mpeg'
    }), { status: 200, headers });

  } catch (error) {
    console.error('Erreur:', error);
    return new Response(JSON.stringify({ 
      error: {
        message: error.message
      }
    }), { status: 500, headers });
  }
}
