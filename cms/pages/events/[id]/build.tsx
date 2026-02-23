/**
 * Page de build et déploiement de l'app
 */
import { useState, useEffect } from 'react';
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
  Spinner,
  useToast,
  Code,
  useClipboard,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { FiPackage, FiSmartphone, FiExternalLink, FiCheck, FiClock, FiAlertCircle, FiCopy, FiRefreshCw, FiDownload } from 'react-icons/fi';
import { SiApple, SiAndroid } from 'react-icons/si';

interface Build {
  id: string;
  platform: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  artifacts?: {
    buildUrl?: string;
  };
  error?: string;
}

interface BuildResponse {
  builds: Build[];
  message?: string;
  simulated?: boolean;
  config?: any;
  instructions?: string[];
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  new: { label: 'En attente', color: 'gray', icon: FiClock },
  'in-queue': { label: 'En file', color: 'blue', icon: FiClock },
  'in-progress': { label: 'En cours', color: 'blue', icon: FiClock },
  pending: { label: 'En attente', color: 'yellow', icon: FiClock },
  finished: { label: 'Terminé', color: 'green', icon: FiCheck },
  errored: { label: 'Erreur', color: 'red', icon: FiAlertCircle },
  canceled: { label: 'Annulé', color: 'gray', icon: FiAlertCircle },
  queued: { label: 'En file', color: 'blue', icon: FiClock },
};

