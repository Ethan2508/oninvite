/**
 * Création d'un nouvel événement
 */
import { useState } from 'react';
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
} from '@chakra-ui/react';
import Layout from '../../components/Layout';
import {
  GeneralTab,
  BrandingTab,
  LocationsTab,
  ProgramTab,
  ModulesTab,
  ContactsTab,
  SettingsTab,
} from '../../components/EventForm';

// Configuration initiale d'un événement
const initialEventData = {
  event: {
    type: 'wedding',
    title: '',
    subtitle: '',
    date: '',
    end_date: '',
    timezone: 'Europe/Paris',
    language: ['fr'],
    default_language: 'fr',
    guests_count_estimate: 100,
  },
  branding: {
    app_name: '',
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
  locations: [],
  program: [],
  modules: {},
  contacts: {
    organizer: {},
    emergency: {},
  },
  settings: {},
  status: 'draft',
  pack: 'premium',
};

export default function NewEventPage() {
  const router = useRouter();
  const toast = useToast();
  const [eventData, setEventData] = useState(initialEventData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const handleSave = async () => {
    // Validation basique
    if (!eventData.event.title) {
      toast({
        title: 'Erreur',
        description: 'Le titre est obligatoire.',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!eventData.event.date) {
      toast({
        title: 'Erreur',
        description: 'La date est obligatoire.',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Générer un slug à partir du titre
      const slug = eventData.branding.app_name 
        ? eventData.branding.app_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
        : eventData.event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

      // Préparer les données pour l'API
      const apiData = {
        slug: slug,
        type: eventData.event.type,
        title: eventData.event.title,
        subtitle: eventData.event.subtitle || null,
        event_date: new Date(eventData.event.date).toISOString(),
        end_date: eventData.event.end_date ? new Date(eventData.event.end_date).toISOString() : null,
        timezone: eventData.event.timezone,
        languages: eventData.event.language,
        default_language: eventData.event.default_language,
        pack: eventData.pack,
        config: {
          branding: eventData.branding,
          locations: eventData.locations,
          program: eventData.program,
          modules: eventData.modules,
          contacts: eventData.contacts,
          settings: eventData.settings,
        },
        client_name: eventData.contacts?.organizer?.name || null,
        client_email: eventData.contacts?.organizer?.email || null,
        client_phone: eventData.contacts?.organizer?.phone || null,
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || error.error || 'Erreur lors de la création');
      }

      const created = await response.json();

      toast({
        title: 'Événement créé',
        description: 'L\'événement a été créé avec succès.',
        status: 'success',
        duration: 3000,
      });

      router.push(`/events/${created.id}`);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la création.',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/events');
  };

  return (
    <Layout>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">Nouvel événement</Heading>
          <Text color="gray.600">Créez un nouvel événement pour votre client</Text>
        </Box>
        <HStack spacing={4}>
          <Button variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isLoading={isSubmitting}
          >
            Créer l'événement
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
                <GeneralTab data={eventData} onChange={setEventData} />
              </TabPanel>
              <TabPanel>
                <BrandingTab data={eventData} onChange={setEventData} />
              </TabPanel>
              <TabPanel>
                <LocationsTab data={eventData} onChange={setEventData} />
              </TabPanel>
              <TabPanel>
                <ProgramTab data={eventData} onChange={setEventData} />
              </TabPanel>
              <TabPanel>
                <ModulesTab data={eventData} onChange={setEventData} />
              </TabPanel>
              <TabPanel>
                <ContactsTab data={eventData} onChange={setEventData} />
              </TabPanel>
              <TabPanel>
                <SettingsTab data={eventData} onChange={setEventData} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>

      {/* Navigation rapide */}
      <Flex justify="space-between" mt={6}>
        <Button
          variant="outline"
          isDisabled={tabIndex === 0}
          onClick={() => setTabIndex(tabIndex - 1)}
        >
          ← Précédent
        </Button>
        {tabIndex < 6 ? (
          <Button
            colorScheme="blue"
            variant="outline"
            onClick={() => setTabIndex(tabIndex + 1)}
          >
            Suivant →
          </Button>
        ) : (
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isLoading={isSubmitting}
          >
            Créer l'événement
          </Button>
        )}
      </Flex>
    </Layout>
  );
}
