/**
 * API Route - Liste des événements
 * Protège l'API key côté serveur
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

const API_URL = process.env.API_URL || 'https://api.oninvite.fr';
const API_KEY = process.env.API_KEY || '';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Vérifier l'authentification
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { status, eventId } = req.query;
    
    // Déterminer l'endpoint
    let endpoint = '/api/events/';
    if (eventId) {
      endpoint = `/api/events/${eventId}`;
    }
    
    // Ajouter les paramètres
    const params = new URLSearchParams();
    if (status && !eventId) {
      params.append('status', status as string);
    }
    const query = params.toString() ? `?${params}` : '';

    // Appel à l'API backend
    const response = await fetch(`${API_URL}${endpoint}${query}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'API error' }));
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('[API Route] Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
