#!/bin/bash
#
# Exporte la liste des invités d'un événement au format CSV
#
# Usage: ./export_guests.sh <event_id> [output_file]
#
set -e

EVENT_ID=$1
OUTPUT_FILE=${2:-"guests_export_$(date +%Y%m%d_%H%M%S).csv"}

if [ -z "$EVENT_ID" ]; then
  echo "Usage: ./export_guests.sh <event_id> [output_file]"
  echo ""
  echo "Examples:"
  echo "  ./export_guests.sh abc123-def456"
  echo "  ./export_guests.sh abc123-def456 invites_mariage.csv"
  exit 1
fi

# URL de l'API (utiliser la variable d'env ou localhost par défaut)
API_URL="${API_BASE_URL:-http://localhost:8000}"

echo "📋 Exporting guests for event: $EVENT_ID"
echo "   API: $API_URL"

# Récupérer les invités via l'API
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/events/$EVENT_ID/guests?limit=10000")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ Error: Failed to fetch guests (HTTP $HTTP_CODE)"
  echo "$BODY"
  exit 1
fi

# Vérifier que jq est installé
if ! command -v jq &> /dev/null; then
  echo "❌ jq is required. Install with: brew install jq"
  exit 1
fi

# Convertir en CSV
echo "name,email,phone,rsvp_status,guests_count,dietary_info,message,created_at" > "$OUTPUT_FILE"

echo "$BODY" | jq -r '.[] | [
  .name // "",
  .email // "",
  .phone // "",
  .rsvp_status // "",
  (.guests_count // 1 | tostring),
  .dietary_info // "",
  (.message // "" | gsub("\n"; " ") | gsub("\""; "\\\"")),
  .created_at // ""
] | @csv' >> "$OUTPUT_FILE"

# Compter les lignes
TOTAL=$(($(wc -l < "$OUTPUT_FILE") - 1))
CONFIRMED=$(echo "$BODY" | jq '[.[] | select(.rsvp_status == "confirmed")] | length')
DECLINED=$(echo "$BODY" | jq '[.[] | select(.rsvp_status == "declined")] | length')
PENDING=$(echo "$BODY" | jq '[.[] | select(.rsvp_status == "pending")] | length')
TOTAL_GUESTS=$(echo "$BODY" | jq '[.[] | select(.rsvp_status == "confirmed") | .guests_count] | add // 0')

echo ""
echo "✅ Export complete: $OUTPUT_FILE"
echo ""
echo "📊 Summary:"
echo "   Total RSVPs: $TOTAL"
echo "   Confirmed: $CONFIRMED"
echo "   Declined: $DECLINED"
echo "   Pending: $PENDING"
echo "   Total guests (confirmed): $TOTAL_GUESTS"
