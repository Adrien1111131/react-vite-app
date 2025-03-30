import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ChoixFantasme = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const answers = location.state?.answers || {};
  
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customFantasy, setCustomFantasy] = useState('');
  const [selectedFantasy, setSelectedFantasy] = useState('');

  const fantasies = [
    { id: 1, title: 'Rencontre inattendue', color: '#f9a8d4' },
    { id: 2, title: 'Attraction interdite', color: '#c4b5fd' },
    { id: 3, title: 'Nuit sauvage', color: '#a78bfa' },
    { id: 4, title: 'Domination sensuelle', color: '#f472b6' },
    { id: 5, title: 'Confession intime', color: '#fda4af' },
    { id: 6, title: 'Soumission excitante', color: '#e879f9' },
    { id: 7, title: 'Retrouvailles brûlantes', color: '#fb7185' },
    { id: 8, title: 'Tentation irrésistible', color: '#d8b4fe' },
    { id: 9, title: 'Jeu dangereux', color: '#f0abfc' }
  ];

  const handleFantasySelect = (fantasy) => {
    setSelectedFantasy(fantasy.title);
    // Naviguer vers la page ChoixPersonnage avec les réponses et le fantasme sélectionné
    setTimeout(() => {
      navigate('/choix-personnage', { 
        state: { 
          ...location.state,
          fantasy: fantasy.title,
          isCustomFantasy: false
        } 
      });
    }, 500);
  };

  const handleCustomFantasySubmit = () => {
    if (customFantasy.trim()) {
      // Naviguer directement vers la page Resume avec les réponses et le fantasme personnalisé
      navigate('/resume', { 
        state: { 
          ...location.state,
          fantasy: customFantasy,
          isCustomFantasy: true
        } 
      });
    }
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
          Choisis le fantasme qui t'attire le plus…
        </motion.h1>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}
        >
          {fantasies.map((fantasy) => (
            <motion.div
              key={fantasy.id}
              className={`relative rounded-xl overflow-hidden shadow-lg cursor-pointer h-48 flex items-center justify-center ${selectedFantasy === fantasy.title ? 'ring-4 ring-purple-500' : ''}`}
              variants={itemVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              onClick={() => handleFantasySelect(fantasy)}
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
                border: selectedFantasy === fantasy.title ? '4px solid #8b5cf6' : 'none'
              }}
            >
              {/* Fond coloré avec effet de flou */}
              <div 
                className="absolute inset-0 w-full h-full"
                style={{ 
                  backgroundColor: fantasy.color,
                  backgroundImage: `linear-gradient(45deg, ${fantasy.color}, ${fantasy.color}dd)`,
                  filter: 'blur(1px)',
                  opacity: 0.8
                }}
              ></div>
              
              {/* Overlay semi-transparent */}
              <div 
                className="absolute inset-0 bg-black bg-opacity-20"
                style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              ></div>
              
              {/* Titre du fantasme */}
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
                {fantasy.title}
              </h3>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{ marginTop: '2.5rem', textAlign: 'center' }}
        >
          {!showCustomInput ? (
            <button
              onClick={() => setShowCustomInput(true)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-medium text-lg flex items-center justify-center"
              style={{ 
                padding: '0.75rem 1.5rem', 
                background: 'linear-gradient(to right, #ec4899, #8b5cf6)', 
                color: 'white', 
                borderRadius: '9999px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                fontWeight: '500',
                fontSize: '1.125rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}
            >
              <span role="img" aria-label="flame" className="mr-2" style={{ marginRight: '0.5rem' }}>🔥</span>
              Tu as un fantasme unique ?
              <span role="img" aria-label="flame" className="ml-2" style={{ marginLeft: '0.5rem' }}>🔥</span>
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="max-w-md mx-auto"
              style={{ maxWidth: '28rem', margin: '0 auto' }}
            >
              <textarea
                value={customFantasy}
                onChange={(e) => setCustomFantasy(e.target.value)}
                placeholder="Écris ton fantasme rêvé ici…"
                className="w-full p-4 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  border: '1px solid #d8b4fe', 
                  borderRadius: '0.5rem', 
                  outline: 'none',
                  minHeight: '120px',
                  resize: 'none'
                }}
                rows={4}
              />
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleCustomFantasySubmit}
                  disabled={!customFantasy.trim()}
                  className={`px-6 py-2 rounded-full font-medium ${
                    customFantasy.trim() 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-purple-300 text-purple-100 cursor-not-allowed'
                  }`}
                  style={{ 
                    padding: '0.5rem 1.5rem', 
                    borderRadius: '9999px', 
                    fontWeight: '500',
                    backgroundColor: customFantasy.trim() ? '#9333ea' : '#d8b4fe',
                    color: customFantasy.trim() ? 'white' : '#f3e8ff',
                    cursor: customFantasy.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Continuer
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ChoixFantasme;
