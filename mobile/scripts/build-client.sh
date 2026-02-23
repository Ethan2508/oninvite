#!/bin/bash
# Script de build white-label pour SaveTheDate
# Usage: ./build-client.sh <event_slug> <platform>
# Exemple: ./build-client.sh marie-jean-wedding ios

set -e

EVENT_SLUG=$1
PLATFORM=$2

if [ -z "$EVENT_SLUG" ] || [ -z "$PLATFORM" ]; then
    echo "Usage: ./build-client.sh <event_slug> <platform>"
    echo "  event_slug: L'identifiant unique de l'événement (ex: marie-jean-wedding)"
    echo "  platform: ios ou android"
    exit 1
fi

if [ "$PLATFORM" != "ios" ] && [ "$PLATFORM" != "android" ]; then
    echo "Platform must be 'ios' or 'android'"
    exit 1
fi

echo "🚀 Building SaveTheDate for event: $EVENT_SLUG ($PLATFORM)"

# Récupérer la config de l'événement depuis l'API
API_URL="${API_URL:-http://localhost:8000}"
echo "📡 Fetching config from $API_URL/api/events/slug/$EVENT_SLUG/config"

CONFIG=$(curl -s "$API_URL/api/events/slug/$EVENT_SLUG/config")

if [ -z "$CONFIG" ] || [ "$CONFIG" = "null" ]; then
    echo "❌ Failed to fetch config for event: $EVENT_SLUG"
    exit 1
fi

# Extraire les infos de la config
APP_NAME=$(echo $CONFIG | python3 -c "import sys, json; print(json.load(sys.stdin).get('branding', {}).get('app_name', 'SaveTheDate'))")
PRIMARY_COLOR=$(echo $CONFIG | python3 -c "import sys, json; print(json.load(sys.stdin).get('branding', {}).get('colors', {}).get('primary', '#D4AF37'))")

echo "📱 App Name: $APP_NAME"
echo "🎨 Primary Color: $PRIMARY_COLOR"

# Créer une version customisée de app.json
echo "📝 Creating custom app.json..."

cat > app.json.tmp << EOF
{
  "expo": {
    "name": "$APP_NAME",
    "slug": "oninvite-$EVENT_SLUG",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./src/assets/images/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./src/assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "fr.oninvite.$EVENT_SLUG"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./src/assets/images/adaptive-icon.png",
        "backgroundColor": "$PRIMARY_COLOR"
      },
      "package": "fr.oninvite.$(echo $EVENT_SLUG | tr '-' '_')"
    },
    "web": {
      "favicon": "./src/assets/images/favicon.png"
    },
    "plugins": ["expo-font", "expo-notifications"],
    "extra": {
      "apiUrl": "$API_URL",
      "eventId": "$EVENT_SLUG",
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
EOF

# Backup original app.json
cp app.json app.json.backup

# Use custom app.json
mv app.json.tmp app.json

echo "🔨 Building $PLATFORM..."

# Build avec EAS
npx eas-cli build --platform $PLATFORM --profile production --non-interactive

# Restore original app.json
mv app.json.backup app.json

echo "✅ Build completed for $EVENT_SLUG ($PLATFORM)"
