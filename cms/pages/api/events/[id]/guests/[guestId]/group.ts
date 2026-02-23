/**
 * API Route - Mise à jour du groupe d'un invité
 * PUT /api/events/[id]/guests/[guestId]/group - Met à jour le groupe
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

  const { id, guestId } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Event ID required' });
  }

  if (!guestId || typeof guestId !== 'string') {
    return res.status(400).json({ error: 'Guest ID required' });
  }

  const endpoint = `/api/events/${id}/guests/${guestId}/group`;

  try {
    // PUT: Mettre à jour le groupe de l'invité
    if (req.method === 'PUT') {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
        body: JSON.stringify(req.body),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'API error' }));
        return res.status(response.status).json(error);
      }

      const data = await response.json();
      return res.status(200).json(data);
    }

    // Méthode non autorisée
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error: any) {
    console.error('Guest group API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