export default function BuildPage() {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildResult, setBuildResult] = useState<BuildResponse | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android' | 'all'>('all');

  // Commande CLI à copier
  const cliCommand = `cd mobile && eas build --platform ${selectedPlatform} --profile production`;
  const { hasCopied, onCopy } = useClipboard(cliCommand);

  // Charger les builds existants
  useEffect(() => {
    if (!id) return;
    fetchBuilds();
  }, [id]);

  const fetchBuilds = async () => {
    try {
      const res = await fetch(`/api/events/${id}/build`);
      if (res.ok) {
        const data = await res.json();
        setBuilds(data.builds || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartBuild = async (platform: 'ios' | 'android' | 'all') => {
    setIsBuilding(true);
    setBuildResult(null);

    try {
      const res = await fetch(`/api/events/${id}/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, profile: 'production' }),
      });

      const data = await res.json();
      setBuildResult(data);

      if (data.success) {
        toast({
          title: data.simulated ? 'Configuration générée' : 'Build lancé',
          description: data.message,
          status: 'success',
          duration: 5000,
        });
        
        // Rafraîchir la liste des builds
        if (!data.simulated) {
          setTimeout(fetchBuilds, 2000);
        }
      } else {
        toast({
          title: 'Erreur',
          description: data.error,
          status: 'error',
          duration: 5000,
        });
      }
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsBuilding(false);
    }
  };

  const getLatestBuildByPlatform = (platform: string) => {
    return builds.find(b => b.platform?.toLowerCase() === platform);
  };

  const iosBuild = getLatestBuildByPlatform('ios');
  const androidBuild = getLatestBuildByPlatform('android');

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
        <Button
          leftIcon={<FiRefreshCw />}
          variant="outline"
          onClick={fetchBuilds}
          isLoading={loading}
        >
          Actualiser
        </Button>
      </Flex>

      {/* Statut actuel des plateformes */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
        <Card>
          <CardHeader>
            <HStack>
              <Icon as={SiApple} boxSize={6} />
              <Heading size="md">iOS (App Store)</Heading>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            {iosBuild ? (
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text>Statut</Text>
                  <Badge colorScheme={statusConfig[iosBuild.status]?.color || 'gray'}>
                    {statusConfig[iosBuild.status]?.label || iosBuild.status}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text>Créé le</Text>
                  <Text color="gray.600">
                    {new Date(iosBuild.createdAt).toLocaleDateString('fr-FR')}
                  </Text>
                </HStack>
                {iosBuild.artifacts?.buildUrl && (
                  <>
                    <Divider />
                    <Button
                      as={ChakraLink}
                      href={iosBuild.artifacts.buildUrl}
                      isExternal
                      leftIcon={<FiDownload />}
                      colorScheme="blue"
                      size="sm"
                    >
                      Télécharger .ipa
                    </Button>
                  </>
                )}
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
              <VStack align="stretch" spacing={3}>
                <Text color="gray.500">Aucun build iOS</Text>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => handleStartBuild('ios')}
                  isLoading={isBuilding}
                  leftIcon={<SiApple />}
                >
                  Lancer build iOS
                </Button>
              </VStack>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <HStack>
              <Icon as={SiAndroid} boxSize={6} color="green.500" />
              <Heading size="md">Android (Play Store)</Heading>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            {androidBuild ? (
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text>Statut</Text>
                  <Badge colorScheme={statusConfig[androidBuild.status]?.color || 'gray'}>
                    {statusConfig[androidBuild.status]?.label || androidBuild.status}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text>Créé le</Text>
                  <Text color="gray.600">
                    {new Date(androidBuild.createdAt).toLocaleDateString('fr-FR')}
                  </Text>
                </HStack>
                {androidBuild.artifacts?.buildUrl && (
                  <>
                    <Divider />
                    <Button
                      as={ChakraLink}
                      href={androidBuild.artifacts.buildUrl}
                      isExternal
                      leftIcon={<FiDownload />}
                      colorScheme="green"
                      size="sm"
                    >
                      Télécharger .aab
                    </Button>
                  </>
                )}
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
              <VStack align="stretch" spacing={3}>
                <Text color="gray.500">Aucun build Android</Text>
                <Button
                  size="sm"
                  colorScheme="green"
                  onClick={() => handleStartBuild('android')}
                  isLoading={isBuilding}
                  leftIcon={<SiAndroid />}
                >
                  Lancer build Android
                </Button>
              </VStack>
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
              <Box>
                <Text fontSize="sm" fontWeight="medium">
                  Le build génère les fichiers iOS (.ipa) et Android (.aab) prêts pour les stores.
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Temps estimé : 15-20 minutes par plateforme.
                </Text>
              </Box>
            </Alert>

            <Tabs variant="soft-rounded" colorScheme="blue" onChange={(i) => setSelectedPlatform(['ios', 'android', 'all'][i] as any)}>
              <TabList>
                <Tab><HStack><Icon as={SiApple} /><Text>iOS</Text></HStack></Tab>
                <Tab><HStack><Icon as={SiAndroid} /><Text>Android</Text></HStack></Tab>
                <Tab><HStack><Icon as={FiPackage} /><Text>Les deux</Text></HStack></Tab>
              </TabList>
            </Tabs>

            <HStack spacing={4}>
              <Button
                leftIcon={<FiPackage />}
                colorScheme="blue"
                size="lg"
                flex={1}
                onClick={() => handleStartBuild(selectedPlatform)}
                isLoading={isBuilding}
                loadingText="Lancement..."
              >
                Lancer le build {selectedPlatform === 'all' ? 'iOS + Android' : selectedPlatform.toUpperCase()}
              </Button>
            </HStack>

            {/* Résultat du build */}
            {buildResult && (
              <Box mt={4}>
                {buildResult.simulated ? (
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="medium">Mode simulation (EXPO_TOKEN non configuré)</Text>
                      <Text fontSize="sm" mt={2}>Copiez cette commande pour lancer le build manuellement :</Text>
                      <HStack mt={2}>
                        <Code p={2} borderRadius="md" flex={1}>{cliCommand}</Code>
                        <Button size="sm" onClick={onCopy} leftIcon={<FiCopy />}>
                          {hasCopied ? 'Copié !' : 'Copier'}
                        </Button>
                      </HStack>
                      {buildResult.instructions && (
                        <VStack align="stretch" mt={3} spacing={1}>
                          {buildResult.instructions.map((inst, i) => (
                            <Text key={i} fontSize="sm" color="gray.600">{inst}</Text>
                          ))}
                        </VStack>
                      )}
                    </Box>
                  </Alert>
                ) : buildResult.builds ? (
                  <Alert status="success" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="medium">Builds lancés avec succès !</Text>
                      <VStack align="stretch" mt={2} spacing={2}>
                        {buildResult.builds.map((b: any, i: number) => (
                          <HStack key={i}>
                            <Badge colorScheme={b.status === 'queued' ? 'blue' : 'red'}>
                              {b.platform.toUpperCase()}
                            </Badge>
                            <Text fontSize="sm">{b.status === 'queued' ? 'En file d\'attente' : b.error}</Text>
                            {b.url && (
                              <ChakraLink href={b.url} isExternal color="blue.500" fontSize="sm">
                                Voir sur Expo <FiExternalLink style={{ display: 'inline' }} />
                              </ChakraLink>
                            )}
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  </Alert>
                ) : null}
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Commande CLI rapide */}
      <Card mb={8}>
        <CardHeader>
          <Heading size="md">Alternative : Commande CLI</Heading>
        </CardHeader>
        <CardBody>
          <Text fontSize="sm" color="gray.600" mb={3}>
            Vous pouvez aussi lancer le build depuis votre terminal :
          </Text>
          <HStack>
            <Code p={3} borderRadius="md" flex={1} bg="gray.800" color="green.300">
              {cliCommand}
            </Code>
            <Button onClick={onCopy} leftIcon={<FiCopy />} colorScheme="gray">
              {hasCopied ? 'Copié !' : 'Copier'}
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Historique des builds */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md">Historique des builds</Heading>
            {loading && <Spinner size="sm" />}
          </HStack>
        </CardHeader>
        <CardBody pt={0}>
          {builds.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={8}>
              Aucun build pour le moment
            </Text>
          ) : (
            <VStack spacing={4} align="stretch">
              {builds.map((build) => {
                const status = statusConfig[build.status] || { label: build.status, color: 'gray', icon: FiClock };
                return (
                  <Card key={build.id} variant="outline">
                    <CardBody>
                      <Flex justify="space-between" align="center">
                        <HStack>
                          <Icon
                            as={build.platform?.toLowerCase() === 'ios' ? SiApple : SiAndroid}
                            boxSize={5}
                            color={build.platform?.toLowerCase() === 'android' ? 'green.500' : undefined}
                          />
                          <Box>
                            <HStack>
                              <Text fontWeight="medium">
                                {build.platform?.toUpperCase()}
                              </Text>
                              <Badge colorScheme={status.color}>{status.label}</Badge>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              {new Date(build.createdAt).toLocaleString('fr-FR')}
                            </Text>
                          </Box>
                        </HStack>
                        {build.artifacts?.buildUrl && (
                          <Button
                            as={ChakraLink}
                            href={build.artifacts.buildUrl}
                            isExternal
                            size="sm"
                            leftIcon={<FiDownload />}
                            colorScheme="blue"
                          >
                            Télécharger
                          </Button>
                        )}
                      </Flex>
                      {build.error && (
                        <Alert status="error" mt={2} size="sm" borderRadius="md">
                          <AlertIcon />
                          <Text fontSize="sm">{build.error}</Text>
                        </Alert>
                      )}
                    </CardBody>
                  </Card>
                );
              })}
            </VStack>
          )}
        </CardBody>
      </Card>
    </Layout>
  );
}
