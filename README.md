# SaveTheDate

Application mobile événementielle white-label (mariage, bar mitzvah, etc.)

## Architecture

```
/
├── app/          # App mobile React Native
├── api/          # Backend API (FastAPI/Python)
├── cms/          # Back-office (Next.js)
├── clients/      # Configs par client
├── scripts/      # Scripts de build
└── docs/         # Documentation
```

## Démarrage rapide

### Prérequis

- Docker & Docker Compose
- Node.js 18+
- Python 3.11+

### Installation

```bash
# 1. Cloner le repo
git clone <repo>
cd savethedate

# 2. Copier les variables d'environnement
cp .env.example .env

# 3. Lancer les services
docker-compose up -d

# 4. Vérifier que tout tourne
curl http://localhost:8000/health
```

### Services

| Service | URL | Description |
|---------|-----|-------------|
| API | http://localhost:8000 | Backend FastAPI |
| CMS | http://localhost:3000 | Back-office Next.js |
| PostgreSQL | localhost:5432 | Base de données |

## Documentation

- [01 - Architecture & BDD](docs/01_architecture_et_bdd.md)
- [02 - API Backend](docs/02_api_backend.md)
- [03 - App Mobile](docs/03_app_mobile.md)
- [04 - Config & Assets](docs/04_config_et_assets.md)
- [05 - CMS Back-office](docs/05_cms_backoffice.md)
- [06 - Notifications Push](docs/06_notifications_push.md)
- [07 - Build & Déploiement](docs/07_build_et_deploiement.md)
- [08 - Process & Livraison](docs/08_process_et_livraison.md)

## Commandes utiles

```bash
# Logs des services
docker-compose logs -f

# Accéder à PostgreSQL
docker-compose exec db psql -U eventapp -d eventapp

# Rebuild un service
docker-compose up -d --build api

# Arrêter tout
docker-compose down
```
