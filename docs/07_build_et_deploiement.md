# ÉTAPE 7 — Build & Déploiement Stores

> **Statut** : À implémenter
> **Prérequis** : Étape 6 (Notifications Push)
> **Livrable** : Pipeline de build automatisé + soumission aux stores

---

## 1. OBJECTIF

Un seul script qui prend un dossier client en paramètre et produit un binaire iOS (.ipa) et Android (.aab) prêt à soumettre.

---

## 2. PRÉ-REQUIS

- **Fastlane** installé
- **Xcode** (sur un Mac) pour le build iOS
- **Android SDK** pour le build Android
- Comptes **App Store Connect** et **Google Play Console** configurés
- Certificats de signature iOS (distribution) et keystore Android

---

## 3. STRUCTURE DU DOSSIER CLIENT

```
/clients/{client_slug}/
  config.json           ← la config complète de l'événement
  assets/
    icon_1024.png       ← icône 1024x1024
    splash.png          ← splash screen haute résolution
    logo.png            ← logo de l'événement
  metadata/
    app_name.txt        ← "Sarah & David"
    description.txt     ← Description pour les stores
    keywords.txt        ← Mots-clés App Store
    screenshots/        ← Screenshots pour les stores (optionnel)
      iphone_1.png
      iphone_2.png
      iphone_3.png
```

---

## 4. SCRIPT DE BUILD PRINCIPAL

### scripts/build.sh

```bash
#!/bin/bash
set -e

CLIENT_SLUG=$1

if [ -z "$CLIENT_SLUG" ]; then
  echo "Usage: ./build.sh <client_slug>"
  exit 1
fi

CLIENT_DIR="./clients/$CLIENT_SLUG"
CONFIG_FILE="$CLIENT_DIR/config.json"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ Config file not found: $CONFIG_FILE"
  exit 1
fi

# Lire les variables depuis config.json
APP_NAME=$(jq -r '.branding.app_name' "$CONFIG_FILE")
EVENT_ID=$(jq -r '.event_id' "$CONFIG_FILE")
BUNDLE_ID_IOS="com.tamarque.event.$(echo $CLIENT_SLUG | tr '-' '')"
BUNDLE_ID_ANDROID="com.tamarque.event.$(echo $CLIENT_SLUG | tr '-' '')"

echo "🔨 Building app for: $APP_NAME"
echo "   Bundle ID iOS: $BUNDLE_ID_IOS"
echo "   Bundle ID Android: $BUNDLE_ID_ANDROID"
echo "   Event ID: $EVENT_ID"

# 1. Copier les assets
echo "📦 Copying assets..."
cp "$CLIENT_DIR/assets/icon_1024.png" ./app/ios/AppIcon.png
cp "$CLIENT_DIR/assets/icon_1024.png" ./app/android/app/src/main/res/ic_launcher.png
cp "$CLIENT_DIR/assets/splash.png" ./app/shared/splash.png
cp "$CLIENT_DIR/assets/logo.png" ./app/shared/logo.png

# 2. Injecter les variables d'environnement
echo "⚙️  Injecting environment variables..."
cat > ./app/.env.production <<EOF
EVENT_ID=$EVENT_ID
API_BASE_URL=https://api.tamarque.com
BUNDLE_ID=$BUNDLE_ID_IOS
APP_NAME=$APP_NAME
EOF

# 3. Build iOS
echo "🍎 Building iOS..."
cd ./app/ios
fastlane build_and_upload \
  app_name:"$APP_NAME" \
  bundle_id:"$BUNDLE_ID_IOS" \
  event_id:"$EVENT_ID"
cd ../..

# 4. Build Android
echo "🤖 Building Android..."
cd ./app/android
fastlane build_and_upload \
  app_name:"$APP_NAME" \
  bundle_id:"$BUNDLE_ID_ANDROID" \
  event_id:"$EVENT_ID"
cd ../..

echo "✅ Build complete for $APP_NAME"
echo "   iOS: Submitted to App Store Connect"
echo "   Android: Submitted to Google Play Console"
```

---

## 5. CONFIGURATION FASTLANE — iOS

### app/ios/fastlane/Fastfile

