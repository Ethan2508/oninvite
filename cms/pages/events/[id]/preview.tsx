/**
 * Preview mobile de l'app
 */
import { useRouter } from 'next/router';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  Button,
  Flex,
  HStack,
  VStack,
  Input,
  useToast,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { FiRefreshCw, FiSmartphone, FiTablet, FiSend } from 'react-icons/fi';
import { useState, useEffect } from 'react';

interface Event {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  type: string;
  status: string;
  mainDate?: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export default function PreviewPage() {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceSize, setDeviceSize] = useState<'phone' | 'tablet'>('phone');
  const [clientEmail, setClientEmail] = useState('');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    if (!id) return;
    
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) throw new Error('Erreur lors du chargement de l\'événement');
        const data = await res.json();
        setEvent(data);
        
        // Calculer le countdown
        if (data.mainDate) {
          const eventDate = new Date(data.mainDate);
          const now = new Date();
          const diff = eventDate.getTime() - now.getTime();
          
          if (diff > 0) {
            setCountdown({
              days: Math.floor(diff / (1000 * 60 * 60 * 24)),
              hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
              minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            });
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  const deviceSizes = {
    phone: { width: '375px', height: '812px' },
    tablet: { width: '768px', height: '1024px' },
  };

  const handleSendPreview = () => {
    if (!clientEmail) {
      toast({
        title: 'Email requis',
        status: 'error',
        duration: 2000,
      });
      return;
    }

    toast({
      title: 'Lien de preview envoyé',
      description: `Un email a été envoyé à ${clientEmail}`,
      status: 'success',
      duration: 3000,
    });
    setClientEmail('');
  };

  const handleRefresh = () => {
    setLoading(true);
    fetch(`/api/events/${id}`)
      .then(res => res.json())
      .then(data => {
        setEvent(data);
        toast({ title: 'Actualisé', status: 'success', duration: 1500 });
      })
      .finally(() => setLoading(false));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).toUpperCase();
  };

  if (loading) {
    return (
      <Layout>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="brand.500" />
        </Flex>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          {error || 'Événement non trouvé'}
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">Preview mobile</Heading>
          <Text color="gray.600">
            <Link href={`/events/${id}`}>
              <Text as="span" color="blue.600" cursor="pointer">← Retour à l'événement</Text>
            </Link>
          </Text>
        </Box>
        <HStack spacing={4}>
          <IconButton
            aria-label="iPhone"
            icon={<FiSmartphone />}
            variant={deviceSize === 'phone' ? 'solid' : 'outline'}
            colorScheme="blue"
            onClick={() => setDeviceSize('phone')}
          />
          <IconButton
            aria-label="iPad"
            icon={<FiTablet />}
            variant={deviceSize === 'tablet' ? 'solid' : 'outline'}
            colorScheme="blue"
            onClick={() => setDeviceSize('tablet')}
          />
          <Button leftIcon={<FiRefreshCw />} variant="outline" onClick={handleRefresh}>
            Actualiser
          </Button>
        </HStack>
      </Flex>

      <Flex gap={6}>
        {/* Preview iframe */}
        <Box flex={1}>
          <Card>
            <CardBody display="flex" justifyContent="center" bg="gray.100" p={8}>
              <Box
                bg="black"
                borderRadius="3xl"
                p={3}
                boxShadow="2xl"
              >
                <Box
                  bg="white"
                  borderRadius="2xl"
                  overflow="hidden"
                  w={deviceSizes[deviceSize].width}
                  h={deviceSizes[deviceSize].height}
                >
                  {/* Simulated app */}
                  <Box h="100%" position="relative">
                    <Box
                      bg={`linear-gradient(135deg, ${event.theme?.primaryColor || '#D4AF37'} 0%, ${event.theme?.secondaryColor || '#1A1A2E'} 100%)`}
                      h="50%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexDirection="column"
                      color="white"
                      textAlign="center"
                      p={6}
                    >
                      <Text fontSize="sm" mb={2}>{event.mainDate ? formatDate(event.mainDate) : 'DATE À VENIR'}</Text>
                      <Heading size="xl" fontFamily="serif">{event.title}</Heading>
                      <Text fontSize="lg" mt={2}>{event.subtitle || ''}</Text>
                      <Box mt={4} p={4} bg="whiteAlpha.200" borderRadius="lg">
                        <Text fontSize="sm">Il reste</Text>
                        <HStack spacing={4} mt={2}>
                          <VStack spacing={0}>
                            <Text fontSize="2xl" fontWeight="bold">{countdown.days}</Text>
                            <Text fontSize="xs">jours</Text>
                          </VStack>
                          <VStack spacing={0}>
                            <Text fontSize="2xl" fontWeight="bold">{countdown.hours}</Text>
                            <Text fontSize="xs">heures</Text>
                          </VStack>
                          <VStack spacing={0}>
                            <Text fontSize="2xl" fontWeight="bold">{countdown.minutes}</Text>
                            <Text fontSize="xs">min</Text>
                          </VStack>
                        </HStack>
                      </Box>
                    </Box>
                    <Box p={4}>
                      <VStack spacing={3} align="stretch">
                        <Button size="sm" colorScheme="yellow" color="black">
                          📝 Confirmer ma présence
                        </Button>
                        <Button size="sm" variant="outline">
                          📅 Programme
                        </Button>
                        <Button size="sm" variant="outline">
                          📍 Infos pratiques
                        </Button>
                        <Button size="sm" variant="outline">
                          📸 Galerie
                        </Button>
                        <Button size="sm" variant="outline">
                          💝 Cagnotte
                        </Button>
                      </VStack>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardBody>
          </Card>
        </Box>

        {/* Actions */}
        <Box w="300px">
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="sm">Partager le preview</Heading>
                <Text fontSize="sm" color="gray.600">
                  Envoyez un lien de preview au client pour validation.
                </Text>
                <Input
                  placeholder="Email du client"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
                <Button
                  leftIcon={<FiSend />}
                  colorScheme="blue"
                  onClick={handleSendPreview}
                >
                  Envoyer le lien
                </Button>
              </VStack>
            </CardBody>
          </Card>

          <Card mt={4}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="sm">QR Code</Heading>
                <Box
                  bg="gray.100"
                  h="150px"
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="gray.500" fontSize="sm">
                    [QR Code Preview]
                  </Text>
                </Box>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Scanner pour ouvrir sur mobile
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </Flex>
    </Layout>
  );
}
