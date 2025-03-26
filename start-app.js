// Script pour démarrer l'application complète (serveur proxy + application React)
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Démarrage de l\'application complète...');

// Chemin vers le fichier server-proxy.js
const serverPath = join(__dirname, 'server-proxy.js');

// Démarrer le serveur proxy
console.log('Démarrage du serveur proxy...');
const serverProcess = spawn('node', [serverPath], {
  stdio: 'inherit'
});

// Démarrer l'application React
console.log('Démarrage de l\'application React...');
const reactProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Gérer les événements du processus du serveur proxy
serverProcess.on('error', (error) => {
  console.error('Erreur lors du démarrage du serveur proxy:', error);
});

serverProcess.on('exit', (code, signal) => {
  if (code !== 0) {
    console.error(`Le serveur proxy s'est arrêté avec le code ${code} et le signal ${signal}`);
  } else {
    console.log('Le serveur proxy s\'est arrêté normalement');
  }
  // Arrêter l'application React si le serveur proxy s'arrête
  reactProcess.kill();
});

// Gérer les événements du processus de l'application React
reactProcess.on('error', (error) => {
  console.error('Erreur lors du démarrage de l\'application React:', error);
});

reactProcess.on('exit', (code, signal) => {
  if (code !== 0) {
    console.error(`L'application React s'est arrêtée avec le code ${code} et le signal ${signal}`);
  } else {
    console.log('L\'application React s\'est arrêtée normalement');
  }
  // Arrêter le serveur proxy si l'application React s'arrête
  serverProcess.kill();
});

// Gérer l'arrêt propre de l'application
process.on('SIGINT', () => {
  console.log('Arrêt de l\'application complète...');
  serverProcess.kill('SIGINT');
  reactProcess.kill('SIGINT');
  process.exit(0);
});

console.log('Application complète démarrée. Appuyez sur Ctrl+C pour arrêter.');
