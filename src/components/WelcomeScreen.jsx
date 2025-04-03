import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './WelcomeScreen.css';

const WelcomeScreen = ({ onEnter }) => {
  const [showScreen, setShowScreen] = useState(true);
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRef = useRef(null);
  const particlesRef = useRef(null);

  useEffect(() => {
    // Vérifier si l'écran d'accueil a déjà été vu
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcomeScreen');
    
    if (hasSeenWelcome) {
      // Si l'écran a déjà été vu, ne pas l'afficher et appeler onEnter
      setShowScreen(false);
      onEnter();
      return;
    }

    const container = containerRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const button = buttonRef.current;
    const particles = particlesRef.current;

    // Animation des particules
    gsap.to(particles, {
      backgroundPosition: '100% 100%',
      duration: 20,
      repeat: -1,
      ease: 'none'
    });

    // Timeline pour l'animation d'entrée
    const tl = gsap.timeline();

    // Animation du conteneur
    tl.fromTo(container, 
      { backgroundColor: 'rgba(0, 0, 0, 0)' },
      { backgroundColor: 'rgba(0, 0, 0, 0.85)', duration: 1, ease: 'power2.out' }
    );

    // Animation du titre (lettre par lettre)
    const titleText = title.textContent;
    title.textContent = '';
    title.style.opacity = 1;
    
    [...titleText].forEach((char, index) => {
      const charSpan = document.createElement('span');
      charSpan.textContent = char;
      charSpan.style.opacity = 0;
      title.appendChild(charSpan);
      
      tl.to(charSpan, {
        opacity: 1,
        duration: 0.05,
        ease: 'power1.out',
        delay: index * 0.03
      }, 0.5);
    });

    // Animation du sous-titre
    tl.fromTo(subtitle,
      { opacity: 0, y: 20, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power2.out' },
      1.5
    );

    // Animation du bouton
    tl.fromTo(button,
      { opacity: 0, scale: 0.8, filter: 'blur(5px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.8, ease: 'back.out(1.7)' },
      2
    );

    // Ajouter un effet de pulsation sur le bouton
    gsap.to(button, {
      boxShadow: '0 0 15px rgba(255, 215, 180, 0.7)',
      repeat: -1,
      yoyo: true,
      duration: 1.5
    });

    return () => {
      // Nettoyer les animations si le composant est démonté
      tl.kill();
    };
  }, [onEnter]);

  const handleEnterClick = () => {
    const container = containerRef.current;
    const particles = particlesRef.current;
    
    // Timeline pour l'animation de sortie
    const tl = gsap.timeline({
      onComplete: () => {
        // Marquer l'écran comme vu
        sessionStorage.setItem('hasSeenWelcomeScreen', 'true');
        // Cacher l'écran et appeler onEnter avec un léger délai pour une transition plus fluide
        setTimeout(() => {
          setShowScreen(false);
          onEnter();
        }, 300);
      }
    });

    // Animation du bouton - effet de clic
    tl.to(buttonRef.current, {
      scale: 1.05,
      duration: 0.2,
      ease: 'power1.out'
    });

    // Transformation du bouton
    tl.to(buttonRef.current, {
      scale: 0.9,
      opacity: 0.2,
      filter: 'blur(3px)',
      duration: 0.8,
      ease: 'power3.inOut'
    });

    // Animation des particules - effet de transition
    tl.to(particles, {
      opacity: 0.8,
      scale: 1.1,
      filter: 'blur(5px) brightness(1.2)',
      backgroundSize: '250% 250%',
      duration: 1.2,
      ease: 'power2.inOut'
    }, '-=0.6');

    // Animation du titre et sous-titre
    tl.to([titleRef.current, subtitleRef.current], {
      opacity: 0.2,
      y: -20,
      filter: 'blur(5px)',
      duration: 1.2,
      stagger: 0.15,
      ease: 'power3.inOut'
    }, '-=1');

    // Fondu final du conteneur
    tl.to(container, {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      backdropFilter: 'blur(0px)',
      duration: 1.5,
      ease: 'power3.inOut'
    }, '-=0.8');
    
    // Effet final de zoom
    tl.to('.welcome-content', {
      scale: 1.05,
      opacity: 0,
      duration: 1,
      ease: 'power3.inOut'
    }, '-=1');
  };

  if (!showScreen) {
    return null;
  }

  return (
    <div className="welcome-screen" ref={containerRef}>
      <div className="welcome-particles" ref={particlesRef}></div>
      <div className="welcome-content">
        <h1 className="welcome-title" ref={titleRef}>
          Bienvenue. Ici, c'est toi la clé. Et ton plaisir, la seule destination
        </h1>
        <p className="welcome-subtitle" ref={subtitleRef}>
          Tu viens d'entrer là où ton corps t'attendait depuis toujours.
        </p>
        <button className="welcome-button" ref={buttonRef} onClick={handleEnterClick}>
          ENTRER
          <span className="key-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
