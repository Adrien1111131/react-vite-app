import { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { gsap } from 'gsap';
import Profile from './pages/Profile';
import ChoixFantasme from './pages/ChoixFantasme';
import ChoixPersonnage from './pages/ChoixPersonnage';
import ChoixLieu from './pages/ChoixLieu';
import Resume from './pages/Resume';
import Result from './pages/Result';
import DoorTransition from './components/DoorTransition';
import WelcomeScreen from './components/WelcomeScreen';
import HomePage from './components/HomePage';
import './App.css';

function App() {
  const [showDoor, setShowDoor] = useState(false);
  const [doorVisible, setDoorVisible] = useState(false);
  const appContainerRef = useRef(null);
  
  // Effet pour animer l'apparition de la porte
  useEffect(() => {
    if (showDoor) {
      // Délai pour permettre à l'animation de sortie de l'écran d'accueil de se terminer
      const timer = setTimeout(() => {
        setDoorVisible(true);
        
        // Animation de transition entre l'écran d'accueil et la porte
        if (appContainerRef.current) {
          gsap.fromTo(
            appContainerRef.current,
            { 
              opacity: 0,
              filter: 'blur(10px)',
              scale: 0.95
            },
            { 
              opacity: 1,
              filter: 'blur(0px)',
              scale: 1,
              duration: 1.2,
              ease: 'power3.out',
              delay: 0.2
            }
          );
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [showDoor]);

  const handleEnterClick = () => {
    setShowDoor(true);
    
    // Effet de transition sur le fond
    gsap.to('body', {
      backgroundColor: '#0a0a0a',
      duration: 1.5,
      ease: 'power2.inOut'
    });
  };

  return (
    <div className="app-container" ref={appContainerRef}>
      <WelcomeScreen onEnter={handleEnterClick} />
      {doorVisible && (
        <DoorTransition>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/choix-fantasme" element={<ChoixFantasme />} />
              <Route path="/choix-personnage" element={<ChoixPersonnage />} />
              <Route path="/choix-lieu" element={<ChoixLieu />} />
              <Route path="/resume" element={<Resume />} />
              <Route path="/result" element={<Result />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </DoorTransition>
      )}
    </div>
  );
}

export default App;
