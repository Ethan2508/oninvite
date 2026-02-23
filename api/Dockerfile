FROM python:3.11-slim

WORKDIR /app

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copier les requirements
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY . .

# Rendre le script exécutable
RUN chmod +x start.sh

# Exposer le port
EXPOSE 8000

# Commande par défaut - utilise le script qui gère PORT
CMD ["./start.sh"]
