import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ChoixSaison = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { answers, fantasy, character, selectedLocation, isCustomFantasy } = location.state || {};
  const [selectedSeason, setSelectedSeason] = useState('');

  // Rediriger vers la page d'accueil si aucun fantasme, personnage ou lieu n'est sélectionné
  // Ou vers la page Resume si c'est un fantasme personnalisé
  useEffect(() => {
    if (!fantasy || !character || !selectedLocation) {
      navigate('/');
    }
    
    if (isCustomFantasy) {
      navigate('/resume', { state: { ...location.state } });
    }
  }, [fantasy, character, selectedLocation, isCustomFantasy, navigate, location.state]);

  const seasons = [
    { id: 1, name: 'Printemps', emoji: '🌸', color: '#f9a8d4', description: 'Douceur et renouveau' },
    { id: 2, name: 'Été', emoji: '☀️', color: '#fcd34d', description: 'Chaleur et passion' },
    { id: 3, name: 'Automne', emoji: '🍂', color: '#fb923c', description: 'Mélancolie et mystère' },
    { id: 4, name: 'Hiver', emoji: '❄️', color: '#93c5fd', description: 'Intimité et sensualité' }
  ];

  const handleSeasonSelect = (season) => {
    setSelectedSeason(season.name);
    
    // Naviguer vers la page Resume avec les réponses, le fantasme, le personnage, le lieu et la saison sélectionnée
    setTimeout(() => {
      navigate('/resume', { 
        state: { 
          ...location.state,
          season: season.name
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
          Quelle est la saison de ton histoire ?
        </motion.h1>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}
        >
          {seasons.map((season) => (
            <motion.div
              key={season.id}
              className={`relative rounded-xl overflow-hidden shadow-lg cursor-pointer h-48 flex items-center justify-center ${selectedSeason === season.name ? 'ring-4 ring-purple-500' : ''}`}
              variants={itemVariants}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              onClick={() => handleSeasonSelect(season)}
              style={{ 
                position: 'relative', 
                borderRadius: '0.75rem', 
                overflow: 'hidden', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', 
                cursor: 'pointer', 
                height: '12rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: selectedSeason === season.name ? '4px solid #8b5cf6' : 'none'
              }}
            >
              {/* Fond coloré avec effet de flou */}
              <div 
                className="absolute inset-0 w-full h-full"
                style={{ 
                  backgroundColor: season.color,
                  backgroundImage: `linear-gradient(45deg, ${season.color}, ${season.color}dd)`,
                  filter: 'blur(1px)',
                  opacity: 0.8
                }}
              ></div>
              
              {/* Overlay semi-transparent */}
              <div 
                className="absolute inset-0 bg-black bg-opacity-20"
                style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              ></div>
              
              {/* Contenu de la carte */}
              <div className="relative z-10 text-center" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                <div className="text-4xl mb-2" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{season.emoji}</div>
                <h3 
                  className="text-white text-2xl font-bold mb-1"
                  style={{ 
                    color: 'white', 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold',
                    marginBottom: '0.25rem',
                    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {season.name}
                </h3>
                <p 
                  className="text-white text-sm opacity-90"
                  style={{ 
                    color: 'white', 
                    fontSize: '0.875rem',
                    opacity: 0.9,
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {season.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {fantasy && character && selectedLocation && (
          <motion.div 
            className="mt-8 text-center text-purple-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            style={{ marginTop: '2rem', textAlign: 'center', color: '#7e22ce' }}
          >
            <p className="font-medium">Fantasme: <span className="font-bold">{fantasy}</span></p>
            <p className="font-medium mt-2">Personnage: <span className="font-bold">{character}</span></p>
            <p className="font-medium mt-2">Lieu: <span className="font-bold">{selectedLocation}</span></p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChoixSaison;
