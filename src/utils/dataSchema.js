 // src/utils/dataSchema.js
export const validateUserData = (userData) => {
  console.log('Validation des données utilisateur:', userData);
  
  // Structure de données attendue
  const requiredSchema = {
    // Données de base
    fantasy: { type: 'string', required: true },
    character: { type: 'string', required: true },
    selectedLocation: { type: 'string', required: true },
    season: { type: 'string', required: false }, // Changé à false car peut être optionnel
    
    // Données du questionnaire
    answers: {
      type: 'object',
      properties: {
        nom: { type: 'string', required: false }, // Nouveau champ pour le nom, optionnel
        age: { type: 'string', required: true },
        situation: { type: 'string', required: true },
        ambiance: { type: 'string', required: true },
        caractere: { type: 'string', required: true },
        niveauExplicite: { type: 'string', required: false } // Rendu optionnel pour éviter les erreurs
      }
    },
    
    // Format de l'histoire
    format: { type: 'string', required: true }, // Changé à true car nécessaire pour déterminer le type d'histoire
    
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

// Fonction pour formater les données pour l'API Groq
export const formatDataForGroq = (userData) => {
  console.log('Formatage des données pour Groq:', userData);
  
  // Validation des données
  const { isValid, errors, data } = validateUserData(userData);
  
  console.log('Résultat de la validation:', { isValid, errors, data });
  
  if (!isValid) {
    console.error('Validation échouée:', errors);
    throw new Error(`Données invalides: ${errors.join(', ')}`);
  }
  
  // Construction du prompt pour Groq
  const formattedData = {
    userData: data,
    prompt: buildPromptFromData(data)
  };
  
  console.log('Données formatées pour Groq:', formattedData);
  
  return formattedData;
};

// Construction du prompt à partir des données validées
const buildPromptFromData = (data) => {
  console.log('Construction du prompt avec les données:', data);
  console.log('Format de l\'histoire:', data.format);
  console.log('Est-ce une histoire narrée?', data.format?.includes('Narration'));
  // Déterminer le niveau de langage - toujours inclure du vocabulaire explicite
  // Utiliser une valeur par défaut 'Moyen' si niveauExplicite est manquant
  const niveauExplicite = data.answers?.niveauExplicite || 'Moyen';
  console.log('Niveau explicite utilisé:', niveauExplicite);
  
  const languageLevel = niveauExplicite === 'Très explicite' 
    ? 'extrêmement cru et vulgaire, utilisant un vocabulaire pornographique sans aucune censure' 
    : niveauExplicite === 'Moyen'
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

  // Vérifier si c'est une histoire narrée
  if (data.format?.includes('Narration')) {
    // Récupérer le nom de la personne s'il est disponible
    const nomPersonne = data.answers?.nom || '';
    
    // NOUVEAU prompt uniquement pour "Histoire narrée"
    return `Génère une histoire érotique avec les éléments suivants:
  
Personnage principal: ${data.character || 'Non spécifié'}
Fantasme: ${data.fantasy || 'Non spécifié'}
Lieu: ${data.selectedLocation || 'Non spécifié'}
Saison/Ambiance: ${data.season || 'Non spécifié'}

Profil de la lectrice:
- Prénom: ${nomPersonne || 'Non spécifié'}
- Âge: ${data.answers?.age || 'Non spécifié'} (${ageStyle})
- Situation: ${data.answers?.situation || 'Non spécifié'} (${situationContext})
- Préférence d'ambiance: ${data.answers?.ambiance || 'Non spécifié'}
- Caractère: ${data.answers?.caractere || 'Non spécifié'}

Style d'écriture:
- Format: Histoire narrée (${storyStyle})
- Niveau de langage: ${languageLevel}
- Utilise un style dynamique et moderne
- Longueur: ${storyLength}
- N'hésite pas à utiliser des termes crus et explicites pour les parties du corps et les actes sexuels

Instructions spécifiques:
- L'histoire doit être écrite à la première personne du point de vue d'un homme qui parle directement à une femme
- Utiliser le "tu" féminin pour s'adresser directement à la lectrice
- Si un prénom est fourni, l'utiliser plusieurs fois dans l'histoire pour personnaliser l'expérience
- Commencer l'histoire en utilisant le prénom de la lectrice si disponible (ex: "Bonjour [prénom]..." ou "[Prénom], laisse-moi te raconter...")
- Utiliser un ton intime, séducteur et narratif
- Inclure des phrases comme "imagine que...", "laisse-moi te raconter...", "ferme les yeux et visualise..."
- Créer une expérience immersive où l'auditrice se sent directement impliquée dans l'histoire
- Inclure des descriptions sensorielles détaillées (toucher, odeur, goût, sons)
- Créer une tension sexuelle progressive culminant dans des scènes explicites
- Utiliser un vocabulaire sexuel varié et précis
- Inclure des dialogues réalistes et immersifs, potentiellement vulgaires
- Ne pas censurer les termes sexuels explicites
- Adapter l'intensité au profil de la lectrice tout en restant explicite
`;
  } else {
    // PROMPT EXISTANT pour "Histoire à lire" - AUCUNE MODIFICATION
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
  }
};
