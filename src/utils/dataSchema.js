// src/utils/dataSchema.js
export const validateUserData = (userData) => {
  // Structure de données attendue
  const requiredSchema = {
    // Données de base
    fantasy: { type: 'string', required: true },
    character: { type: 'string', required: true },
    selectedLocation: { type: 'string', required: true },
    season: { type: 'string', required: true },
    
    // Données du questionnaire
    answers: {
      type: 'object',
      properties: {
        age: { type: 'string', required: true },
        situation: { type: 'string', required: true },
        ambiance: { type: 'string', required: true },
        caractere: { type: 'string', required: true },
        niveauExplicite: { type: 'string', required: true }
      }
    },
    
    // Format de l'histoire
    format: { type: 'string', required: false },
    
    // Métadonnées
    isCustomFantasy: { type: 'boolean', required: false }
  };
  
  // Validation et normalisation des données
  const validatedData = {};
  let errors = [];
  
  // Vérification des champs requis et normalisation
  Object.entries(requiredSchema).forEach(([key, schema]) => {
    if (schema.required && !userData[key]) {
      errors.push(`Le champ "${key}" est requis`);
    } else if (userData[key]) {
      // Normalisation selon le type attendu
      if (schema.type === 'string' && typeof userData[key] !== 'string') {
        validatedData[key] = String(userData[key]);
      } else if (schema.type === 'object' && typeof userData[key] === 'object') {
        validatedData[key] = {};
        
        // Validation des propriétés de l'objet
        if (schema.properties) {
          Object.entries(schema.properties).forEach(([propKey, propSchema]) => {
            if (propSchema.required && !userData[key][propKey]) {
              errors.push(`Le champ "${key}.${propKey}" est requis`);
            } else if (userData[key][propKey]) {
              validatedData[key][propKey] = userData[key][propKey];
            }
          });
        } else {
          validatedData[key] = userData[key];
        }
      } else {
        validatedData[key] = userData[key];
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    data: validatedData
  };
};

// Fonction pour formater les données pour l'API Grok
export const formatDataForGrok = (userData) => {
  // Validation des données
  const { isValid, errors, data } = validateUserData(userData);
  
  if (!isValid) {
    throw new Error(`Données invalides: ${errors.join(', ')}`);
  }
  
  // Construction du prompt pour Grok
  return {
    userData: data,
    prompt: buildPromptFromData(data)
  };
};

// Construction du prompt à partir des données validées
const buildPromptFromData = (data) => {
  // Déterminer le niveau de langage - toujours inclure du vocabulaire explicite
  const languageLevel = data.answers?.niveauExplicite === 'Très explicite' 
    ? 'extrêmement cru et vulgaire, utilisant un vocabulaire pornographique sans aucune censure' 
    : data.answers?.niveauExplicite === 'Moyen'
      ? 'explicite avec des termes crus pour décrire les actes sexuels'
      : 'sensuel mais direct, avec des termes précis pour les parties du corps et les actes sexuels';
  
  // Déterminer le style en fonction du type d'histoire
  const storyStyle = data.format?.includes('Narration') 
    ? 'style oral avec phrases courtes, rythme dynamique, nombreux dialogues, descriptions d\'actions directes et percutantes' 
    : 'style littéraire avec descriptions détaillées, métaphores sensuelles, longues phrases immersives';
  
  // Adapter en fonction de l'âge
  const ageStyle = data.answers?.age === '18-25' 
    ? 'ton légèrement romantique mais audacieux, découverte de la sexualité' 
    : data.answers?.age === '26-35'
      ? 'ton équilibré entre romance et sexualité directe'
      : 'ton mature, direct et sans tabous';
  
  // Adapter en fonction de la situation
  const situationContext = data.answers?.situation === 'Célibataire' 
    ? 'contexte de rencontre, séduction et découverte' 
    : data.answers?.situation === 'En couple' || data.answers?.situation === 'Mariée'
      ? 'contexte de fantasme, possible infidélité ou renouveau dans la relation'
      : 'contexte de relation complexe, ambiguïté et tension';
  
  // Déterminer la longueur de l'histoire basée sur le format
  const storyLength = data.format?.includes('2min') 
    ? 'courte (environ 500 mots)' 
    : data.format?.includes('5min') || data.format?.includes('10min')
      ? 'moyenne (environ 1000-1500 mots)'
      : 'longue (environ 2000-3000 mots)';

  return `Génère une histoire érotique avec les éléments suivants:
  
Personnage principal: ${data.character || 'Non spécifié'}
Fantasme: ${data.fantasy || 'Non spécifié'}
Lieu: ${data.selectedLocation || 'Non spécifié'}
Saison/Ambiance: ${data.season || 'Non spécifié'}

Profil de la lectrice:
- Âge: ${data.answers?.age || 'Non spécifié'} (${ageStyle})
- Situation: ${data.answers?.situation || 'Non spécifié'} (${situationContext})
- Préférence d'ambiance: ${data.answers?.ambiance || 'Non spécifié'}
- Caractère: ${data.answers?.caractere || 'Non spécifié'}

Style d'écriture:
- Format: ${data.format?.includes('Narration') ? 'Histoire narrée' : 'Histoire à lire'} (${storyStyle})
- Niveau de langage: ${languageLevel}
- Utilise un style dynamique et moderne
- Longueur: ${storyLength}
- N'hésite pas à utiliser des termes crus et explicites pour les parties du corps et les actes sexuels

Instructions spécifiques:
- L'histoire doit être écrite à la première personne du point de vue d'une femme
- Inclure des descriptions sensorielles détaillées (toucher, odeur, goût, sons)
- Créer une tension sexuelle progressive culminant dans des scènes explicites
- Utiliser un vocabulaire sexuel varié et précis
- Inclure des dialogues réalistes et immersifs, potentiellement vulgaires
- Ne pas censurer les termes sexuels explicites
- Adapter l'intensité au profil de la lectrice tout en restant explicite
`;
};