```ruby
default_platform(:ios)

platform :ios do
  desc "Build and upload to App Store Connect"
  lane :build_and_upload do |options|
    # Mettre à jour le bundle ID et le nom
    update_app_identifier(
      plist_path: "Runner/Info.plist",
      app_identifier: options[:bundle_id]
    )
    update_info_plist(
      plist_path: "Runner/Info.plist",
      display_name: options[:app_name]
    )

    # Gérer les certificats automatiquement
    match(
      type: "appstore",
      app_identifier: options[:bundle_id],
      readonly: true
    )

    # Build
    build_app(
      scheme: "Runner",
      export_method: "app-store",
      output_directory: "./build",
      output_name: "#{options[:event_id]}.ipa"
    )

    # Upload
    upload_to_app_store(
      skip_metadata: false,
      skip_screenshots: true,
      force: true,
      submit_for_review: true,
      automatic_release: true,
      precheck_include_in_app_purchases: false,
      app_version: "1.0.0"
    )
  end
end
```

### app/ios/fastlane/Appfile

```ruby
app_identifier ENV["BUNDLE_ID"]
apple_id "admin@tamarque.com"
itc_team_id "123456789"
team_id "ABCDEFGHIJ"
```

---

## 6. CONFIGURATION FASTLANE — ANDROID

### app/android/fastlane/Fastfile

```ruby
default_platform(:android)

platform :android do
  desc "Build and upload to Play Store"
  lane :build_and_upload do |options|
    # Mettre à jour le applicationId dans le gradle
    # (Alternative: utiliser des variables d'env dans build.gradle)
    
    # Build AAB
    gradle(
      task: "bundle",
      build_type: "Release",
      properties: {
        "applicationId" => options[:bundle_id],
        "appName" => options[:app_name]
      }
    )

    # Upload
    upload_to_play_store(
      track: "production",  # ou "internal" pour tests
      aab: "./app/build/outputs/bundle/release/app-release.aab",
      skip_upload_metadata: false,
      skip_upload_images: true,
      skip_upload_screenshots: true,
      json_key: ENV["GOOGLE_PLAY_JSON_KEY"]
    )
  end
end
```

### app/android/fastlane/Appfile

```ruby
json_key_file ENV["GOOGLE_PLAY_JSON_KEY"]
package_name ENV["BUNDLE_ID"]
```

---

## 7. GÉNÉRATION D'ICÔNES

### Script de génération d'icônes (scripts/generate_icons.sh)

```bash
#!/bin/bash
set -e

CLIENT_SLUG=$1
ICON_SOURCE="./clients/$CLIENT_SLUG/assets/icon_1024.png"

# iOS icons
SIZES_IOS=(20 29 40 58 60 76 80 87 120 152 167 180 1024)
for size in "${SIZES_IOS[@]}"; do
  convert "$ICON_SOURCE" -resize ${size}x${size} \
    "./app/ios/Runner/Assets.xcassets/AppIcon.appiconset/icon_${size}.png"
done

# Android icons
declare -A SIZES_ANDROID=(
  ["mdpi"]=48
  ["hdpi"]=72
  ["xhdpi"]=96
  ["xxhdpi"]=144
  ["xxxhdpi"]=192
)
for density in "${!SIZES_ANDROID[@]}"; do
  size=${SIZES_ANDROID[$density]}
  convert "$ICON_SOURCE" -resize ${size}x${size} \
    "./app/android/app/src/main/res/mipmap-${density}/ic_launcher.png"
done

echo "✅ Icons generated for $CLIENT_SLUG"
```

---

## 8. GÉNÉRATION DU QR CODE

### scripts/generate_qr.sh

```bash
#!/bin/bash
set -e

CLIENT_SLUG=$1
CONFIG_FILE="./clients/$CLIENT_SLUG/config.json"

# Lire les URLs des stores depuis la config (ou la BDD)
STORE_URL_IOS=$(jq -r '.store_url_ios // empty' "$CONFIG_FILE")
STORE_URL_ANDROID=$(jq -r '.store_url_android // empty' "$CONFIG_FILE")

# Créer une page de redirection intelligente
REDIRECT_URL="https://app.tamarque.com/download/$CLIENT_SLUG"

# Générer le QR code
qrencode -s 10 -o "./clients/$CLIENT_SLUG/qr_code.png" "$REDIRECT_URL"

echo "✅ QR code generated: ./clients/$CLIENT_SLUG/qr_code.png"
echo "   URL: $REDIRECT_URL"
```

### Page de redirection intelligente (cms/pages/download/[slug].tsx)

```javascript
import { useEffect } from 'react';
import { GetServerSideProps } from 'next';

const DownloadPage = ({ event }) => {
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      window.location.href = event.store_url_ios;
    } else if (/android/.test(userAgent)) {
      window.location.href = event.store_url_android;
    }
  }, []);

  return (
    <div className="download-page">
      <h1>{event.title}</h1>
      <p>Téléchargez l'application :</p>
      <a href={event.store_url_ios}>App Store (iPhone)</a>
      <a href={event.store_url_android}>Play Store (Android)</a>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const event = await fetchEvent(params.slug);
  return { props: { event } };
};

export default DownloadPage;
```

