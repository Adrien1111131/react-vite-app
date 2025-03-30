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

Cette application est configurée pour être déployée sur Vercel avec des Edge Functions pour une meilleure performance. Voici les étapes à suivre :

1. Créer un compte sur [Vercel](https://vercel.com) si vous n'en avez pas déjà un

2. Créer un dépôt GitHub pour votre projet
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/votre-nom/votre-repo.git
   git push -u origin main
   ```

3. Connecter Vercel à votre compte GitHub
   - Connectez-vous à [Vercel](https://vercel.com)
   - Cliquez sur "Add New..." puis "Project"
   - Sélectionnez votre dépôt GitHub
   - Vercel détectera automatiquement que c'est un projet Vite

4. Configurer le déploiement
   - Framework Preset: Vite
   - Build Command: npm run build
   - Output Directory: dist
   - Assurez-vous que les variables d'environnement sont configurées

5. Cliquez sur "Deploy"

## Améliorations apportées pour le déploiement Vercel

Cette application a été optimisée pour fonctionner sur Vercel avec les améliorations suivantes :

1. **Edge Functions** : Les API ont été converties en Edge Functions pour bénéficier d'un timeout plus long (30s au lieu de 10s) et d'une meilleure performance.

2. **Gestion des erreurs robuste** : Les services frontend et les fonctions API incluent maintenant :
   - Système de retry avec backoff exponentiel
   - Génération de contenu de secours en cas d'échec
   - Logs détaillés pour le débogage

3. **Configuration CORS optimisée** : Les en-têtes CORS ont été configurés pour permettre les requêtes cross-origin.

4. **Timeouts étendus** : Les requêtes axios ont maintenant un timeout de 60 secondes pour éviter les erreurs de timeout.

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
- `api/` : Edge Functions pour Vercel
- `public/` : Fichiers statiques

## Dépannage

Si vous rencontrez des problèmes avec les API sur Vercel :

1. Vérifiez les logs d'exécution dans le tableau de bord Vercel
2. Assurez-vous que les variables d'environnement sont correctement configurées
3. Vérifiez que les Edge Functions sont correctement déployées
4. Si les problèmes persistent, essayez de redéployer l'application

## Licence

[MIT](LICENSE)
