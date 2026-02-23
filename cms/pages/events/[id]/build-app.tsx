/**
 * Page événement - Générer l'application
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
  VStack,
  HStack,
  Button,
  Code,
  useClipboard,
  Alert,
  AlertIcon,
  Spinner,
  Badge,
  Divider,
  Icon,
  SimpleGrid,
  useToast,
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon, DownloadIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import Layout from '../../../components/Layout';

interface EasProfile {
  profileName: string;
  config: {
    extends: string;
    env: Record<string, string>;
    ios: { bundleIdentifier: string };
    android: { package: string };
  };
  buildCommands: {
    ios: string;
    android: string;
    all: string;
  };
}

export default function BuildAppPage() {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<EasProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { onCopy: onCopyIos, hasCopied: hasCopiedIos } = useClipboard(profile?.buildCommands.ios || '');
  const { onCopy: onCopyAndroid, hasCopied: hasCopiedAndroid } = useClipboard(profile?.buildCommands.android || '');
  const { onCopy: onCopyAll, hasCopied: hasCopiedAll } = useClipboard(profile?.buildCommands.all || '');
  const { onCopy: onCopyConfig, hasCopied: hasCopiedConfig } = useClipboard(
    profile ? JSON.stringify(profile.config, null, 2) : ''
  );

  const generateProfile = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/events/${id}/generate-eas`, {
        method: 'POST',
      });
      
      if (!res.ok) {
        throw new Error('Échec de la génération');
      }
      
      const data = await res.json();
      setProfile(data);
      toast({
        title: 'Profil généré',
        description: `Profil ${data.profileName} prêt`,
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box mb={8}>
        <HStack justify="space-between">
          <Box>
            <Heading size="lg">Générer l'application</Heading>
            <Text color="gray.600">Créez l'app iOS et Android pour cet événement</Text>
          </Box>
          <Button variant="outline" onClick={() => router.push(`/events/${id}`)}>
            ← Retour
          </Button>
        </HStack>
      </Box>

      {/* Generate Button */}
      <Card mb={6}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Box>
                <Heading size="sm">Générer le profil EAS</Heading>
                <Text color="gray.600" fontSize="sm">
                  Crée la configuration de build personnalisée pour cet événement
                </Text>
              </Box>
              <Button
                colorScheme="purple"
                onClick={generateProfile}
                isLoading={loading}
                loadingText="Génération..."
              >
                {profile ? 'Régénérer' : 'Générer le profil'}
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {profile && (
        <>
          {/* Profile Info */}
          <Card mb={6}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Profil: {profile.profileName}</Heading>
                <Badge colorScheme="green">Prêt</Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box>
                  <Text fontWeight="bold" mb={2}>iOS</Text>
                  <Code p={2} display="block" borderRadius="md">
                    {profile.config.ios.bundleIdentifier}
                  </Code>
                </Box>
                <Box>
                  <Text fontWeight="bold" mb={2}>Android</Text>
                  <Code p={2} display="block" borderRadius="md">
                    {profile.config.android.package}
                  </Code>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Build Commands */}
          <Card mb={6}>
            <CardHeader>
              <Heading size="md">Commandes de build</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {/* iOS */}
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="bold">🍎 iOS</Text>
                    <Button
                      size="sm"
                      leftIcon={hasCopiedIos ? <CheckIcon /> : <CopyIcon />}
                      onClick={onCopyIos}
                      variant="ghost"
                    >
                      {hasCopiedIos ? 'Copié!' : 'Copier'}
                    </Button>
                  </HStack>
                  <Code p={3} display="block" borderRadius="md" bg="gray.100">
                    {profile.buildCommands.ios}
                  </Code>
                </Box>

                <Divider />

                {/* Android */}
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="bold">🤖 Android</Text>
                    <Button
                      size="sm"
                      leftIcon={hasCopiedAndroid ? <CheckIcon /> : <CopyIcon />}
                      onClick={onCopyAndroid}
                      variant="ghost"
                    >
                      {hasCopiedAndroid ? 'Copié!' : 'Copier'}
                    </Button>
                  </HStack>
                  <Code p={3} display="block" borderRadius="md" bg="gray.100">
                    {profile.buildCommands.android}
                  </Code>
                </Box>

                <Divider />

                {/* All platforms */}
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="bold">📱 Les deux plateformes</Text>
                    <Button
                      size="sm"
                      leftIcon={hasCopiedAll ? <CheckIcon /> : <CopyIcon />}
                      onClick={onCopyAll}
                      variant="ghost"
                    >
                      {hasCopiedAll ? 'Copié!' : 'Copier'}
                    </Button>
                  </HStack>
                  <Code p={3} display="block" borderRadius="md" bg="gray.100">
                    {profile.buildCommands.all}
                  </Code>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Config JSON */}
          <Card mb={6}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Configuration EAS</Heading>
                <Button
                  size="sm"
                  leftIcon={hasCopiedConfig ? <CheckIcon /> : <CopyIcon />}
                  onClick={onCopyConfig}
                  variant="ghost"
                >
                  {hasCopiedConfig ? 'Copié!' : 'Copier JSON'}
                </Button>
              </HStack>
            </CardHeader>
            <CardBody>
              <Code p={4} display="block" borderRadius="md" bg="gray.50" whiteSpace="pre-wrap" fontSize="sm">
                {JSON.stringify(profile.config, null, 2)}
              </Code>
              <Text fontSize="sm" color="gray.500" mt={4}>
                Ajoutez cette configuration dans le fichier <Code>eas.json</Code> sous la clé{' '}
                <Code>build.{profile.profileName}</Code>
              </Text>
            </CardBody>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <Heading size="md">Instructions</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <HStack>
                  <Badge colorScheme="purple">1</Badge>
                  <Text>Copiez la configuration EAS et ajoutez-la dans <Code>mobile/eas.json</Code></Text>
                </HStack>
                <HStack>
                  <Badge colorScheme="purple">2</Badge>
                  <Text>Ouvrez un terminal dans le dossier <Code>mobile/</Code></Text>
                </HStack>
                <HStack>
                  <Badge colorScheme="purple">3</Badge>
                  <Text>Exécutez la commande de build pour la plateforme souhaitée</Text>
                </HStack>
                <HStack>
                  <Badge colorScheme="purple">4</Badge>
                  <Text>Récupérez les builds depuis <a href="https://expo.dev" target="_blank" rel="noopener">expo.dev</a></Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </>
      )}
    </Layout>
  );
}
