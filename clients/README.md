# Dossier Clients

Ce dossier contient les configurations et assets de chaque client/événement.

## Structure par client

```
clients/
  {client-slug}/
    config.json           # Configuration complète de l'événement
    assets/
      icon_1024.png       # Icône 1024x1024 (obligatoire)
      splash.png          # Splash screen haute résolution
      logo.png            # Logo de l'événement
    metadata/
      app_name.txt        # Nom de l'app pour les stores
      description.txt     # Description pour les stores
      keywords.txt        # Mots-clés (App Store)
      screenshots/        # Screenshots pour les stores
        iphone_1.png
        iphone_2.png
        android_1.png
    qr_code.png           # Généré automatiquement
    qr_code.svg           # Généré automatiquement
    qr_display.html       # Page HTML pour afficher le QR
```

## Créer un nouveau client

1. Créer le dossier avec le slug du client :
   ```bash
   mkdir -p clients/nom-du-client/assets
   mkdir -p clients/nom-du-client/metadata
   ```

2. Copier et adapter le fichier `config.json` depuis `demo-sarah-david`

3. Ajouter les assets (icône, splash, logo)

4. Ajouter les métadonnées pour les stores

5. Lancer le build :
   ```bash
   ./scripts/build.sh nom-du-client
   ```

## Convention de nommage

Le `client-slug` doit être :
- En minuscules
- Avec des tirets pour séparer les mots
- Sans caractères spéciaux
- Unique

Exemples : `sarah-david`, `entreprise-gala-2026`, `marie-jean-paris`
