/**
 * API Route - Opérations sur un événement spécifique
 * GET /api/events/[id] - Récupère un événement
 * PUT /api/events/[id] - Met à jour un événement
 * DELETE /api/events/[id] - Supprime un événement
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

  const { id, action } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Event ID required' });
  }

  try {
    // Construire l'endpoint
    let endpoint = `/api/events/${id}`;
    let method = req.method || 'GET';
    
    // Gérer les actions spéciales (status, lifecycle, etc.)
    if (action) {
      endpoint = `/api/events/${id}/${action}`;
      // Les actions sont généralement POST ou PATCH
      if (action === 'status') {
        method = 'PATCH';
      }
    }

    // Appel à l'API backend
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: method !== 'GET' ? JSON.stringify(req.body) : undefined,
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