---

## 9. TEMPLATE APPLE-APPROVED

### Pourquoi

Apple peut rejeter une app pour plein de raisons. En faisant valider une version "template" en amont, on s'assure que la structure, les permissions, et le flow sont conformes.

### Process

1. Créer un événement de démo dans le CMS (faux mariage, contenu réaliste)
2. Builder l'app avec cette config
3. Soumettre sur l'App Store sous le nom de ta marque (ex: "MyEvent Demo")
4. Attendre la validation Apple
5. Une fois validée, tagger en Git : `v1.0.0-apple-approved`
6. Cette version devient la baseline

### Points de vigilance Apple

| Règle | Solution |
|-------|----------|
| Permissions inutiles | Ne demander que les permissions utilisées |
| Privacy Policy manquante | Page web obligatoire, linkée dans l'app et le store |
| Guideline 4.2.6 (template apps) | Contenu unique par app (c'est le cas) |
| Metadata insuffisante | Description unique pour chaque app |
| Minimum functionality | Modules interactifs (RSVP, galerie, chat) |

### Description store template

```
[NOM DE L'ÉVÉNEMENT] — L'application officielle

Retrouvez toutes les informations de [l'événement] :
• Programme et déroulé de la journée
• Plan d'accès et informations pratiques
• Confirmez votre présence (RSVP)
• Partagez vos photos en direct
• Et bien plus encore !

Téléchargez l'app pour ne rien manquer.
```

---

## 10. AUTOMATISATION CI/CD (OPTIONNEL)

### GitHub Actions — .github/workflows/build.yml

```yaml
name: Build and Deploy

on:
  push:
    paths:
      - 'clients/*/config.json'

jobs:
  detect-client:
    runs-on: ubuntu-latest
    outputs:
      client_slug: ${{ steps.detect.outputs.client_slug }}
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 2
      - id: detect
        run: |
          CLIENT=$(git diff --name-only HEAD~1 HEAD | grep 'clients/' | head -1 | cut -d'/' -f2)
          echo "client_slug=$CLIENT" >> $GITHUB_OUTPUT

  build-ios:
    needs: detect-client
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.0'
      - name: Install Fastlane
        run: gem install fastlane
      - name: Build iOS
        env:
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
          APP_STORE_CONNECT_API_KEY: ${{ secrets.APP_STORE_CONNECT_API_KEY }}
        run: |
          cd app/ios
          fastlane build_and_upload client_slug:${{ needs.detect-client.outputs.client_slug }}

  build-android:
    needs: detect-client
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'
      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.0'
      - name: Install Fastlane
        run: gem install fastlane
      - name: Build Android
        env:
          GOOGLE_PLAY_JSON_KEY: ${{ secrets.GOOGLE_PLAY_JSON_KEY }}
          ANDROID_KEYSTORE_BASE64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
        run: |
          cd app/android
          fastlane build_and_upload client_slug:${{ needs.detect-client.outputs.client_slug }}

  notify:
    needs: [build-ios, build-android]
    runs-on: ubuntu-latest
    steps:
      - name: Send Slack notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: "Build terminé pour ${{ needs.detect-client.outputs.client_slug }}"
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 11. VERSIONING & BRANCHES GIT

```
main            ← Version stable, validée par Apple. NE JAMAIS PUSH DIRECTEMENT.
develop         ← Branche de développement au quotidien
feature/*       ← Nouvelles fonctionnalités (ex: feature/chat-module)
hotfix/*        ← Corrections urgentes
```

**On ne crée PAS de branche par client.** Les clients sont gérés uniquement par leur dossier dans `/clients/` et leur config en BDD.

### Tags

```
v1.0.0-approved     ← Première version validée par Apple
v1.1.0              ← Ajout du module playlist
v1.2.0              ← Ajout du module chat
```

---

## CHECKLIST DE VALIDATION

- [ ] Fastlane installé et configuré (iOS + Android)
- [ ] Certificats iOS de distribution configurés (match)
- [ ] Keystore Android créé et sécurisé
- [ ] Script `build.sh` fonctionne en local
- [ ] Build iOS réussi sans erreur
- [ ] Build Android réussi sans erreur
- [ ] Upload vers App Store Connect fonctionnel
- [ ] Upload vers Play Store fonctionnel
- [ ] QR code généré automatiquement
- [ ] Page de redirection intelligente (iOS/Android)
- [ ] Template validé par Apple (v1.0.0-approved)
- [ ] CI/CD configuré (optionnel)

---

> **Étape suivante** : [08_process_et_livraison.md](08_process_et_livraison.md)
