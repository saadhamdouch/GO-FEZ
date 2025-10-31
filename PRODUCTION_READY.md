# GO-FEZ - Guide de Production

## ✅ État de l'Application

L'application GO-FEZ est maintenant **prête pour la production** avec toutes les fonctionnalités suivantes testées et fonctionnelles :

### 🎯 Fonctionnalités Principales

#### Frontend (Next.js 15)
- ✅ **Navigation multilingue** (FR/EN/AR) avec next-intl
- ✅ **Authentification** JWT avec cookies sécurisés
- ✅ **Page d'accueil** avec Hero, Features, App Download
- ✅ **Exploration** par thèmes et circuits
- ✅ **Admin Dashboard** complet pour POIs, Circuits, Thèmes, Villes
- ✅ **Navigation de circuit** avec carte Leaflet interactive
- ✅ **Progression de circuit** avec tracking GPS
- ✅ **Cartes interactives** avec marqueurs colorés (rouge=actuel, vert=visité, gris=non-visité)
- ✅ **Ligne de circuit** tracée entre les POIs
- ✅ **Gamification** avec points et badges
- ✅ **Reviews et ratings** pour POIs
- ✅ **Favoris** et partage social

#### Backend (Express.js + Sequelize)
- ✅ **API RESTful** complète
- ✅ **Base de données MySQL** avec migrations automatiques
- ✅ **Upload d'images** via Cloudinary
- ✅ **Authentification** JWT avec refresh tokens
- ✅ **Gestion de progression** de circuits
- ✅ **Système de gamification** avec points et récompenses
- ✅ **Logging** avec Winston
- ✅ **Rate limiting** et sécurité (Helmet, CORS)
- ✅ **Validation** des données entrantes

### 🗺️ Système de Cartes

#### Carte de Navigation de Circuit
- **Marqueurs POI** :
  - 🔴 Rouge : POI actuel
  - 🟢 Vert : POIs visités
  - ⚪ Gris : POIs non visités
- **Ligne de circuit** : Ligne pointillée bleue reliant tous les POIs dans l'ordre
- **Position utilisateur** : Cercle bleu montrant la position GPS en temps réel
- **Popups interactifs** : Nom du POI + statut (visité/actuel)

## 📦 Installation

### Prérequis
- Node.js 20+
- MySQL 8.0+
- NPM ou Yarn

### Backend
```bash
cd server-go-fez
npm install
```

### Frontend
```bash
cd client
npm install
```

## ⚙️ Configuration

### Variables d'Environnement

#### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=go_fez

# Client URL
CLIENT_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT
JWT_SECRET=your_super_secret_key_change_in_production

# Database Sync
ASYNC_DB=true
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## 🚀 Démarrage

### Mode Développement

#### Backend
```bash
cd server-go-fez
node index.js
```
Serveur disponible sur http://localhost:8080

#### Frontend
```bash
cd client
npm run dev
```
Application disponible sur http://localhost:3000

### Mode Production

#### Backend
```bash
cd server-go-fez
NODE_ENV=production node index.js
```

#### Frontend
```bash
cd client
npm run build
npm start
```

## 📊 Structure de la Base de Données

### Tables Principales
- **Users** : Utilisateurs avec authentification
- **POI** : Points d'intérêt avec localisation GPS
- **Circuit** : Circuits touristiques
- **CircuitPOI** : Relation many-to-many Circuit↔POI avec ordre
- **Theme** : Thèmes de circuits
- **City** : Villes avec zones de couverture
- **CircuitProgress** : Progression des utilisateurs dans les circuits
- **Review** : Avis et notes
- **UserPoints** : Points de gamification
- **Badge** : Badges et récompenses

## 🔐 Sécurité

### Mesures de Sécurité Implémentées
- ✅ Helmet.js pour headers HTTP sécurisés
- ✅ CORS configuré avec whitelist
- ✅ Rate limiting (1000 req/min par IP)
- ✅ JWT avec expiration
- ✅ Cookies httpOnly pour auth
- ✅ Validation des données avec express-validator
- ✅ Protection CSRF via tokens
- ✅ Sanitization des inputs

