/**
 * API Route pour déclencher les builds EAS
 * POST /api/events/[id]/build - Lance un nouveau build
 * GET /api/events/[id]/build - Liste les builds
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

const EXPO_TOKEN = process.env.EXPO_TOKEN;
const EAS_PROJECT_ID = process.env.EAS_PROJECT_ID;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.oninvite.fr';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

interface BuildRequest {
  platform: 'ios' | 'android' | 'all';
  profile?: 'development' | 'preview' | 'production';
}

interface EventData {
  id: string;
  slug: string;
  title: string;
  type: string;
  theme?: {
    primaryColor?: string;
    appIcon?: string;
  };
}

// Normaliser le slug pour le bundle identifier
function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 30);
}

// Générer la config app.json dynamique
function generateAppConfig(event: EventData) {
  const normalizedSlug = normalizeSlug(event.slug);
  const bundleId = `fr.oninvite.${normalizedSlug}`;
  
  return {
    expo: {
      name: event.title,
      slug: event.slug,
      version: "1.0.0",
      orientation: "portrait",
      icon: event.theme?.appIcon || "./assets/icon.png",
      userInterfaceStyle: "light",
      splash: {
        backgroundColor: event.theme?.primaryColor || "#D4AF37"
      },
      ios: {
        supportsTablet: true,
        bundleIdentifier: bundleId,
        buildNumber: "1"
      },
      android: {
        package: bundleId,
        versionCode: 1,
        adaptiveIcon: {
          backgroundColor: event.theme?.primaryColor || "#D4AF37"
        }
      },
      extra: {
        eventId: event.id,
        eventSlug: event.slug,
        apiUrl: API_URL,
        eas: {
          projectId: EAS_PROJECT_ID
        }
      },
      plugins: [
        "expo-font",
        [
          "expo-notifications",
          {
            icon: "./assets/notification-icon.png",
            color: event.theme?.primaryColor || "#D4AF37"
          }
        ]
      ]
    }
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Vérifier l'authentification
    let session;
    try {
      session = await getServerSession(req, res, authOptions);
    } catch (authError) {
      console.error('Auth error:', authError);
      return res.status(500).json({ error: 'Erreur d\'authentification', details: String(authError) });
    }
    
    if (!session) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { id } = req.query;

  if (req.method === 'GET') {
    // Lister les builds existants
    try {
      if (!EXPO_TOKEN || !EAS_PROJECT_ID) {
        return res.status(200).json({ 
          builds: [],
          configured: false,
          message: 'EAS non configuré - Ajoutez EXPO_TOKEN et EAS_PROJECT_ID dans Vercel'
        });
      }

      const response = await fetch(
        `https://api.expo.dev/v2/projects/${EAS_PROJECT_ID}/builds?limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${EXPO_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Expo API error:', errorData);
        return res.status(200).json({ 
          builds: [],
          configured: true,
          error: 'Erreur API Expo - vérifiez votre token'
        });
      }

      let data;
      try {
        data = await response.json();
      } catch {
        data = { data: [] };
      }
      return res.status(200).json({ builds: data.data || [], configured: true });
    } catch (error: any) {
      console.error('Error fetching builds:', error);
      return res.status(200).json({ 
        builds: [],
        error: error.message || 'Erreur réseau'
      });
    }
  }

  if (req.method === 'POST') {
    // Lancer un nouveau build
    try {
      const { platform = 'all', profile = 'production' } = req.body as BuildRequest;

      // Récupérer les données de l'événement
      let event: EventData;
      try {
        // Ajouter slash final pour éviter redirection 307
        const eventRes = await fetch(`${API_URL}/api/events/${id}/`, {
          headers: {
            'x-api-key': ADMIN_API_KEY || '',
          },
          redirect: 'follow',
        });

        if (!eventRes.ok) {
          // Créer un événement par défaut si l'API backend n'est pas accessible
          console.log(`API returned ${eventRes.status} for event ${id}, using fallback`);
          event = {
            id: id as string,
            slug: `event-${(id as string).substring(0, 8)}`,
            title: 'Mon Événement',
            type: 'wedding',
          };
        } else {
          // Vérifier que c'est bien du JSON avant de parser
          const contentType = eventRes.headers.get('content-type');
          const responseText = await eventRes.text();
          
          if (contentType?.includes('application/json') && responseText) {
            try {
              event = JSON.parse(responseText);
            } catch (parseError) {
              console.error('JSON parse error:', parseError, 'Response:', responseText.substring(0, 100));
              event = {
                id: id as string,
                slug: `event-${(id as string).substring(0, 8)}`,
                title: 'Mon Événement',
                type: 'wedding',
              };
            }
          } else {
            console.log('Non-JSON response:', responseText.substring(0, 100));
            event = {
              id: id as string,
              slug: `event-${(id as string).substring(0, 8)}`,
              title: 'Mon Événement', 
              type: 'wedding',
            };
          }
        }
      } catch (fetchError) {
        // Fallback si l'API est down
        console.error('Fetch error:', fetchError);
        event = {
          id: id as string,
          slug: `event-${(id as string).substring(0, 8)}`,
          title: 'Mon Événement',
          type: 'wedding',
        };
      }

      // Générer la config
      const appConfig = generateAppConfig(event);

      if (!EXPO_TOKEN || !EAS_PROJECT_ID) {
        // Mode simulation si pas de token Expo
        return res.status(200).json({
          success: true,
          simulated: true,
          message: 'Build simulé (EXPO_TOKEN non configuré)',
          config: appConfig,
          instructions: [
            '1. Installez EAS CLI: npm install -g eas-cli',
            '2. Connectez-vous: eas login',
            '3. Lancez le build: eas build --platform all --profile production',
          ]
        });
      }

      // Lancer le build via EAS API
      const platforms = platform === 'all' ? ['ios', 'android'] : [platform];
      const buildResults = [];

      for (const p of platforms) {
        const buildRes = await fetch(
          `https://api.expo.dev/v2/projects/${EAS_PROJECT_ID}/builds`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${EXPO_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              platform: p.toUpperCase(),
              profile: profile,
              metadata: {
                appName: event.title,
                eventId: event.id,
              }
            }),
          }
        );

        if (buildRes.ok) {
          let buildData;
          try {
            buildData = await buildRes.json();
          } catch {
            buildData = { data: {} };
          }
          buildResults.push({
            platform: p,
            buildId: buildData.data?.id,
            status: 'queued',
            url: `https://expo.dev/accounts/oninvite/projects/${event.slug}/builds/${buildData.data?.id}`
          });
        } else {
          let errorMsg = 'Erreur de build';
          try {
            const errorData = await buildRes.json();
            errorMsg = errorData.errors?.[0]?.message || errorMsg;
          } catch {
            // Ignorer erreur de parsing
          }
          buildResults.push({
            platform: p,
            error: errorMsg,
            status: 'failed'
          });
        }
      }

      return res.status(200).json({
        success: true,
        builds: buildResults,
        message: `Build${platforms.length > 1 ? 's' : ''} lancé${platforms.length > 1 ? 's' : ''}`,
        estimatedTime: '15-20 minutes'
      });

    } catch (error: any) {
      console.error('Build error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (globalError: any) {
    console.error('Global handler error:', globalError);
    return res.status(500).json({ error: 'Erreur serveur', details: String(globalError) });
  }
}
