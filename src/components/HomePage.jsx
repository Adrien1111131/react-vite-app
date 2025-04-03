import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import profileIcon from '../assets/icons/profile-icon.png';
import randomIcon from '../assets/icons/random-icon.png';
import choicesIcon from '../assets/icons/choices-icon.png';
import './HomePage.css';

const HomePage = () => {
  const titleRef = useRef(null);
  const profileCardRef = useRef(null);
  const randomCardRef = useRef(null);
  const choicesCardRef = useRef(null);
  const friendCardRef = useRef(null);
  const containerRef = useRef(null);
  const particlesRef = useRef(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const container = containerRef.current;
    const title = titleRef.current;
    const profileCard = profileCardRef.current;
    const randomCard = randomCardRef.current;
    const choicesCard = choicesCardRef.current;
    const friendCard = friendCardRef.current;
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
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: 'power2.out' }
    );

    // Animation du titre
    tl.fromTo(title,
      { opacity: 0, y: -20, filter: 'blur(5px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power2.out' },
      0.3
    );

    // Animation des cartes avec décalage
    const cards = [profileCard, randomCard, choicesCard, friendCard];
    cards.forEach((card, index) => {
      tl.fromTo(card,
        { opacity: 0, y: 30, scale: 0.9, filter: 'blur(5px)' },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          filter: 'blur(0px)', 
          duration: 0.8, 
          ease: 'back.out(1.4)'
        },
        0.5 + index * 0.2
      );
    });

    // Ajouter des animations de hover sur les cartes
    cards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.05,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3), 0 0 15px rgba(255, 215, 180, 0.3)',
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          scale: 1,
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2), 0 0 5px rgba(255, 215, 180, 0.1)',
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });

    return () => {
      // Nettoyer les animations si le composant est démonté
      tl.kill();
      
      // Supprimer les écouteurs d'événements
      cards.forEach((card) => {
        card.removeEventListener('mouseenter', () => {});
        card.removeEventListener('mouseleave', () => {});
      });
    };
  }, []);

  const handleCardClick = (path) => {
    // Animation de clic
    const tl = gsap.timeline({
      onComplete: () => {
        navigate(path);
      }
    });

    tl.to(containerRef.current, {
      opacity: 0,
      y: -20,
      filter: 'blur(10px)',
      duration: 0.8,
      ease: 'power3.inOut'
    });
  };

  return (
    <div className="home-container" ref={containerRef}>
      <div className="home-particles" ref={particlesRef}></div>
      <h1 className="home-title" ref={titleRef}>Mon histoire</h1>
      
      <div className="cards-container">
        <div 
          className="card profile-card" 
          ref={profileCardRef}
          onClick={() => handleCardClick('/profile')}
        >
          <div className="card-icon profile-icon"></div>
          <p className="card-text">A partir de mon profil</p>
        </div>
        
        <div className="cards-row">
          <div 
            className="card random-card" 
            ref={randomCardRef}
            onClick={() => handleCardClick('/result?mode=random')}
          >
            <div className="card-icon dice-icon"></div>
            <p className="card-text">Au hasard</p>
          </div>
          
          <div 
            className="card choices-card" 
            ref={choicesCardRef}
            onClick={() => handleCardClick('/choix-fantasme')}
          >
            <div className="card-icon checkbox-icon"></div>
            <p className="card-text">A partir de quelques choix</p>
          </div>
        </div>
        
        <div 
          className="card friend-card" 
          ref={friendCardRef}
          onClick={() => handleCardClick('/profile')}
        >
          <div className="card-icon arrow-icon"></div>
          <p className="card-text">Créer une histoire pour une amie</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
