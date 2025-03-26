import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Resume = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { answers, fantasy, character, selectedLocation, season, isCustomFantasy } = location.state || {};
  const [isGenerating, setIsGenerating] = useState(false);
  const [formatType, setFormatType] = useState('read'); // 'read' ou 'narrated'
  const [formatDuration, setFormatDuration] = useState(''); // '2min', '5min', '10min', '20min'
  const [error, setError] = useState('');

  const handleFormatTypeChange = (type) => {
    setFormatType(type);
    setFormatDuration(''); // Réinitialiser la durée lors du changement de type
  };

  const handleFormatDurationChange = (duration) => {
    setFormatDuration(duration);
  };

  const handleGenerateStory = async () => {
    // Vérifier si un format a été sélectionné
    if (!formatDuration) {
      setError('Veuillez sélectionner une durée pour votre histoire.');
      return;
    }
    
    setError('');
    setIsGenerating(true);
    
    try {
      // Préparer les données complètes avec le format sélectionné
      const completeUserData = { 
        ...location.state,
        format: `${formatType === 'read' ? 'Lecture' : 'Narration'} de ${formatDuration}`
      };
      
      // Naviguer vers la page de résultat avec les données
      // L'appel à l'API sera fait dans la page Result
      setTimeout(() => {
        navigate('/result', { 
          state: completeUserData
        });
      }, 500);
    } catch (error) {
      console.error('Erreur lors de la préparation des données:', error);
      setError('Une erreur est survenue lors de la préparation des données. Veuillez réessayer.');
      setIsGenerating(false);
    }
  };

  // Animation variants
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
          Ton histoire est prête à être créée !
        </motion.h1>
        
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', padding: '1.5rem', marginBottom: '2rem' }}
        >
          <h2 className="text-xl font-semibold mb-4 text-purple-700" style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#7e22ce' }}>
            Récapitulatif de tes choix
          </h2>
          
          <div className="space-y-4">
            {fantasy && (
              <div className="flex items-start mb-3">
                <span className="font-medium w-40 text-purple-600" style={{ fontWeight: '500', width: '10rem', color: '#9333ea' }}>
                  Fantasme choisi:
                </span>
                <span className="flex-1 font-semibold" style={{ fontWeight: '600' }}>
                  {fantasy}
                </span>
              </div>
            )}
            
            {character && (
              <div className="flex items-start mb-3">
                <span className="font-medium w-40 text-purple-600" style={{ fontWeight: '500', width: '10rem', color: '#9333ea' }}>
                  Personnage choisi:
                </span>
                <span className="flex-1 font-semibold" style={{ fontWeight: '600' }}>
                  {character}
                </span>
              </div>
            )}
            
            {selectedLocation && (
              <div className="flex items-start mb-3">
                <span className="font-medium w-40 text-purple-600" style={{ fontWeight: '500', width: '10rem', color: '#9333ea' }}>
                  Lieu sélectionné:
                </span>
                <span className="flex-1 font-semibold" style={{ fontWeight: '600' }}>
                  {selectedLocation}
                </span>
              </div>
            )}
            
            {season && (
              <div className="flex items-start mb-3">
                <span className="font-medium w-40 text-purple-600" style={{ fontWeight: '500', width: '10rem', color: '#9333ea' }}>
                  Saison sélectionnée:
                </span>
                <span className="flex-1 font-semibold" style={{ fontWeight: '600' }}>
                  {season}
                </span>
              </div>
            )}
            
            {answers && Object.keys(answers).length > 0 && (
              <div className="mt-6 pt-4 border-t border-purple-100" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f3e8ff' }}>
                <p className="font-medium text-gray-700 mb-2" style={{ fontWeight: '500', color: '#4b5563', marginBottom: '0.5rem' }}>
                  Préférences personnelles:
                </p>
                <ul className="space-y-2" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Object.entries(answers).map(([key, value]) => (
                    value && (
                      <li key={key} className="flex" style={{ display: 'flex' }}>
                        <span className="font-medium w-32 text-purple-600" style={{ fontWeight: '500', width: '8rem', color: '#9333ea' }}>
                          {key === 'age' ? 'Âge' : 
                           key === 'situation' ? 'Situation' : 
                           key === 'ambiance' ? 'Ambiance' : 
                           key === 'caractere' ? 'Caractère' : 
                           key === 'niveauExplicite' ? 'Niveau explicite' : 
                           key.charAt(0).toUpperCase() + key.slice(1)}:
                        </span>
                        <span>{value}</span>
                      </li>
                    )
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', padding: '1.5rem', marginBottom: '2rem' }}
        >
          <h2 className="text-xl font-semibold mb-4 text-purple-700" style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#7e22ce' }}>
            Choisis ton format d'histoire
          </h2>
          
          <div className="space-y-6">
            {/* Sélection du type de format */}
            <div className="flex space-x-4" style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => handleFormatTypeChange('read')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  formatType === 'read' 
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={{ 
                  flex: '1 1 0%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  backgroundColor: formatType === 'read' ? '#f3e8ff' : '#f3f4f6',
                  color: formatType === 'read' ? '#7e22ce' : '#4b5563',
                  border: formatType === 'read' ? '2px solid #d8b4fe' : 'none'
                }}
              >
                Histoire à lire
              </button>
              
              <button
                onClick={() => handleFormatTypeChange('narrated')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  formatType === 'narrated' 
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-300' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={{ 
                  flex: '1 1 0%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  backgroundColor: formatType === 'narrated' ? '#f3e8ff' : '#f3f4f6',
                  color: formatType === 'narrated' ? '#7e22ce' : '#4b5563',
                  border: formatType === 'narrated' ? '2px solid #d8b4fe' : 'none'
                }}
              >
                Histoire narrée
              </button>
            </div>
            
            {/* Options de durée pour "Histoire à lire" */}
            {formatType === 'read' && (
              <motion.div 
                className="grid grid-cols-3 gap-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}
              >
                {['2min', '10min', '20min'].map((duration) => (
                  <motion.button
                    key={duration}
                    onClick={() => handleFormatDurationChange(duration)}
                    className={`py-2 px-3 rounded-lg font-medium transition-colors ${
                      formatDuration === duration 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                    }`}
                    variants={itemVariants}
                    style={{ 
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      backgroundColor: formatDuration === duration ? '#8b5cf6' : '#f5f3ff',
                      color: formatDuration === duration ? 'white' : '#7e22ce'
                    }}
                  >
                    {duration === '2min' ? '2 minutes' : 
                     duration === '10min' ? '10 minutes' : 
                     '20 minutes'}
                  </motion.button>
                ))}
              </motion.div>
            )}
            
            {/* Options de durée pour "Histoire narrée" */}
            {formatType === 'narrated' && (
              <motion.div 
                className="grid grid-cols-2 gap-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}
              >
                {['5min', '10min'].map((duration) => (
                  <motion.button
                    key={duration}
                    onClick={() => handleFormatDurationChange(duration)}
                    className={`py-2 px-3 rounded-lg font-medium transition-colors ${
                      formatDuration === duration 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                    }`}
                    variants={itemVariants}
                    style={{ 
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      backgroundColor: formatDuration === duration ? '#8b5cf6' : '#f5f3ff',
                      color: formatDuration === duration ? 'white' : '#7e22ce'
                    }}
                  >
                    {duration === '5min' ? '5 minutes' : '10 minutes'}
                  </motion.button>
                ))}
              </motion.div>
            )}
            
            {/* Message d'erreur */}
            {error && (
              <div className="text-red-500 text-center mt-2" style={{ color: '#ef4444', textAlign: 'center', marginTop: '0.5rem' }}>
                {error}
              </div>
            )}
          </div>
        </motion.div>
        
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <button
            onClick={handleGenerateStory}
            disabled={isGenerating}
            className={`px-6 py-3 rounded-full font-medium text-lg shadow-lg transform transition-transform ${
              isGenerating ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:scale-105 active:scale-95'
            }`}
            style={{ 
              padding: '0.75rem 1.5rem', 
              borderRadius: '9999px', 
              fontSize: '1.125rem',
              fontWeight: '500',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transform: 'scale(1)',
              transition: 'transform 0.2s, background-color 0.2s',
              backgroundColor: isGenerating ? '#c084fc' : '#9333ea',
              color: 'white',
              cursor: isGenerating ? 'not-allowed' : 'pointer'
            }}
          >
            {isGenerating ? (
              <span className="flex items-center" style={{ display: 'flex', alignItems: 'center' }}>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite', marginLeft: '-0.25rem', marginRight: '0.75rem', height: '1.25rem', width: '1.25rem', color: 'white' }}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: '0.25' }}></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style={{ opacity: '0.75' }}></path>
                </svg>
                Génération en cours...
              </span>
            ) : (
              <span>✨ Générer mon histoire</span>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Resume;
