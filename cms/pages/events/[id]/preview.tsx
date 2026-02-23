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
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { FiRefreshCw, FiSmartphone, FiTablet, FiSend } from 'react-icons/fi';
import { useState } from 'react';

export default function PreviewPage() {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  
  const [deviceSize, setDeviceSize] = useState<'phone' | 'tablet'>('phone');
  const [clientEmail, setClientEmail] = useState('');

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
          <Button leftIcon={<FiRefreshCw />} variant="outline">
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
                      bg="linear-gradient(135deg, #D4AF37 0%, #1A1A2E 100%)"
                      h="50%"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexDirection="column"
                      color="white"
                      textAlign="center"
                      p={6}
                    >
                      <Text fontSize="sm" mb={2}>15 JUIN 2026</Text>
                      <Heading size="xl" fontFamily="serif">Sarah & David</Heading>
                      <Text fontSize="lg" mt={2}>Nous nous marions !</Text>
                      <Box mt={4} p={4} bg="whiteAlpha.200" borderRadius="lg">
                        <Text fontSize="sm">Il reste</Text>
                        <HStack spacing={4} mt={2}>
                          <VStack spacing={0}>
                            <Text fontSize="2xl" fontWeight="bold">113</Text>
                            <Text fontSize="xs">jours</Text>
                          </VStack>
                          <VStack spacing={0}>
                            <Text fontSize="2xl" fontWeight="bold">12</Text>
                            <Text fontSize="xs">heures</Text>
                          </VStack>
                          <VStack spacing={0}>
                            <Text fontSize="2xl" fontWeight="bold">45</Text>
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
