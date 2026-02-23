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
    setIsSubmitting(true);
    try {
      // TODO: Appel API pour créer l'événement
      // const response = await fetch('/api/events', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(eventData),
      // });
      
      // Simulation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: 'Événement créé',
        description: 'L\'événement a été créé avec succès.',
        status: 'success',
        duration: 3000,
      });

      router.push('/events');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création.',
        status: 'error',
        duration: 3000,
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
