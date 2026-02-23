/**
 * API Route - Import CSV des invités
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

const API_URL = process.env.API_URL || 'https://api.oninvite.fr';
const API_KEY = process.env.API_KEY || '';

interface GuestImport {
  name: string;
  first_name?: string;
  email?: string;
  phone?: string;
  group_name?: string;
  notes?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vérifier l'authentification
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const eventId = req.query.id as string;
    const { guests } = req.body as { guests: GuestImport[] };

    if (!guests || !Array.isArray(guests)) {
      return res.status(400).json({ error: 'Invalid guests data' });
    }

    // Créer chaque invité via l'API backend
    const results = {
      created: 0,
      errors: [] as string[],
    };

    for (const guest of guests) {
      try {
        const response = await fetch(`${API_URL}/api/events/${eventId}/guests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY,
          },
          body: JSON.stringify({
            name: `${guest.first_name || ''} ${guest.name}`.trim(),
            first_name: guest.first_name,
            email: guest.email || null,
            phone: guest.phone || null,
            status: 'pending',
            plus_ones: 0,
          }),
        });

        if (response.ok) {
          results.created++;
        } else {
          const error = await response.json().catch(() => ({ detail: 'Error' }));
          results.errors.push(`${guest.name}: ${error.detail}`);
        }
      } catch (err: any) {
        results.errors.push(`${guest.name}: ${err.message}`);
      }
    }

    return res.status(200).json(results);
  } catch (error: any) {
    console.error('[API Route] Import error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};
