/**
 * Page de redirection intelligente pour le téléchargement de l'app
 * Détecte le device et redirige vers le bon store
 */
import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Image,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaApple, FaGooglePlay } from 'react-icons/fa';

interface Event {
  id: string;
  title: string;
  slug: string;
  store_url_ios?: string;
  store_url_android?: string;
  branding?: {
    primary_color?: string;
    logo_url?: string;
  };
}

interface DownloadPageProps {
  event: Event | null;
  error?: string;
}

const DownloadPage = ({ event, error }: DownloadPageProps) => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'unknown'>('unknown');
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (!event) return;

    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
      if (event.store_url_ios) {
        setIsRedirecting(true);
        setTimeout(() => {
          window.location.href = event.store_url_ios!;
        }, 1500);
      }
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
      if (event.store_url_android) {
        setIsRedirecting(true);
        setTimeout(() => {
          window.location.href = event.store_url_android!;
        }, 1500);
      }
    }
  }, [event]);

  if (error || !event) {
    return (
      <Container maxW="container.md" py={20}>
        <VStack spacing={6} textAlign="center">
          <Heading size="lg">Événement non trouvé</Heading>
          <Text color="gray.500">
            L'application que vous recherchez n'existe pas ou n'est plus disponible.
          </Text>
        </VStack>
      </Container>
    );
  }

  const primaryColor = event.branding?.primary_color || '#D4AF37';

  return (
    <>
      <Head>
        <title>Télécharger {event.title}</title>
        <meta name="description" content={`Téléchargez l'application ${event.title}`} />
        <meta property="og:title" content={`Télécharger ${event.title}`} />
        <meta property="og:type" content="website" />
      </Head>

      <Box minH="100vh" bg={bgColor} py={20}>
        <Container maxW="container.sm">
          <VStack
            spacing={8}
            bg={cardBg}
            p={10}
            borderRadius="2xl"
            boxShadow="xl"
            textAlign="center"
          >
            {event.branding?.logo_url && (
              <Image
                src={event.branding.logo_url}
                alt={event.title}
                maxH="100px"
                objectFit="contain"
              />
            )}

            <VStack spacing={2}>
              <Heading size="xl">{event.title}</Heading>
              <Text color="gray.500" fontSize="lg">
                Téléchargez l'application officielle
              </Text>
            </VStack>

            {isRedirecting ? (
              <VStack spacing={4} py={6}>
                <Spinner size="xl" color={primaryColor} thickness="4px" />
                <Text color="gray.600">
                  Redirection vers {platform === 'ios' ? "l'App Store" : 'le Play Store'}...
                </Text>
              </VStack>
            ) : (
              <VStack spacing={4} w="full" pt={4}>
                {event.store_url_ios && (
                  <Button
                    as="a"
                    href={event.store_url_ios}
                    size="lg"
                    w="full"
                    leftIcon={<FaApple />}
                    bg="black"
                    color="white"
                    _hover={{ bg: 'gray.800' }}
                  >
                    Télécharger sur l'App Store
                  </Button>
                )}

                {event.store_url_android && (
                  <Button
                    as="a"
                    href={event.store_url_android}
                    size="lg"
                    w="full"
                    leftIcon={<FaGooglePlay />}
                    bg="green.600"
                    color="white"
                    _hover={{ bg: 'green.700' }}
                  >
                    Télécharger sur Google Play
                  </Button>
                )}

                {!event.store_url_ios && !event.store_url_android && (
                  <Text color="gray.500">
                    L'application sera bientôt disponible.
                  </Text>
                )}
              </VStack>
            )}

            <Box pt={6} borderTop="1px" borderColor="gray.200" w="full">
              <HStack justify="center" spacing={1} color="gray.400" fontSize="sm">
                <Text>Propulsé par</Text>
                <Text fontWeight="bold" color={primaryColor}>Oninvite</Text>
              </HStack>
            </Box>
          </VStack>
        </Container>
      </Box>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;

  try {
    const apiUrl = process.env.API_URL || 'http://api:8000';
    const response = await fetch(`${apiUrl}/events/by-slug/${slug}`);
    
    if (!response.ok) {
      return {
        props: {
          event: null,
          error: 'Event not found',
        },
      };
    }

    const event = await response.json();

    return {
      props: {
        event,
      },
    };
  } catch (error) {
    console.error('Error fetching event:', error);
    return {
      props: {
        event: null,
        error: 'Failed to fetch event',
      },
    };
  }
};

export default DownloadPage;
