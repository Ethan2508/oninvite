/**
 * API Route - Opérations sur un groupe spécifique
 * GET /api/events/[id]/groups/[groupId] - Récupère un groupe
 * PUT /api/events/[id]/groups/[groupId] - Met à jour un groupe
 * DELETE /api/events/[id]/groups/[groupId] - Supprime un groupe
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

  const { id, groupId } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Event ID required' });
  }

  if (!groupId || typeof groupId !== 'string') {
    return res.status(400).json({ error: 'Group ID required' });
  }

  const endpoint = `/api/events/${id}/groups/${groupId}`;

  try {
    // GET: Récupérer un groupe
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

    // PUT: Mettre à jour un groupe
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

    // DELETE: Supprimer un groupe
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
    console.error('Group API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
