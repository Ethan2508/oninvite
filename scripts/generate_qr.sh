#!/bin/bash
#
# Génère un QR code redirigeant vers la page de téléchargement de l'app
#
# Usage: ./generate_qr.sh <client_slug>
#
# Prérequis: qrencode (brew install qrencode)
#
set -e

CLIENT_SLUG=$1

if [ -z "$CLIENT_SLUG" ]; then
  echo "Usage: ./generate_qr.sh <client_slug>"
  exit 1
fi

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLIENT_DIR="$PROJECT_ROOT/clients/$CLIENT_SLUG"
CONFIG_FILE="$CLIENT_DIR/config.json"

if [ ! -d "$CLIENT_DIR" ]; then
  echo "❌ Client directory not found: $CLIENT_DIR"
  exit 1
fi

# URL de base pour la redirection (configurée via env ou config)
BASE_URL="${DOWNLOAD_BASE_URL:-https://app.savethedate.app}"
REDIRECT_URL="$BASE_URL/download/$CLIENT_SLUG"

echo "📱 Generating QR code for: $CLIENT_SLUG"
echo "   URL: $REDIRECT_URL"

# Vérifier si qrencode est disponible
if command -v qrencode &> /dev/null; then
  # Utiliser qrencode
  qrencode -s 10 -l H -o "$CLIENT_DIR/qr_code.png" "$REDIRECT_URL"
  echo "   Generated: $CLIENT_DIR/qr_code.png"
  
  # Générer aussi une version SVG
  qrencode -t SVG -l H -o "$CLIENT_DIR/qr_code.svg" "$REDIRECT_URL"
  echo "   Generated: $CLIENT_DIR/qr_code.svg"
  
elif command -v npx &> /dev/null; then
  # Alternative avec Node.js
  echo "   Using Node.js qrcode..."
  npx qrcode -o "$CLIENT_DIR/qr_code.png" "$REDIRECT_URL"
  echo "   Generated: $CLIENT_DIR/qr_code.png"
  
elif command -v python3 &> /dev/null; then
  # Alternative avec Python
  echo "   Using Python qrcode..."
  python3 -c "
import qrcode
qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=4)
qr.add_data('$REDIRECT_URL')
qr.make(fit=True)
img = qr.make_image(fill_color='black', back_color='white')
img.save('$CLIENT_DIR/qr_code.png')
"
  echo "   Generated: $CLIENT_DIR/qr_code.png"
  
else
  echo "⚠️  No QR code generator found."
  echo "   Install one of: qrencode (brew install qrencode)"
  echo "   Or use: npx qrcode"
  echo "   Or use: pip install qrcode[pil]"
  
  # Créer un fichier texte avec l'URL en fallback
  echo "$REDIRECT_URL" > "$CLIENT_DIR/qr_url.txt"
  echo "   Created: $CLIENT_DIR/qr_url.txt (manual QR generation needed)"
fi

# Créer aussi un fichier HTML avec le QR intégré
cat > "$CLIENT_DIR/qr_display.html" <<EOF
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Télécharger l'application</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 40px;
      background: rgba(255,255,255,0.1);
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }
    h1 { margin-bottom: 10px; }
    p { opacity: 0.9; margin-bottom: 30px; }
    .qr-code {
      background: white;
      padding: 20px;
      border-radius: 10px;
      display: inline-block;
    }
    .qr-code img { display: block; }
    .url { 
      margin-top: 20px; 
      font-size: 12px; 
      opacity: 0.7;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📱 Téléchargez l'application</h1>
    <p>Scannez le QR code avec votre téléphone</p>
    <div class="qr-code">
      <img src="qr_code.png" alt="QR Code" width="200" height="200">
    </div>
    <div class="url">$REDIRECT_URL</div>
  </div>
</body>
</html>
EOF

echo "   Generated: $CLIENT_DIR/qr_display.html"
echo ""
echo "✅ QR code generation complete"
