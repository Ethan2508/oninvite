/**
 * API Route - Opérations sur un sous-événement spécifique
 * GET /api/events/[id]/sub-events/[subEventId] - Récupère un sous-événement
 * PUT /api/events/[id]/sub-events/[subEventId] - Met à jour un sous-événement
 * DELETE /api/events/[id]/sub-events/[subEventId] - Supprime un sous-événement
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

  const { id, subEventId } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Event ID required' });
  }

  if (!subEventId || typeof subEventId !== 'string') {
    return res.status(400).json({ error: 'Sub-event ID required' });
  }

  const endpoint = `/api/events/${id}/sub-events/${subEventId}`;

  try {
    // GET: Récupérer un sous-événement
    if (req.method === 'GET') {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'API error' }));
        return res.status(response.status).json(error);
      }

      const data = await response.json();
      return res.status(200).json(data);
    }

    // PUT: Mettre à jour un sous-événement
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

    // DELETE: Supprimer un sous-événement
    if (req.method === 'DELETE') {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'API error' }));
        return res.status(response.status).json(error);
      }

      return res.status(204).end();
    }

    // Méthode non autorisée
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error: any) {
    console.error('Sub-event API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
