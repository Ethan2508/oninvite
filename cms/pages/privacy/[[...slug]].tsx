/**
 * Page de Politique de Confidentialité
 * Dynamique par événement ou générique
 */
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';

interface PrivacyPageProps {
  eventName?: string;
  companyName: string;
  companyAddress: string;
  contactEmail: string;
  lastUpdated: string;
}

const PrivacyPage = ({
  eventName,
  companyName,
  companyAddress,
  contactEmail,
  lastUpdated,
}: PrivacyPageProps) => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const title = eventName 
    ? `Politique de Confidentialité — ${eventName}`
    : 'Politique de Confidentialité — Oninvite';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="robots" content="noindex" />
      </Head>

      <Box minH="100vh" bg={bgColor} py={12}>
        <Container maxW="container.md">
          <VStack
            spacing={8}
            bg={cardBg}
            p={{ base: 6, md: 10 }}
            borderRadius="xl"
            boxShadow="md"
            align="stretch"
          >
            <Heading size="xl" textAlign="center">
              Politique de Confidentialité
            </Heading>
            
            {eventName && (
              <Text textAlign="center" fontSize="lg" color="gray.500">
                {eventName}
              </Text>
            )}

            <Divider />

            <Section title="1. Responsable du traitement">
              <Text>{companyName}</Text>
              <Text>{companyAddress}</Text>
              <Text>Contact : {contactEmail}</Text>
            </Section>

            <Section title="2. Données collectées">
              <Text>Dans le cadre de l'utilisation de cette application, nous collectons :</Text>
              <VStack align="stretch" pl={4} mt={2} spacing={1}>
                <Text>• Nom et prénom (formulaire RSVP)</Text>
                <Text>• Adresse email (optionnel)</Text>
                <Text>• Numéro de téléphone (optionnel)</Text>
                <Text>• Restrictions alimentaires (optionnel)</Text>
                <Text>• Photos uploadées dans la galerie</Text>
                <Text>• Messages du livre d'or</Text>
              </VStack>
            </Section>

            <Section title="3. Finalités du traitement">
              <Text>Ces données sont collectées pour :</Text>
              <VStack align="stretch" pl={4} mt={2} spacing={1}>
                <Text>• Gérer les confirmations de présence (RSVP)</Text>
                <Text>• Permettre le partage de photos entre invités</Text>
                <Text>• Envoyer des notifications relatives à l'événement</Text>
                <Text>• Afficher les messages dans le livre d'or</Text>
              </VStack>
            </Section>

            <Section title="4. Base légale">
              <Text>
                Le traitement des données est fondé sur votre consentement, donné lors 
                de la soumission du formulaire RSVP ou de l'upload de photos.
              </Text>
            </Section>

            <Section title="5. Durée de conservation">
              <Text>
                Les données sont conservées pendant <strong>12 mois</strong> après la 
                date de l'événement, puis automatiquement supprimées.
              </Text>
            </Section>

            <Section title="6. Vos droits">
              <Text>
                Conformément au Règlement Général sur la Protection des Données (RGPD), 
                vous disposez des droits suivants :
              </Text>
              <VStack align="stretch" pl={4} mt={2} spacing={1}>
                <Text>• Droit d'accès à vos données</Text>
                <Text>• Droit de rectification</Text>
                <Text>• Droit à l'effacement ("droit à l'oubli")</Text>
                <Text>• Droit à la limitation du traitement</Text>
                <Text>• Droit à la portabilité des données</Text>
                <Text>• Droit d'opposition</Text>
              </VStack>
              <Text mt={2}>
                Pour exercer ces droits, contactez-nous à : <strong>{contactEmail}</strong>
              </Text>
            </Section>

            <Section title="7. Sécurité des données">
              <Text>
                Nous mettons en œuvre des mesures techniques et organisationnelles 
                appropriées pour protéger vos données contre tout accès non autorisé, 
                modification, divulgation ou destruction.
              </Text>
            </Section>

            <Section title="8. Hébergement">
              <Text>
                Les données sont hébergées en <strong>Union Européenne</strong> (France), 
                conformément aux exigences du RGPD.
              </Text>
            </Section>

            <Section title="9. Transferts internationaux">
              <Text>
                Aucun transfert de données vers des pays situés hors de l'Union 
                Européenne n'est effectué.
              </Text>
            </Section>

            <Section title="10. Cookies">
              <Text>
                Cette application mobile n'utilise pas de cookies. Des identifiants 
                techniques peuvent être stockés localement pour le fonctionnement 
                de l'application (token d'authentification, préférences).
              </Text>
            </Section>

            <Divider />

            <Text fontSize="sm" color="gray.500" textAlign="center">
              Dernière mise à jour : {lastUpdated}
            </Text>
          </VStack>
        </Container>
      </Box>
    </>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <VStack align="stretch" spacing={2}>
    <Heading size="md">{title}</Heading>
    {children}
  </VStack>
);

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string | undefined;
  
  // Valeurs par défaut (à personnaliser)
  const defaultProps: PrivacyPageProps = {
    companyName: 'Oninvite SAS',
    companyAddress: 'Paris, France',
    contactEmail: 'privacy@oninvite.fr',
    lastUpdated: new Date().toLocaleDateString('fr-FR'),
  };

  // Si un slug est fourni, récupérer les infos de l'événement
  if (slug) {
    try {
      const apiUrl = process.env.API_URL || 'http://api:8000';
      const response = await fetch(`${apiUrl}/events/by-slug/${slug}`);
      
      if (response.ok) {
        const event = await response.json();
        return {
          props: {
            ...defaultProps,
            eventName: event.title,
          },
        };
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  }

  return {
    props: defaultProps,
  };
};

export default PrivacyPage;
