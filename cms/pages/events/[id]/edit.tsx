/**
 * Édition d'un événement
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  Button,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  HStack,
  Badge,
  Spinner,
  Center,
} from '@chakra-ui/react';
import Layout from '../../../components/Layout';
import {
  GeneralTab,
  BrandingTab,
  LocationsTab,
  ProgramTab,
  ModulesTab,
  ContactsTab,
  SettingsTab,
} from '../../../components/EventForm';

// Données de démo
const mockEventData = {
  id: '1',
  event: {
    type: 'wedding',
    title: 'Sarah & David',
    subtitle: 'Nous nous marions !',
    date: '2026-06-15T17:00',
    end_date: '2026-06-16T03:00',
    timezone: 'Europe/Paris',
    language: ['fr', 'he'],
    default_language: 'fr',
    guests_count_estimate: 250,
  },
  branding: {
    app_name: 'Sarah & David',
    logo_url: '',
    colors: {
      primary: '#D4AF37',
      secondary: '#1A1A2E',
      accent: '#F5E6CC',
      background: '#FFFFFF',
      text: '#333333',
      text_light: '#FFFFFF',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Lato',
    },
    style: 'elegant',
  },
  locations: [
    {
      id: 'loc_ceremony',
      name: 'Synagogue de la Victoire',
      type: 'ceremony',
      address: '44 Rue de la Victoire, 75009 Paris',
      latitude: 48.8756,
      longitude: 2.3372,
      time: '17:00',
      notes: 'Merci d\'arriver 15 minutes en avance',
      parking_info: 'Parking Q-Park Chaussée d\'Antin à 200m',
      dress_code: 'Tenue de soirée',
    },
    {
      id: 'loc_reception',
      name: 'Château de Versainville',
      type: 'reception',
      address: '14 Rue du Château, 14700 Versainville',
      latitude: 48.9512,
      longitude: -0.1847,
      time: '20:00',
      notes: 'Navettes depuis la synagogue à 19h00 et 19h30',
      parking_info: 'Parking gratuit sur place',
      dress_code: '',
    },
  ],
  program: [
    { time: '17:00', title: 'Cérémonie religieuse', subtitle: 'Synagogue de la Victoire', icon: 'synagogue', location_id: 'loc_ceremony' },
    { time: '17:45', title: 'Houppa', subtitle: 'Dans le jardin de la synagogue', icon: 'houppa', location_id: 'loc_ceremony' },
    { time: '19:00', title: 'Navettes vers la réception', subtitle: 'Départ devant la synagogue', icon: 'bus', location_id: 'loc_ceremony' },
    { time: '20:00', title: 'Cocktail', subtitle: 'Dans les jardins du château', icon: 'cocktail', location_id: 'loc_reception' },
    { time: '21:30', title: 'Dîner', subtitle: 'Grande salle du château', icon: 'dinner', location_id: 'loc_reception' },
    { time: '00:00', title: 'Soirée dansante', subtitle: 'Jusqu\'au bout de la nuit !', icon: 'dance', location_id: 'loc_reception' },
  ],
  modules: {
    rsvp: { enabled: true, deadline: '2026-05-15', allow_plus_ones: true, max_plus_ones: 2, ask_dietary: true, ask_allergies: true },
    gallery: { enabled: true, allow_upload: true, moderation: true },
    donation: { enabled: true, goal_amount: 5000, show_progress: true, allow_anonymous: true },
    guestbook: { enabled: true, moderation: false },
    playlist: { enabled: true, max_suggestions_per_user: 3 },
    seating_plan: { enabled: true, allow_search: true },
  },
  contacts: {
    organizer: { name: 'Sarah Cohen', phone: '+33 6 12 34 56 78', email: 'sarah.david2026@gmail.com' },
    emergency: { name: 'Rachel (témoin)', phone: '+33 6 98 76 54 32' },
  },
  settings: {
    auto_souvenir_mode: true,
    souvenir_delay_days: 7,
    show_powered_by: true,
  },
  status: 'live',
  pack: 'premium',
};

export default function EditEventPage() {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  
  const [eventData, setEventData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Charger les données de l'événement
    // TODO: Appel API réel
    setTimeout(() => {
      setEventData(mockEventData);
      setIsLoading(false);
    }, 500);
  }, [id]);

  const handleChange = (newData: any) => {
    setEventData(newData);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Appel API pour sauvegarder
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: 'Modifications enregistrées',
        status: 'success',
        duration: 3000,
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Center h="50vh">
          <Spinner size="xl" />
        </Center>
      </Layout>
    );
  }

  return (
    <Layout>
      <Flex justify="space-between" align="flex-start" mb={8}>
        <Box>
          <HStack mb={2}>
            <Heading size="lg">Modifier : {eventData.event.title}</Heading>
            {hasChanges && (
              <Badge colorScheme="orange">Non enregistré</Badge>
            )}
          </HStack>
          <Text color="gray.600">ID: {id}</Text>
        </Box>
        <HStack spacing={4}>
          <Button
            variant="outline"
            onClick={() => router.push(`/events/${id}`)}
          >
            Retour
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isLoading={isSaving}
            isDisabled={!hasChanges}
          >
            Enregistrer
          </Button>
        </HStack>
      </Flex>

      <Card>
        <CardBody>
          <Tabs index={tabIndex} onChange={setTabIndex} isLazy>
            <TabList>
              <Tab>Général</Tab>
              <Tab>Branding</Tab>
              <Tab>Lieux</Tab>
              <Tab>Programme</Tab>
              <Tab>Modules</Tab>
              <Tab>Contacts</Tab>
              <Tab>Paramètres</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <GeneralTab data={eventData} onChange={handleChange} />
              </TabPanel>
              <TabPanel>
                <BrandingTab data={eventData} onChange={handleChange} />
              </TabPanel>
              <TabPanel>
                <LocationsTab data={eventData} onChange={handleChange} />
              </TabPanel>
              <TabPanel>
                <ProgramTab data={eventData} onChange={handleChange} />
              </TabPanel>
              <TabPanel>
                <ModulesTab data={eventData} onChange={handleChange} />
              </TabPanel>
              <TabPanel>
                <ContactsTab data={eventData} onChange={handleChange} />
              </TabPanel>
              <TabPanel>
                <SettingsTab data={eventData} onChange={handleChange} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>

      {/* Barre de navigation / sauvegarde fixe */}
      {hasChanges && (
        <Box
          position="fixed"
          bottom={0}
          left={{ base: 0, md: '250px' }}
          right={0}
          bg="white"
          borderTop="1px"
          borderColor="gray.200"
          p={4}
          zIndex={10}
        >
          <Flex justify="flex-end" maxW="container.xl" mx="auto">
            <HStack spacing={4}>
              <Text color="gray.600">Modifications non enregistrées</Text>
              <Button
                variant="outline"
                onClick={() => {
                  setEventData(mockEventData);
                  setHasChanges(false);
                }}
              >
                Annuler
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSave}
                isLoading={isSaving}
              >
                Enregistrer
              </Button>
            </HStack>
          </Flex>
        </Box>
      )}
    </Layout>
  );
}
