import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './DoorTransition.css';

const DoorTransition = ({ children }) => {
  const leftCurtainRef = useRef(null);
  const rightCurtainRef = useRef(null);
  const contentRef = useRef(null);
  const [showCurtains, setShowCurtains] = useState(true);
  
  useEffect(() => {
    // Vérifier si l'animation a déjà été vue
    const hasSeenAnimation = sessionStorage.getItem('hasSeenCurtainAnimation');
    
    if (hasSeenAnimation) {
      // Si l'animation a déjà été vue, ne pas l'afficher
      setShowCurtains(false);
      return;
    }

    const leftCurtainElement = leftCurtainRef.current;
    const rightCurtainElement = rightCurtainRef.current;
    const contentElement = contentRef.current;

    // Timeline pour l'animation
    const tl = gsap.timeline({
      onComplete: () => {
        // Marquer l'animation comme vue
        sessionStorage.setItem('hasSeenCurtainAnimation', 'true');
        setShowCurtains(false);
      }
    });

    // Animation d'ouverture des rideaux
    tl.fromTo([leftCurtainElement, rightCurtainElement], 
      { x: 0 }, 
      {
        x: (index, target) => target.classList.contains('left-curtain') ? '-100%' : '100%',
        duration: 1.2,
        ease: "power3.inOut",
      }
    );

    // Affichage immédiat du contenu
    tl.set(contentElement, { opacity: 1 }, 0);

    return () => {
      // Nettoyer l'animation si le composant est démonté
      tl.kill();
    };
  }, []);

  if (!showCurtains) {
    return <>{children}</>;
  }

  return (
    <div className="curtain-transition-container">
      <div className="curtain-wrapper">
        <div className="curtain left-curtain" ref={leftCurtainRef}>
          <div className="curtain-inner"></div>
          <div className="curtain-edge"></div>
        </div>
        <div className="curtain right-curtain" ref={rightCurtainRef}>
          <div className="curtain-inner"></div>
          <div className="curtain-edge"></div>
        </div>
      </div>
      <div className="content-behind-curtain" ref={contentRef}>
        {children}
      </div>
    </div>
  );
};

export default DoorTransition;
