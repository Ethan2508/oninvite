# Oninvite - Landing Page

Site vitrine pour Oninvite, solution d'applications événementielles personnalisées.

## 🚀 Démarrage

```bash
# Installation des dépendances
npm install

# Lancer en développement (port 3001)
npm run dev

# Build production
npm run build

# Démarrer en production
npm start
```

## 📁 Structure

```
website/
├── pages/
│   ├── _app.tsx          # Configuration Chakra UI
│   ├── _document.tsx     # Fonts et meta tags
│   ├── index.tsx         # Page d'accueil
│   ├── mentions-legales.tsx
│   └── confidentialite.tsx
├── public/
│   └── (assets statiques)
├── next.config.js
├── package.json
└── tsconfig.json
```

## 🎨 Design

- **Couleur primaire:** #D4AF37 (Or)
- **Couleur secondaire:** #1A1A2E (Noir)
- **Font titre:** Cormorant Garamond
- **Font corps:** Inter

## 🌐 Déploiement Vercel

1. Connecter le repo à Vercel
2. Configurer le Root Directory: `website`
3. Domaine: `oninvite.fr`

### Variables d'environnement

Aucune variable requise pour le site vitrine.

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil avec Hero, Features, Pricing, Témoignages |
| `/mentions-legales` | Mentions légales |
| `/confidentialite` | Politique de confidentialité |
| `/cgv` | Conditions générales (à créer) |

## 🔗 Liens

- **CMS:** https://dashboard.oninvite.fr
- **API:** https://api.oninvite.fr
- **App Store:** (lien vers les apps)
