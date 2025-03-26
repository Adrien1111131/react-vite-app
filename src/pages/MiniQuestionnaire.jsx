import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MiniQuestionnaire = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({
    age: '',
    situation: '',
    ambiance: '',
    caractere: '',
    niveauExplicite: ''
  });

  const questions = [
    {
      id: 'age',
      question: 'Âge',
      options: ['18-25', '26-35', '36-45', '45+']
    },
    {
      id: 'situation',
      question: 'Situation',
      options: ['Célibataire', 'En couple', 'Mariée', 'C\'est compliqué…']
    },
    {
      id: 'ambiance',
      question: 'Ambiance',
      options: ['Très romantique', 'Sensuelle', 'Intense', 'Audacieuse']
    },
    {
      id: 'caractere',
      question: 'Caractère',
      options: ['Timide', 'Confiance modérée', 'Très confiante', 'Surprise !']
    },
    {
      id: 'niveauExplicite',
      question: 'Niveau explicite',
      options: ['Subtile', 'Moyen', 'Très explicite']
    }
  ];

  const handleOptionSelect = (option) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Mettre à jour les réponses
    setAnswers({
      ...answers,
      [currentQuestion.id]: option
    });
    
    // Passer à la question suivante ou terminer le questionnaire
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 300);
    } else {
      // Naviguer vers la page ChoixFantasme avec les réponses
      setTimeout(() => {
        navigate('/choix-fantasme', { state: { answers } });
      }, 500);
    }
  };

  const skipQuestionnaire = () => {
    navigate('/choix-fantasme');
  };

  const currentQuestion = questions[currentQuestionIndex];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
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

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Couleurs pour les options
  const optionColors = [
    '#f9a8d4', '#c4b5fd', '#a78bfa', '#f472b6', '#fda4af', '#e879f9'
  ];

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
          Pour mieux personnaliser ton histoire, réponds en quelques secondes...
        </motion.h1>
        
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', padding: '1.5rem', marginBottom: '2rem' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.h2 
                className="text-xl font-semibold mb-6 text-purple-700"
                variants={titleVariants}
                style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: '#7e22ce' }}
              >
                {currentQuestion.question}
              </motion.h2>
              
              <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {currentQuestion.options.map((option, index) => (
                  <motion.div 
                    key={option}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    style={{ transform: 'scale(1)' }}
                  >
                    <button
                      onClick={() => handleOptionSelect(option)}
                      className="w-full text-left p-4 rounded-xl border transition-all flex items-center"
                      style={{ 
                        width: '100%',
                        textAlign: 'left',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                        backgroundColor: answers[currentQuestion.id] === option ? '#f3e8ff' : 'white',
                        borderWidth: '1px',
                        borderColor: answers[currentQuestion.id] === option ? '#a855f7' : '#e9d5ff',
                        boxShadow: answers[currentQuestion.id] === option ? '0 4px 6px -1px rgba(168, 85, 247, 0.1), 0 2px 4px -1px rgba(168, 85, 247, 0.06)' : 'none'
                      }}
                    >
                      <div 
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4"
                        style={{ 
                          width: '1.5rem',
                          height: '1.5rem',
                          borderRadius: '9999px',
                          borderWidth: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '1rem',
                          borderColor: answers[currentQuestion.id] === option ? '#a855f7' : '#c084fc',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {answers[currentQuestion.id] === option && (
                          <motion.div 
                            className="w-3 h-3 rounded-full bg-purple-500"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                            style={{ 
                              width: '0.75rem',
                              height: '0.75rem',
                              borderRadius: '9999px',
                              backgroundColor: '#a855f7'
                            }}
                          ></motion.div>
                        )}
                      </div>
                      <span className="text-lg" style={{ fontSize: '1.125rem' }}>{option}</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
        
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <button
            onClick={skipQuestionnaire}
            className="px-6 py-2 rounded-full font-medium text-purple-700 hover:text-purple-900 hover:underline transition-colors"
            style={{ 
              padding: '0.5rem 1.5rem', 
              borderRadius: '9999px', 
              fontWeight: '500',
              color: '#7e22ce',
              transition: 'color 0.2s ease'
            }}
          >
            Passer ce questionnaire
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default MiniQuestionnaire;
