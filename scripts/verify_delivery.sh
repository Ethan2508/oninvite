#!/bin/bash
#
# Vérifie la checklist de livraison pour un client
# Effectue des vérifications automatiques quand c'est possible
#
# Usage: ./verify_delivery.sh <client_slug>
#
set -e

CLIENT_SLUG=$1

if [ -z "$CLIENT_SLUG" ]; then
  echo "Usage: ./verify_delivery.sh <client_slug>"
  exit 1
fi

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLIENT_DIR="$PROJECT_ROOT/clients/$CLIENT_SLUG"
CONFIG_FILE="$CLIENT_DIR/config.json"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ Client not found: $CLIENT_SLUG"
  exit 1
fi

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0

check_pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((PASS_COUNT++))
}

check_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
  ((WARN_COUNT++))
}

check_fail() {
  echo -e "${RED}✗${NC} $1"
  ((FAIL_COUNT++))
}

echo "═══════════════════════════════════════════════════════════════"
echo "📋 Checklist de Livraison — $CLIENT_SLUG"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# === Vérifications automatiques ===

echo "📄 CONTENU"
echo "---"

# Titre
TITLE=$(jq -r '.title // empty' "$CONFIG_FILE")
if [ -n "$TITLE" ]; then
  check_pass "Titre: $TITLE"
else
  check_fail "Titre manquant"
fi

# Date
EVENT_DATE=$(jq -r '.event_date // empty' "$CONFIG_FILE")
if [ -n "$EVENT_DATE" ]; then
  check_pass "Date: $EVENT_DATE"
else
  check_fail "Date de l'événement manquante"
fi

# Lieux
LOCATIONS_COUNT=$(jq '.locations | length' "$CONFIG_FILE" 2>/dev/null || echo "0")
if [ "$LOCATIONS_COUNT" -gt 0 ]; then
  check_pass "Lieux: $LOCATIONS_COUNT configurés"
else
  check_warn "Aucun lieu configuré"
fi

# Programme
PROGRAM_COUNT=$(jq '.program | length' "$CONFIG_FILE" 2>/dev/null || echo "0")
if [ "$PROGRAM_COUNT" -gt 0 ]; then
  check_pass "Programme: $PROGRAM_COUNT éléments"
else
  check_warn "Programme vide"
fi

echo ""
echo "🎨 BRANDING"
echo "---"

# Icône
if [ -f "$CLIENT_DIR/assets/icon_1024.png" ]; then
  # Vérifier la taille
  if command -v identify &> /dev/null; then
    SIZE=$(identify -format "%wx%h" "$CLIENT_DIR/assets/icon_1024.png" 2>/dev/null || echo "unknown")
    if [ "$SIZE" = "1024x1024" ]; then
      check_pass "Icône 1024x1024"
    else
      check_warn "Icône: $SIZE (devrait être 1024x1024)"
    fi
  else
    check_pass "Icône présente (taille non vérifiée)"
  fi
else
  check_fail "Icône manquante (icon_1024.png)"
fi

# Splash screen
if [ -f "$CLIENT_DIR/assets/splash.png" ]; then
  check_pass "Splash screen présent"
else
  check_warn "Splash screen manquant"
fi

# Logo
if [ -f "$CLIENT_DIR/assets/logo.png" ]; then
  check_pass "Logo présent"
else
  check_warn "Logo manquant"
fi

# Couleurs
PRIMARY_COLOR=$(jq -r '.branding.primary_color // empty' "$CONFIG_FILE")
if [ -n "$PRIMARY_COLOR" ]; then
  check_pass "Couleur primaire: $PRIMARY_COLOR"
else
  check_warn "Couleur primaire non définie"
fi

echo ""
echo "🔌 MODULES"
echo "---"

# Vérifier les modules activés
MODULES=$(jq -r '.modules | to_entries | .[] | select(.value == true) | .key' "$CONFIG_FILE" 2>/dev/null || echo "")
if [ -n "$MODULES" ]; then
  for module in $MODULES; do
    check_pass "Module activé: $module"
  done
else
  check_warn "Aucun module activé"
fi

echo ""
echo "📱 STORES"
echo "---"

# URLs des stores
STORE_IOS=$(jq -r '.store_url_ios // empty' "$CONFIG_FILE")
STORE_ANDROID=$(jq -r '.store_url_android // empty' "$CONFIG_FILE")

if [ -n "$STORE_IOS" ] && [ "$STORE_IOS" != "" ]; then
  check_pass "URL App Store configurée"
else
  check_warn "URL App Store non configurée"
fi

if [ -n "$STORE_ANDROID" ] && [ "$STORE_ANDROID" != "" ]; then
  check_pass "URL Play Store configurée"
else
  check_warn "URL Play Store non configurée"
fi

# QR Code
if [ -f "$CLIENT_DIR/qr_code.png" ]; then
  check_pass "QR code généré"
else
  check_fail "QR code non généré (lancer ./scripts/generate_qr.sh $CLIENT_SLUG)"
fi

echo ""
echo "📝 METADATA"
echo "---"

# Métadonnées stores
if [ -f "$CLIENT_DIR/metadata/description.txt" ]; then
  check_pass "Description store présente"
else
  check_warn "Description store manquante"
fi

if [ -f "$CLIENT_DIR/metadata/app_name.txt" ]; then
  check_pass "Nom de l'app défini"
else
  check_warn "Nom de l'app non défini"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Résumé
echo "📊 RÉSUMÉ"
echo "---"
echo -e "   ${GREEN}Validé: $PASS_COUNT${NC}"
echo -e "   ${YELLOW}Avertissements: $WARN_COUNT${NC}"
echo -e "   ${RED}Erreurs: $FAIL_COUNT${NC}"
echo ""

if [ "$FAIL_COUNT" -gt 0 ]; then
  echo -e "${RED}❌ Livraison non prête — corrigez les erreurs${NC}"
  exit 1
elif [ "$WARN_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Livraison possible avec avertissements${NC}"
  exit 0
else
  echo -e "${GREEN}✅ Livraison prête !${NC}"
  exit 0
fi
