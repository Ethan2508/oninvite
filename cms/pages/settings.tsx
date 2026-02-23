/**
 * Page globale - Paramètres
 */
import { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Button,
  Divider,
  useToast,
  Select,
  Textarea,
} from '@chakra-ui/react';
import Layout from '../components/Layout';

export default function SettingsPage() {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    companyName: 'Oninvite',
    supportEmail: 'support@oninvite.fr',
    defaultLanguage: 'fr',
    timezone: 'Europe/Paris',
    emailNotifications: true,
    pushNotifications: true,
    autoApprovePhotos: false,
    autoApproveGuestbook: false,
    defaultEventDuration: '1',
    maxPhotoSize: '10',
    welcomeMessage: 'Bienvenue sur votre espace événement !',
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    toast({
      title: 'Paramètres sauvegardés',
      status: 'success',
      duration: 3000,
    });
  };

  return (
    <Layout>
      <Box mb={8}>
        <Heading size="lg">Paramètres</Heading>
        <Text color="gray.600">Configuration globale de la plateforme</Text>
      </Box>

      <VStack spacing={6} align="stretch">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <Heading size="md">Général</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Nom de l'entreprise</FormLabel>
                <Input
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Email support</FormLabel>
                <Input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                />
              </FormControl>
              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Langue par défaut</FormLabel>
                  <Select
                    value={settings.defaultLanguage}
                    onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="it">Italiano</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Fuseau horaire</FormLabel>
                  <Select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  >
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="America/New_York">New York (EST)</option>
                  </Select>
                </FormControl>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <Heading size="md">Notifications</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Notifications email</FormLabel>
                <Switch
                  isChecked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  colorScheme="purple"
                />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Notifications push</FormLabel>
                <Switch
                  isChecked={settings.pushNotifications}
                  onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                  colorScheme="purple"
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Moderation */}
        <Card>
          <CardHeader>
            <Heading size="md">Modération</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Auto-approuver les photos</FormLabel>
                <Switch
                  isChecked={settings.autoApprovePhotos}
                  onChange={(e) => setSettings({ ...settings, autoApprovePhotos: e.target.checked })}
                  colorScheme="purple"
                />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Auto-approuver le livre d'or</FormLabel>
                <Switch
                  isChecked={settings.autoApproveGuestbook}
                  onChange={(e) => setSettings({ ...settings, autoApproveGuestbook: e.target.checked })}
                  colorScheme="purple"
                />
              </FormControl>
              <Divider />
              <FormControl>
                <FormLabel>Taille max photo (MB)</FormLabel>
                <Input
                  type="number"
                  value={settings.maxPhotoSize}
                  onChange={(e) => setSettings({ ...settings, maxPhotoSize: e.target.value })}
                  maxW="100px"
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Default Messages */}
        <Card>
          <CardHeader>
            <Heading size="md">Messages par défaut</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Message de bienvenue</FormLabel>
                <Textarea
                  value={settings.welcomeMessage}
                  onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                  rows={3}
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Save Button */}
        <Box>
          <Button
            colorScheme="purple"
            size="lg"
            onClick={handleSave}
            isLoading={saving}
            loadingText="Sauvegarde..."
          >
            Sauvegarder les paramètres
          </Button>
        </Box>
      </VStack>
    </Layout>
  );
}