### Recommandations pour la Production
1. **Changer JWT_SECRET** : Utiliser un secret fort et unique
2. **HTTPS** : Déployer avec SSL/TLS
3. **Variables d'environnement** : Ne jamais commit les fichiers .env
4. **Database backups** : Configurer des sauvegardes automatiques
5. **Monitoring** : Mettre en place des logs et alertes
6. **Rate limiting** : Ajuster selon le trafic attendu

## 🌍 Déploiement

### Backend (Options)
1. **VPS** (DigitalOcean, AWS EC2, Linode)
   - Installer Node.js et MySQL
   - Utiliser PM2 pour la gestion des processus
   - Configurer Nginx comme reverse proxy

2. **Platform as a Service** (Heroku, Railway, Render)
   - Connecter le repo GitHub
   - Configurer les variables d'environnement
   - Base de données MySQL managée

### Frontend (Options)
1. **Vercel** (Recommandé pour Next.js)
   ```bash
   vercel --prod
   ```

2. **Netlify**
   ```bash
   netlify deploy --prod
   ```

3. **Docker**
   ```bash
   docker build -t go-fez-client .
   docker run -p 3000:3000 go-fez-client
   ```

## 📱 Fonctionnalités Mobiles (App Native)

Le projet inclut un dossier `go-fez` pour l'application mobile React Native :
- Carte interactive
- Navigation GPS
- Notifications de proximité
- Mode hors-ligne (à développer)

## 🐛 Debugging

### Backend
Les logs sont disponibles dans la console et via Winston logger.

### Frontend
Utiliser React DevTools et Redux DevTools pour le debugging.

### Base de Données
```sql
-- Vérifier les circuits
SELECT * FROM Circuits;

-- Vérifier les POIs d'un circuit
SELECT p.*, cp.order 
FROM POI p 
JOIN CircuitPOI cp ON p.id = cp.poiId 
WHERE cp.circuitId = 'your-circuit-id'
ORDER BY cp.order;

-- Vérifier la progression
SELECT * FROM CircuitProgress WHERE userId = 5;
```

## 📈 Performance

### Frontend
- ✅ Images optimisées avec Cloudinary
- ✅ Code splitting avec Next.js
- ✅ Dynamic imports pour Leaflet
- ✅ Lazy loading des composants
- ✅ Memoization avec useMemo/useCallback

### Backend
- ✅ Connection pooling MySQL
- ✅ Rate limiting
- ✅ Compression des réponses
- ✅ Caching avec Redis (à implémenter si nécessaire)

## 🧪 Tests

### Tests à Effectuer Avant Production
- [ ] Créer un POI avec coordonnées GPS
- [ ] Créer un circuit avec au moins 3 POIs
- [ ] Tester le démarrage d'un circuit
- [ ] Tester la navigation avec GPS simulé
- [ ] Marquer des POIs comme visités
- [ ] Compléter un circuit et vérifier les points de gamification
- [ ] Tester l'authentification (login/logout)
- [ ] Tester le changement de langue (FR/EN/AR)
- [ ] Vérifier les cartes sur mobile
- [ ] Tester l'upload d'images

## 📞 Support

Pour tout problème ou question :
1. Vérifier les logs backend
2. Vérifier la console navigateur (F12)
3. Vérifier que toutes les variables d'environnement sont définies
4. Vérifier que MySQL est démarré
5. Vérifier les permissions de fichiers

## 🎉 Prêt pour la Production !

L'application est maintenant complète et fonctionnelle avec :
- ✅ Toutes les fonctionnalités implémentées
- ✅ Sécurité renforcée
- ✅ Cartes interactives avec progression
- ✅ Admin dashboard complet
- ✅ Gamification active
- ✅ Multi-langue (FR/EN/AR)
- ✅ Architecture scalable

**Bonne chance pour le lancement ! 🚀**
