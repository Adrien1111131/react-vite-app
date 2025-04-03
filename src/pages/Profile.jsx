import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import profileAvatar from '../assets/icons/profile-avatar.png';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: ''
  });
  const [progress, setProgress] = useState(0);

  const handleNameChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, name: value }));
    updateProgress(value, formData.age);
  };

  const handleAgeChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, age: value }));
    updateProgress(formData.name, value);
  };

  const updateProgress = (name, age) => {
    let newProgress = 0;
    if (name) newProgress += 50;
    if (age) newProgress += 50;
    setProgress(newProgress);
  };

  const handleSubmit = () => {
    if (formData.name && formData.age) {
      navigate('/choix-fantasme', { state: { profile: formData } });
    }
  };

  return (
    <main className="profile-container">
      <header className="profile-header">
        <div className="profile-avatar">
          <img src={profileAvatar} alt="Icône de profil" />
        </div>
        <h1 className="profile-title">Profil</h1>
        <p className="profile-progress">complété à {progress}%</p>
      </header>

      <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Prénom ou pseudo
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            className="form-input"
            placeholder="Entrez votre prénom ou pseudo"
            autoComplete="off"
          />
          <p className="form-help">
            sera utilisé pour la personnalisation des histoires
          </p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="age">
            Tranche d'âge
          </label>
          <select
            id="age"
            value={formData.age}
            onChange={handleAgeChange}
            className="form-select"
          >
            <option value="">Sélectionnez votre âge</option>
            <option value="18-25">18 - 25 ans</option>
            <option value="26-35">26 - 35 ans</option>
            <option value="36-45">36 - 45 ans</option>
            <option value="46+">46 ans et plus</option>
          </select>
        </div>
      </form>

      <footer className="profile-footer">
        <h2 className="footer-title">
          Découvrez votre personnalité sexuelle
        </h2>
        <p className="footer-text">
          Afin de vous offrir une expérience érotique sur mesure et vous permettre de créer des histoires qui vous ressemblent
        </p>
        <button
          onClick={handleSubmit}
          disabled={!formData.name || !formData.age}
          className="submit-button"
          aria-label="Commencer le test de personnalité"
        >
          Commencer le test
        </button>
      </footer>
    </main>
  );
};

export default Profile;
