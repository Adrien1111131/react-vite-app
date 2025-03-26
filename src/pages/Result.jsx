import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { generateStory } from '../services/grokService';

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state;
  
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState('medium'); // small, medium, large

  // Générer l'histoire au chargement de la page
  useEffect(() => {
    const fetchStory = async () => {
      if (!userData) {
        navigate('/');
        return;
      }
      
      try {
        setLoading(true);
        
        // Appel au service pour générer l'histoire
        const result = await generateStory(userData);
        setStory(result.story);
      } catch (error) {
        console.error('Erreur lors de la génération:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [userData, navigate]);

  const handleFontSizeChange = (size) => {
    setFontSize(size);
  };

  const handleReturnToHome = () => {
    navigate('/');
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-xl';
      default:
        return 'text-base';
    }
  };

  const getFontSizeStyle = () => {
    switch (fontSize) {
      case 'small':
        return { fontSize: '0.875rem' };
      case 'large':
        return { fontSize: '1.25rem' };
      default:
        return { fontSize: '1rem' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-4 py-8" style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f3e8ff, #fce7f3)', padding: '2rem 1rem' }}>
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          className="text-3xl font-bold text-center text-purple-800 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ fontSize: '1.875rem', fontWeight: 'bold', textAlign: 'center', color: '#6b21a8', marginBottom: '1rem' }}
        >
          Ton histoire personnalisée
        </motion.h1>
        
        {userData?.fantasy && userData?.character && userData?.selectedLocation && (
          <motion.div 
            className="text-center text-purple-700 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ textAlign: 'center', color: '#7e22ce', marginBottom: '1.5rem' }}
          >
            <p className="text-sm italic" style={{ fontSize: '0.875rem', fontStyle: 'italic' }}>
              {`${userData.fantasy} • ${userData.character} • ${userData.selectedLocation}${userData.season ? ` • ${userData.season}` : ''}`}
            </p>
          </motion.div>
        )}
        
        <div className="flex justify-end mb-4" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <div className="flex items-center space-x-2 bg-white rounded-full px-3 py-1 shadow-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', borderRadius: '9999px', padding: '0.25rem 0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <span className="text-sm text-gray-600" style={{ fontSize: '0.875rem', color: '#4b5563' }}>Taille du texte:</span>
            <button 
              onClick={() => handleFontSizeChange('small')} 
              className={`text-xs px-2 py-1 rounded-md ${fontSize === 'small' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}
              style={{ 
                fontSize: '0.75rem', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '0.375rem',
                backgroundColor: fontSize === 'small' ? '#f3e8ff' : 'transparent',
                color: fontSize === 'small' ? '#7e22ce' : '#6b7280',
              }}
            >
              A
            </button>
            <button 
              onClick={() => handleFontSizeChange('medium')} 
              className={`text-sm px-2 py-1 rounded-md ${fontSize === 'medium' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}
              style={{ 
                fontSize: '0.875rem', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '0.375rem',
                backgroundColor: fontSize === 'medium' ? '#f3e8ff' : 'transparent',
                color: fontSize === 'medium' ? '#7e22ce' : '#6b7280',
              }}
            >
              A
            </button>
            <button 
              onClick={() => handleFontSizeChange('large')} 
              className={`text-base px-2 py-1 rounded-md ${fontSize === 'large' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}
              style={{ 
                fontSize: '1rem', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '0.375rem',
                backgroundColor: fontSize === 'large' ? '#f3e8ff' : 'transparent',
                color: fontSize === 'large' ? '#7e22ce' : '#6b7280',
              }}
            >
              A
            </button>
          </div>
        </div>
        
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', padding: '1.5rem', marginBottom: '2rem' }}
        >
          {/* Affichage de l'état de chargement */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0' }}>
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4" style={{ animation: 'spin 1s linear infinite', height: '4rem', width: '4rem', borderTopWidth: '2px', borderBottomWidth: '2px', borderColor: '#a855f7', marginBottom: '1rem' }}></div>
              <p className="text-lg text-purple-700" style={{ fontSize: '1.125rem', color: '#7e22ce' }}>Génération de ton histoire personnalisée...</p>
              <p className="text-sm text-gray-500 mt-2" style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>Cela peut prendre quelques instants</p>
            </div>
          )}
          
          {/* Affichage de l'erreur si présente */}
          {error && (
            <div className="mb-6 p-4 border border-red-200 rounded-lg bg-red-50" style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '0.5rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
              <h3 className="text-lg font-semibold text-red-700 mb-2" style={{ fontSize: '1.125rem', fontWeight: '600', color: '#b91c1c', marginBottom: '0.5rem' }}>
                Erreur lors de la génération de l'histoire
              </h3>
              <p className="text-red-600 mb-2" style={{ color: '#dc2626', marginBottom: '0.5rem' }}>
                {error.message}
              </p>
              {error.solution && (
                <p className="text-red-600 font-medium" style={{ color: '#dc2626', fontWeight: '500' }}>
                  {error.solution}
                </p>
              )}
              <details className="mt-3">
                <summary className="text-sm text-red-500 cursor-pointer" style={{ fontSize: '0.875rem', color: '#ef4444', cursor: 'pointer' }}>
                  Détails techniques
                </summary>
                <p className="mt-2 text-sm text-red-500 font-mono p-2 bg-red-50 rounded border border-red-200" style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#ef4444', fontFamily: 'monospace', padding: '0.5rem', backgroundColor: '#fef2f2', borderRadius: '0.25rem', border: '1px solid #fecaca' }}>
                  {error.technicalDetails}
                </p>
              </details>
            </div>
          )}
          
          {/* Affichage de l'histoire si disponible */}
          {!loading && !error && story && (
            <div 
              className={`prose prose-purple max-w-none ${getFontSizeClass()}`}
              style={{ 
                maxWidth: 'none', 
                color: '#1f2937',
                lineHeight: '1.75',
                ...getFontSizeStyle()
              }}
            >
              {story.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4" style={{ marginBottom: '1rem' }}>
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </motion.div>
        
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <button
            onClick={handleReturnToHome}
            className="px-6 py-3 rounded-full font-medium text-lg bg-purple-600 hover:bg-purple-700 text-white shadow-lg transform transition-transform hover:scale-105 active:scale-95"
            style={{ 
              padding: '0.75rem 1.5rem', 
              borderRadius: '9999px', 
              fontSize: '1.125rem',
              fontWeight: '500',
              backgroundColor: '#9333ea',
              color: 'white',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transform: 'scale(1)',
              transition: 'transform 0.2s, background-color 0.2s'
            }}
          >
            Créer une nouvelle histoire
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Result;
