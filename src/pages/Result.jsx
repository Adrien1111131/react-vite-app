import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { generateStory } from '../services/grokService';
import { generateAudio } from '../services/audioService';

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state;
  
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState('medium'); // small, medium, large
  
  // États pour la fonctionnalité audio
  const [isNarratedStory, setIsNarratedStory] = useState(false);
  const [audioData, setAudioData] = useState(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  
  // Détecter si c'est une histoire narrée
  useEffect(() => {
    console.log('userData dans Result.jsx:', userData);
    console.log('Format de l\'histoire:', userData?.format);
    
    if (userData?.format?.includes('Narration')) {
      console.log('Histoire narrée détectée');
      setIsNarratedStory(true);
    } else {
      console.log('Histoire à lire (non narrée)');
    }
    
    // Vérifier si les données du questionnaire sont présentes
    if (userData?.answers) {
      console.log('Données du questionnaire présentes:', userData.answers);
    } else {
      console.error('Données du questionnaire manquantes');
    }
    
    // Vérifier si les données de base sont présentes
    console.log('Fantasme:', userData?.fantasy);
    console.log('Personnage:', userData?.character);
    console.log('Lieu:', userData?.selectedLocation);
    console.log('Saison:', userData?.season);
  }, [userData]);
  
  // Générer l'audio une fois l'histoire chargée
  useEffect(() => {
    console.log('Vérification des conditions pour la génération audio:');
    console.log('- isNarratedStory:', isNarratedStory);
    console.log('- story disponible:', !!story);
    console.log('- audioData existant:', !!audioData);
    console.log('- isGeneratingAudio:', isGeneratingAudio);
    
    const generateStoryAudio = async () => {
      if (isNarratedStory && story && !audioData && !isGeneratingAudio) {
        console.log('Démarrage de la génération audio...');
        try {
          setIsGeneratingAudio(true);
          console.log('Appel à generateAudio avec un texte de longueur:', story.length);
          const result = await generateAudio(story);
          console.log('Résultat de generateAudio:', result.success ? 'Succès' : 'Échec');
          
          if (result.success) {
            console.log('Audio généré avec succès, nombre de segments:', result.audioData.length);
            setAudioData(result.audioData);
          } else {
            console.error('Erreur lors de la génération audio:', result.error);
            setAudioError(result.error);
          }
        } catch (error) {
          console.error('Exception lors de la génération audio:', error);
          setAudioError({
            message: "Erreur lors de la génération audio",
            details: error.message
          });
        } finally {
          setIsGeneratingAudio(false);
        }
      }
    };

    generateStoryAudio();
  }, [isNarratedStory, story, audioData, isGeneratingAudio]);
  
  // Fonction pour gérer la lecture/pause
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

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
    <div className="fixed inset-0 overflow-y-auto bg-gradient-to-b from-purple-100 to-pink-100" style={{ background: 'linear-gradient(to bottom, #f3e8ff, #fce7f3)' }}>
      <div className="max-w-4xl mx-auto px-4 py-8 relative" style={{ padding: '2rem 1rem' }}>
        <motion.h1 
          className="text-3xl font-bold text-center text-purple-800 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ fontSize: '1.875rem', fontWeight: 'bold', textAlign: 'center', color: '#6b21a8', marginBottom: '1rem' }}
        >
          Ton histoire personnalisée
        </motion.h1>
        
        {/* Bouton pour générer l'audio manuellement */}
        {!loading && !error && story && (
          <motion.div 
            className="flex justify-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}
          >
            <button
              onClick={() => {
                console.log('Génération audio manuelle déclenchée');
                setIsGeneratingAudio(true);
                generateAudio(story).then(result => {
                  console.log('Résultat de la génération audio:', result);
                  if (result.success) {
                    setAudioData(result.audioData);
                  } else {
                    setAudioError(result.error);
                  }
                  setIsGeneratingAudio(false);
                });
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              disabled={isGeneratingAudio}
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: isGeneratingAudio ? '#c084fc' : '#9333ea', 
                color: 'white', 
                borderRadius: '0.5rem',
                transition: 'background-color 0.2s'
              }}
            >
              {isGeneratingAudio ? 'Génération en cours...' : 'Générer Audio'}
            </button>
          </motion.div>
        )}
        
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
          className="bg-white rounded-xl shadow-lg p-6 mb-8 overflow-y-auto"
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
          
          {/* Indicateur de génération audio */}
          {isGeneratingAudio && (
            <div className="flex items-center justify-center py-4 mb-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem 0', marginBottom: '1.5rem' }}>
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mr-3" style={{ animation: 'spin 1s linear infinite', height: '2rem', width: '2rem', borderTopWidth: '2px', borderBottomWidth: '2px', borderColor: '#a855f7', marginRight: '0.75rem' }}></div>
              <p className="text-purple-700" style={{ color: '#7e22ce' }}>Génération de l'audio en cours...</p>
            </div>
          )}
          
          {/* Affichage des erreurs audio */}
          {audioError && (
            <div className="text-red-600 p-4 bg-red-50 rounded-lg mb-6" style={{ color: '#dc2626', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <p className="font-medium" style={{ fontWeight: '500' }}>Erreur lors de la génération audio</p>
              <p className="text-sm" style={{ fontSize: '0.875rem' }}>{audioError.message}</p>
              {audioError.details && (
                <details className="mt-2">
                  <summary className="text-sm cursor-pointer" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>Détails techniques</summary>
                  <p className="text-sm mt-1 font-mono" style={{ fontSize: '0.875rem', marginTop: '0.25rem', fontFamily: 'monospace' }}>{audioError.details}</p>
                </details>
              )}
            </div>
          )}
          
          {/* Lecteur audio simple */}
          {audioData && !loading && !error && (
            <div className="bg-purple-50 p-4 rounded-lg mb-6" style={{ backgroundColor: '#f5f3ff', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <h3 className="text-lg font-semibold text-purple-800 mb-3" style={{ fontSize: '1.125rem', fontWeight: '600', color: '#6b21a8', marginBottom: '0.75rem' }}>Écouter l'histoire</h3>
              <div className="flex items-center" style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={handlePlayPause}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 mr-4"
                  style={{ backgroundColor: '#9333ea', color: 'white', borderRadius: '9999px', padding: '0.75rem', marginRight: '1rem' }}
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <div className="flex-1" style={{ flex: '1 1 0%' }}>
                  <audio
                    ref={audioRef}
                    src={`data:audio/mpeg;base64,${audioData[0]}`}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full"
                    style={{ width: '100%' }}
                    controls
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Lecteur audio de test avec fichier statique */}
          {!loading && !error && story && (
            <div className="bg-green-50 p-4 rounded-lg mb-6" style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <h3 className="text-lg font-semibold text-green-800 mb-3" style={{ fontSize: '1.125rem', fontWeight: '600', color: '#166534', marginBottom: '0.75rem' }}>Test Audio (fichier statique)</h3>
              <p className="text-sm text-green-700 mb-3" style={{ fontSize: '0.875rem', color: '#15803d', marginBottom: '0.75rem' }}>
                Ce lecteur utilise un fichier audio statique pour tester si le problème vient de la génération audio ou du lecteur lui-même.
              </p>
              <audio
                src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                className="w-full"
                style={{ width: '100%' }}
                controls
              />
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
