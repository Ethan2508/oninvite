/**
 * API Route - Générer profil EAS pour un événement
 * POST /api/events/[id]/generate-eas
 */
import type { NextApiRequest, NextApiResponse } from 'next';

interface EasProfile {
  profileName: string;
  config: {
    extends: string;
    env: Record<string, string>;
    ios: { bundleIdentifier: string };
    android: { package: string };
  };
  buildCommands: {
    ios: string;
    android: string;
    all: string;
  };
}

function normalizeSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 30);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const apiUrl = process.env.API_URL || 'https://api.oninvite.fr';
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API_KEY not configured' });
  }

  try {
    // Fetch event data
    const response = await fetch(`${apiUrl}/api/admin/events/${id}`, {
      headers: {
        'X-API-Key': apiKey,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch event' });
    }

    const event = await response.json();
    
    // Generate profile
    const slug = normalizeSlug(event.couple_names || event.title);
    const profileName = `client-${slug}`;
    
    const profile: EasProfile = {
      profileName,
      config: {
        extends: 'production',
        env: {
          EXPO_PUBLIC_EVENT_ID: event.id,
          EXPO_PUBLIC_API_URL: apiUrl,
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
      buildCommands: {
        ios: `eas build --profile ${profileName} --platform ios`,
        android: `eas build --profile ${profileName} --platform android`,
        all: `eas build --profile ${profileName} --platform all`,
      },
    };

    res.status(200).json(profile);
  } catch (error) {
    console.error('EAS generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
