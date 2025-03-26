// Script pour démarrer le serveur proxy
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Démarrage du serveur proxy...');

// Chemin vers le fichier server-proxy.js
const serverPath = join(__dirname, 'server-proxy.js');

// Démarrer le serveur proxy
const serverProcess = spawn('node', [serverPath], {
  stdio: 'inherit'
});

// Gérer les événements du processus
serverProcess.on('error', (error) => {
  console.error('Erreur lors du démarrage du serveur proxy:', error);
});

serverProcess.on('exit', (code, signal) => {
  if (code !== 0) {
    console.error(`Le serveur proxy s'est arrêté avec le code ${code} et le signal ${signal}`);
  } else {
    console.log('Le serveur proxy s\'est arrêté normalement');
  }
});

// Gérer l'arrêt propre du serveur
process.on('SIGINT', () => {
  console.log('Arrêt du serveur proxy...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});
