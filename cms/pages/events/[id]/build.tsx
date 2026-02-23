/**
 * Page de build et déploiement de l'app
 */
import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  Button,
  Flex,
  Badge,
  HStack,
  VStack,
  Progress,
  Alert,
  AlertIcon,
  SimpleGrid,
  Divider,
  Icon,
  Link as ChakraLink,
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { FiPackage, FiApple, FiSmartphone, FiExternalLink, FiCheck, FiClock, FiAlertCircle } from 'react-icons/fi';

// Données de démo
const mockBuildHistory = [
  { id: '1', platform: 'ios', version: '1.0.2', status: 'live', createdAt: '2026-02-15T10:00:00', submittedAt: '2026-02-15T14:30:00', approvedAt: '2026-02-17T09:00:00' },
  { id: '2', platform: 'android', version: '1.0.2', status: 'live', createdAt: '2026-02-15T10:00:00', submittedAt: '2026-02-15T12:00:00', approvedAt: '2026-02-15T12:30:00' },
  { id: '3', platform: 'ios', version: '1.0.1', status: 'superseded', createdAt: '2026-02-01T10:00:00', submittedAt: '2026-02-01T14:30:00', approvedAt: '2026-02-03T09:00:00' },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  building: { label: 'En cours de build', color: 'blue', icon: FiClock },
  ready: { label: 'Prêt à soumettre', color: 'yellow', icon: FiPackage },
  submitted: { label: 'En review', color: 'orange', icon: FiClock },
  rejected: { label: 'Rejeté', color: 'red', icon: FiAlertCircle },
  live: { label: 'En ligne', color: 'green', icon: FiCheck },
  superseded: { label: 'Remplacé', color: 'gray', icon: FiCheck },
};

export default function BuildPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);

  const handleStartBuild = async () => {
    setIsBuilding(true);
    setBuildProgress(0);

    // Simulation de build
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setBuildProgress(i);
    }

    setIsBuilding(false);
  };

  const currentIOSBuild = mockBuildHistory.find(b => b.platform === 'ios' && b.status === 'live');
  const currentAndroidBuild = mockBuildHistory.find(b => b.platform === 'android' && b.status === 'live');

  return (
    <Layout>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">Build & Déploiement</Heading>
          <Text color="gray.600">
            <Link href={`/events/${id}`}>
              <Text as="span" color="blue.600" cursor="pointer">← Retour à l'événement</Text>
            </Link>
          </Text>
        </Box>
      </Flex>

      {/* Statut actuel */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
        <Card>
          <CardHeader>
            <HStack>
              <Icon as={FiApple} boxSize={6} />
              <Heading size="md">iOS (App Store)</Heading>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            {currentIOSBuild ? (
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text>Version</Text>
                  <Badge>{currentIOSBuild.version}</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text>Statut</Text>
                  <Badge colorScheme={statusConfig[currentIOSBuild.status].color}>
                    {statusConfig[currentIOSBuild.status].label}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text>Publié le</Text>
                  <Text color="gray.600">
                    {new Date(currentIOSBuild.approvedAt!).toLocaleDateString('fr-FR')}
                  </Text>
                </HStack>
                <Divider />
                <Button
                  as={ChakraLink}
                  href="https://appstoreconnect.apple.com"
                  isExternal
                  leftIcon={<FiExternalLink />}
                  variant="outline"
                  size="sm"
                >
                  App Store Connect
                </Button>
              </VStack>
            ) : (
              <Text color="gray.500">Aucun build publié</Text>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <HStack>
              <Icon as={FiSmartphone} boxSize={6} />
              <Heading size="md">Android (Play Store)</Heading>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            {currentAndroidBuild ? (
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text>Version</Text>
                  <Badge>{currentAndroidBuild.version}</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text>Statut</Text>
                  <Badge colorScheme={statusConfig[currentAndroidBuild.status].color}>
                    {statusConfig[currentAndroidBuild.status].label}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text>Publié le</Text>
                  <Text color="gray.600">
                    {new Date(currentAndroidBuild.approvedAt!).toLocaleDateString('fr-FR')}
                  </Text>
                </HStack>
                <Divider />
                <Button
                  as={ChakraLink}
                  href="https://play.google.com/console"
                  isExternal
                  leftIcon={<FiExternalLink />}
                  variant="outline"
                  size="sm"
                >
                  Google Play Console
                </Button>
              </VStack>
            ) : (
              <Text color="gray.500">Aucun build publié</Text>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Nouveau build */}
      <Card mb={8}>
        <CardHeader>
          <Heading size="md">Générer un nouveau build</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                Un nouveau build génère les fichiers iOS (.ipa) et Android (.aab) prêts à être soumis aux stores.
                Le processus prend environ 15-20 minutes.
              </Text>
            </Alert>

            {isBuilding ? (
              <Box>
                <Text mb={2}>Build en cours... {buildProgress}%</Text>
                <Progress value={buildProgress} colorScheme="blue" size="lg" borderRadius="full" />
                <Text fontSize="sm" color="gray.600" mt={2}>
                  {buildProgress < 30 && "Préparation des assets..."}
                  {buildProgress >= 30 && buildProgress < 60 && "Compilation iOS..."}
                  {buildProgress >= 60 && buildProgress < 90 && "Compilation Android..."}
                  {buildProgress >= 90 && "Finalisation..."}
                </Text>
              </Box>
            ) : (
              <Button
                leftIcon={<FiPackage />}
                colorScheme="blue"
                size="lg"
                onClick={handleStartBuild}
              >
                Lancer le build iOS + Android
              </Button>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Historique */}
      <Card>
        <CardHeader>
          <Heading size="md">Historique des builds</Heading>
        </CardHeader>
        <CardBody pt={0}>
          <VStack spacing={4} align="stretch">
            {mockBuildHistory.map((build) => {
              const status = statusConfig[build.status];
              return (
                <Card key={build.id} variant="outline">
                  <CardBody>
                    <Flex justify="space-between" align="center">
                      <HStack>
                        <Icon
                          as={build.platform === 'ios' ? FiApple : FiSmartphone}
                          boxSize={5}
                        />
                        <Box>
                          <HStack>
                            <Text fontWeight="medium">
                              {build.platform === 'ios' ? 'iOS' : 'Android'} v{build.version}
                            </Text>
                            <Badge colorScheme={status.color}>{status.label}</Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            Créé le {new Date(build.createdAt).toLocaleDateString('fr-FR')}
                          </Text>
                        </Box>
                      </HStack>
                      {build.status === 'live' && (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<FiExternalLink />}
                        >
                          Voir sur le store
                        </Button>
                      )}
                    </Flex>
                  </CardBody>
                </Card>
              );
            })}
          </VStack>
        </CardBody>
      </Card>
    </Layout>
  );
}
