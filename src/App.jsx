import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MiniQuestionnaire from './pages/MiniQuestionnaire';
import ChoixFantasme from './pages/ChoixFantasme';
import ChoixPersonnage from './pages/ChoixPersonnage';
import ChoixLieu from './pages/ChoixLieu';
import Resume from './pages/Resume';
import Result from './pages/Result';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MiniQuestionnaire />} />
        <Route path="/choix-fantasme" element={<ChoixFantasme />} />
        <Route path="/choix-personnage" element={<ChoixPersonnage />} />
        <Route path="/choix-lieu" element={<ChoixLieu />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/result" element={<Result />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
