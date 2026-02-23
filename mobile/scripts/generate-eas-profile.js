#!/usr/bin/env node
/**
 * Script d'automatisation pour générer les profils EAS
 * Usage: node scripts/generate-eas-profile.js <event_id>
 */

const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'https://api.oninvite.fr';
const API_KEY = process.env.API_KEY || 'oninvite-admin-key-2026-secure';

// Fonction pour normaliser le slug (bundle identifier compatible)
function normalizeSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '')     // Remove special chars
    .slice(0, 30);                   // Limit length
}

// Récupère les données de l'événement depuis l'API
async function fetchEvent(eventId) {
  const response = await fetch(`${API_URL}/api/admin/events/${eventId}`, {
    headers: {
      'X-API-Key': API_KEY,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch event: ${response.status}`);
  }
  
  return response.json();
}

// Génère le profil EAS pour un événement
function generateEasProfile(event) {
  const slug = normalizeSlug(event.couple_names || event.title);
  const profileName = `client-${slug}`;
  
  return {
    profileName,
    config: {
      extends: 'production',
      env: {
        EXPO_PUBLIC_EVENT_ID: event.id,
        EXPO_PUBLIC_API_URL: API_URL,
        EXPO_PUBLIC_EVENT_NAME: event.title,
        EXPO_PUBLIC_COUPLE_NAMES: event.couple_names || '',
        EXPO_PUBLIC_PRIMARY_COLOR: event.primary_color || '#D4AF37',
      },
      ios: {
        bundleIdentifier: `fr.oninvite.event.${slug}`,
      },
      android: {
        package: `fr.oninvite.event.${slug}`,
      },
    },
  };
}

// Met à jour le fichier eas.json avec le nouveau profil
function updateEasJson(profileName, config) {
  const easPath = path.join(__dirname, '..', 'eas.json');
  
  // Lecture du fichier existant
  let easConfig;
  try {
    easConfig = JSON.parse(fs.readFileSync(easPath, 'utf8'));
  } catch (err) {
    console.error('Could not read eas.json:', err.message);
    process.exit(1);
  }
  
  // Ajout du nouveau profil
  easConfig.build[profileName] = config;
  
  // Sauvegarde
  fs.writeFileSync(easPath, JSON.stringify(easConfig, null, 2));
  
  return easConfig;
}

// Génère le fichier app.config.js dynamique
function generateAppConfig(event) {
  const slug = normalizeSlug(event.couple_names || event.title);
  
  const config = `
// Configuration dynamique générée pour: ${event.title}
// Event ID: ${event.id}
// Date: ${event.event_date}

module.exports = ({ config }) => {
  const eventId = process.env.EXPO_PUBLIC_EVENT_ID || '${event.id}';
  const eventName = process.env.EXPO_PUBLIC_EVENT_NAME || '${event.title}';
  const coupleNames = process.env.EXPO_PUBLIC_COUPLE_NAMES || '${event.couple_names || ''}';
  const primaryColor = process.env.EXPO_PUBLIC_PRIMARY_COLOR || '${event.primary_color || '#D4AF37'}';
  
  return {
    ...config,
    name: eventName,
    slug: 'oninvite-${slug}',
    extra: {
      ...config.extra,
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.oninvite.fr',
      eventId,
      eventName,
      coupleNames,
      primaryColor,
    },
    splash: {
      ...config.splash,
      backgroundColor: primaryColor,
    },
  };
};
`.trim();

  return config;
}

// Script principal
async function main() {
  const eventId = process.argv[2];
  
  if (!eventId) {
    console.log('Usage: node scripts/generate-eas-profile.js <event_id>');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/generate-eas-profile.js abc123-def456');
    console.log('');
    process.exit(1);
  }
  
  console.log(`\n🚀 Generating EAS profile for event: ${eventId}\n`);
  
  try {
    // 1. Récupérer les données de l'événement
    console.log('📡 Fetching event data...');
    const event = await fetchEvent(eventId);
    console.log(`   ✓ Found: ${event.title}`);
    console.log(`   ✓ Couple: ${event.couple_names || 'N/A'}`);
    console.log(`   ✓ Date: ${event.event_date}`);
    
    // 2. Générer le profil EAS
    console.log('\n🔧 Generating EAS profile...');
    const { profileName, config } = generateEasProfile(event);
    console.log(`   ✓ Profile name: ${profileName}`);
    console.log(`   ✓ iOS Bundle: ${config.ios.bundleIdentifier}`);
    console.log(`   ✓ Android Package: ${config.android.package}`);
    
    // 3. Mettre à jour eas.json
    console.log('\n📝 Updating eas.json...');
    updateEasJson(profileName, config);
    console.log('   ✓ eas.json updated');
    
    // 4. Afficher les commandes de build
    console.log('\n✅ Profile ready! Build commands:');
    console.log('');
    console.log(`   # iOS`);
    console.log(`   eas build --profile ${profileName} --platform ios`);
    console.log('');
    console.log(`   # Android`);
    console.log(`   eas build --profile ${profileName} --platform android`);
    console.log('');
    console.log(`   # Both platforms`);
    console.log(`   eas build --profile ${profileName} --platform all`);
    console.log('');
    
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

main();
