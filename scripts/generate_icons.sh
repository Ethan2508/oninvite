#!/bin/bash
#
# Génère les icônes à toutes les tailles requises pour iOS et Android
#
# Usage: ./generate_icons.sh <client_slug>
#
# Prérequis: ImageMagick (brew install imagemagick)
#
set -e

CLIENT_SLUG=$1

if [ -z "$CLIENT_SLUG" ]; then
  echo "Usage: ./generate_icons.sh <client_slug>"
  exit 1
fi

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLIENT_DIR="$PROJECT_ROOT/clients/$CLIENT_SLUG"
ICON_SOURCE="$CLIENT_DIR/assets/icon_1024.png"
MOBILE_DIR="$PROJECT_ROOT/mobile"

if [ ! -f "$ICON_SOURCE" ]; then
  echo "❌ Icon source not found: $ICON_SOURCE"
  exit 1
fi

# Vérifier que ImageMagick est installé
if ! command -v convert &> /dev/null; then
  echo "❌ ImageMagick is required. Install with: brew install imagemagick"
  exit 1
fi

echo "🎨 Generating icons from: $ICON_SOURCE"

# Créer les répertoires de destination
mkdir -p "$CLIENT_DIR/assets/ios"
mkdir -p "$CLIENT_DIR/assets/android"

# ===== iOS Icons =====
echo "  📱 Generating iOS icons..."

declare -a IOS_SIZES=(
  "20"    # Notification 20pt @1x
  "29"    # Settings 29pt @1x  
  "40"    # Spotlight 40pt @1x, Notification 20pt @2x
  "58"    # Settings 29pt @2x
  "60"    # iPhone App 60pt @1x
  "76"    # iPad App 76pt @1x
  "80"    # Spotlight 40pt @2x
  "87"    # Settings 29pt @3x
  "120"   # iPhone App 60pt @2x, Spotlight 40pt @3x
  "152"   # iPad App 76pt @2x
  "167"   # iPad Pro App 83.5pt @2x
  "180"   # iPhone App 60pt @3x
  "1024"  # App Store
)

for size in "${IOS_SIZES[@]}"; do
  convert "$ICON_SOURCE" -resize "${size}x${size}" \
    "$CLIENT_DIR/assets/ios/icon_${size}.png"
done

echo "    ✓ ${#IOS_SIZES[@]} iOS icons generated"

# ===== Android Icons =====
echo "  🤖 Generating Android icons..."

declare -A ANDROID_SIZES=(
  ["mdpi"]="48"
  ["hdpi"]="72"
  ["xhdpi"]="96"
  ["xxhdpi"]="144"
  ["xxxhdpi"]="192"
)

for density in "${!ANDROID_SIZES[@]}"; do
  size=${ANDROID_SIZES[$density]}
  mkdir -p "$CLIENT_DIR/assets/android/mipmap-${density}"
  
  convert "$ICON_SOURCE" -resize "${size}x${size}" \
    "$CLIENT_DIR/assets/android/mipmap-${density}/ic_launcher.png"
  
  # Générer aussi la version ronde
  convert "$ICON_SOURCE" -resize "${size}x${size}" \
    \( +clone -threshold -1 -negate -fill white -draw "circle $((size/2)),$((size/2)) $((size/2)),0" \) \
    -alpha off -compose copy_opacity -composite \
    "$CLIENT_DIR/assets/android/mipmap-${density}/ic_launcher_round.png" 2>/dev/null || \
  cp "$CLIENT_DIR/assets/android/mipmap-${density}/ic_launcher.png" \
     "$CLIENT_DIR/assets/android/mipmap-${density}/ic_launcher_round.png"
done

echo "    ✓ ${#ANDROID_SIZES[@]} Android density sets generated"

# ===== Copier les icônes principales dans mobile =====
mkdir -p "$MOBILE_DIR/assets/client"
cp "$ICON_SOURCE" "$MOBILE_DIR/assets/client/icon_1024.png"

echo ""
echo "✅ Icons generated for $CLIENT_SLUG"
echo "   iOS: $CLIENT_DIR/assets/ios/"
echo "   Android: $CLIENT_DIR/assets/android/"
