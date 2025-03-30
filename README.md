# Application de Génération d'Histoires

Cette application React utilise Vite, l'API Grok et l'API Eleven Labs pour générer des histoires personnalisées et les convertir en audio.

## Fonctionnalités

- Génération d'histoires personnalisées basées sur les préférences de l'utilisateur
- Conversion des histoires en audio avec des effets vocaux
- Interface utilisateur intuitive et réactive

## Prérequis

- Node.js 18.0.0 ou supérieur
- npm ou yarn

## Installation locale

1. Cloner le dépôt
   ```bash
   git clone https://github.com/votre-nom/votre-repo.git
   cd votre-repo
   ```

2. Installer les dépendances
   ```bash
   npm install
   ```

3. Démarrer l'application en mode développement
   ```bash
   npm run dev
   ```

4. Dans un autre terminal, démarrer le serveur proxy
   ```bash
   node server-proxy.js
   ```

5. Ou démarrer les deux en même temps
   ```bash
   node start-app.js
   ```

## Déploiement sur Vercel

Cette application est configurée pour être déployée sur Vercel. Voici les étapes à suivre :

1. Créer un compte sur [Vercel](https://vercel.com) si vous n'en avez pas déjà un

2. Installer l'interface de ligne de commande Vercel (optionnel)
   ```bash
   npm install -g vercel
   ```

3. Déployer l'application
   ```bash
   vercel
   ```

   Ou simplement connecter votre dépôt GitHub à Vercel et déployer depuis l'interface web.

## Variables d'environnement

Les variables d'environnement suivantes sont utilisées par l'application :

- `GROK_API_KEY` : Clé API pour Grok
- `ELEVEN_LABS_API_KEY` : Clé API pour Eleven Labs

Ces variables sont déjà configurées dans le fichier `vercel.json` pour le déploiement sur Vercel.

## Structure du projet

- `src/` : Code source de l'application React
  - `pages/` : Composants de page
  - `services/` : Services pour les appels API
  - `utils/` : Utilitaires
- `api/` : Fonctions serverless pour Vercel
- `public/` : Fichiers statiques

## Licence

[MIT](LICENSE)
