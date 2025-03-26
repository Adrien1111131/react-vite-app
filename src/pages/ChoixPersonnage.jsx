import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ChoixPersonnage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { answers, fantasy, isCustomFantasy } = location.state || {};
  const [selectedCharacter, setSelectedCharacter] = useState('');

  // Rediriger vers la page d'accueil si aucun fantasme n'est sélectionné
  useEffect(() => {
    if (!fantasy) {
      navigate('/');
    }
    
    // Si c'est un fantasme personnalisé, rediriger vers la page Resume
    if (isCustomFantasy) {
      navigate('/resume', { state: { ...location.state } });
    }
  }, [fantasy, isCustomFantasy, navigate, location.state]);

  const characters = [
    { id: 1, name: 'Homme sûr de lui', color: '#a78bfa' },
    { id: 2, name: 'Inconnu attirant', color: '#c4b5fd' },
    { id: 3, name: 'Séducteur direct', color: '#818cf8' },
    { id: 4, name: 'Ami proche attirant', color: '#93c5fd' },
    { id: 5, name: 'Professeur séduisant', color: '#60a5fa' },
    { id: 6, name: 'Homme brutal', color: '#f472b6' },
    { id: 7, name: 'Aventurier sensuel', color: '#fb7185' },
    { id: 8, name: 'Étranger sexy', color: '#f9a8d4' }
  ];

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character.name);
    
    // Naviguer vers la page ChoixLieu avec les réponses, le fantasme et le personnage sélectionné
    setTimeout(() => {
      navigate('/choix-lieu', { 
        state: { 
          ...location.state,
          character: character.name
        } 
      });
    }, 500);
  };

  // Animation variants pour les cartes
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-4 py-8" style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f3e8ff, #fce7f3)', padding: '2rem 1rem' }}>
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          className="text-3xl font-bold text-center text-purple-800 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ fontSize: '1.875rem', fontWeight: 'bold', textAlign: 'center', color: '#6b21a8', marginBottom: '2rem' }}
        >
          Quel type d'homme fais vibrer ton imagination ?
        </motion.h1>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}
        >
          {characters.map((character) => (
            <motion.div
              key={character.id}
              className={`relative rounded-xl overflow-hidden shadow-lg cursor-pointer h-40 flex items-center justify-center ${selectedCharacter === character.name ? 'ring-4 ring-purple-500' : ''}`}
              variants={itemVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              onClick={() => handleCharacterSelect(character)}
              style={{ 
                position: 'relative', 
                borderRadius: '0.75rem', 
                overflow: 'hidden', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', 
                cursor: 'pointer', 
                height: '10rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: selectedCharacter === character.name ? '4px solid #8b5cf6' : 'none'
              }}
            >
              {/* Fond coloré avec effet de flou */}
              <div 
                className="absolute inset-0 w-full h-full"
                style={{ 
                  backgroundColor: character.color,
                  backgroundImage: `linear-gradient(45deg, ${character.color}, ${character.color}dd)`,
                  filter: 'blur(1px)',
                  opacity: 0.8
                }}
              ></div>
              
              {/* Overlay semi-transparent */}
              <div 
                className="absolute inset-0 bg-black bg-opacity-20"
                style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              ></div>
              
              {/* Nom du personnage */}
              <h3 
                className="relative z-10 text-white text-xl font-bold text-center px-4"
                style={{ 
                  position: 'relative', 
                  zIndex: 10, 
                  color: 'white', 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  padding: '0 1rem',
                  textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)'
                }}
              >
                {character.name}
              </h3>
            </motion.div>
          ))}
        </motion.div>
        
        {fantasy && (
          <motion.div 
            className="mt-8 text-center text-purple-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            style={{ marginTop: '2rem', textAlign: 'center', color: '#7e22ce' }}
          >
            <p className="font-medium">Fantasme choisi: <span className="font-bold">{fantasy}</span></p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChoixPersonnage;
