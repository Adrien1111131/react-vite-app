import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ChoixLieu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { answers, fantasy, character, isCustomFantasy } = location.state || {};
  const [selectedLocation, setSelectedLocation] = useState('');

  // Rediriger vers la page d'accueil si aucun fantasme ou personnage n'est sélectionné
  // Ou vers la page Resume si c'est un fantasme personnalisé
  useEffect(() => {
    if (!fantasy || !character) {
      navigate('/');
    }
    
    if (isCustomFantasy) {
      navigate('/resume', { state: { ...location.state } });
    }
  }, [fantasy, character, isCustomFantasy, navigate, location.state]);

  const locations = [
    { id: 1, name: 'Suite d\'hôtel chic et intime', color: '#f9a8d4' },
    { id: 2, name: 'Club privé discret', color: '#c4b5fd' },
    { id: 3, name: 'Cabine isolée d\'un train de nuit', color: '#a78bfa' },
    { id: 4, name: 'Plage secrète', color: '#f472b6' },
    { id: 5, name: 'Bibliothèque vide tard le soir', color: '#fda4af' },
    { id: 6, name: 'Appartement avec vue sur la mer', color: '#e879f9' },
    { id: 7, name: 'Spa', color: '#fb7185' },
    { id: 8, name: 'Villa isolée en Italie', color: '#d8b4fe' },
    { id: 9, name: 'Atelier d\'artiste bohème', color: '#f0abfc' },
    { id: 10, name: 'Terrasse privée sous les étoiles', color: '#93c5fd' }
  ];

  const handleLocationSelect = (locationItem) => {
    setSelectedLocation(locationItem.name);
    
    // Naviguer directement vers la page Resume avec les réponses, le fantasme, le personnage, le lieu sélectionné
    // et une valeur par défaut pour la saison
    setTimeout(() => {
      navigate('/resume', { 
        state: { 
          ...location.state,
          selectedLocation: locationItem.name,
          season: "Toutes saisons" // Valeur par défaut pour la saison
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
          Dans quel lieu ton fantasme prend vie ?
        </motion.h1>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}
        >
          {locations.map((locationItem) => (
            <motion.div
              key={locationItem.id}
              className={`relative rounded-xl overflow-hidden shadow-lg cursor-pointer h-48 flex items-center justify-center ${selectedLocation === locationItem.name ? 'ring-4 ring-purple-500' : ''}`}
              variants={itemVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              onClick={() => handleLocationSelect(locationItem)}
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
                border: selectedLocation === locationItem.name ? '4px solid #8b5cf6' : 'none'
              }}
            >
              {/* Fond coloré avec effet de flou */}
              <div 
                className="absolute inset-0 w-full h-full"
                style={{ 
                  backgroundColor: locationItem.color,
                  backgroundImage: `linear-gradient(45deg, ${locationItem.color}, ${locationItem.color}dd)`,
                  filter: 'blur(1px)',
                  opacity: 0.8
                }}
              ></div>
              
              {/* Overlay semi-transparent */}
              <div 
                className="absolute inset-0 bg-black bg-opacity-20"
                style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              ></div>
              
              {/* Nom du lieu */}
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
                {locationItem.name}
              </h3>
            </motion.div>
          ))}
        </motion.div>
        
        {fantasy && character && (
          <motion.div 
            className="mt-8 text-center text-purple-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            style={{ marginTop: '2rem', textAlign: 'center', color: '#7e22ce' }}
          >
            <p className="font-medium">Fantasme: <span className="font-bold">{fantasy}</span></p>
            <p className="font-medium mt-2">Personnage: <span className="font-bold">{character}</span></p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChoixLieu;
