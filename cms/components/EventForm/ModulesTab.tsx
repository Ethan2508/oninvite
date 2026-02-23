/**
 * Onglet Modules - Activation/configuration des fonctionnalités
 */
import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Collapse,
  SimpleGrid,
  Textarea,
  NumberInput,
  NumberInputField,
  Select,
} from '@chakra-ui/react';

interface ModulesTabProps {
  data: any;
  onChange: (data: any) => void;
}

interface ModuleConfig {
  key: string;
  label: string;
  icon: string;
  description: string;
  fields?: {
    key: string;
    label: string;
    type: 'text' | 'number' | 'switch' | 'textarea' | 'select';
    options?: string[];
    default?: any;
  }[];
}

const modules: ModuleConfig[] = [
  {
    key: 'rsvp',
    label: 'RSVP',
    icon: '✉️',
    description: 'Permettre aux invités de confirmer leur présence',
    fields: [
      { key: 'deadline', label: 'Date limite', type: 'text' },
      { key: 'allow_plus_ones', label: 'Autoriser accompagnants', type: 'switch', default: true },
      { key: 'max_plus_ones', label: 'Max accompagnants', type: 'number', default: 2 },
      { key: 'ask_dietary', label: 'Demander régime alimentaire', type: 'switch', default: true },
      { key: 'ask_allergies', label: 'Demander allergies', type: 'switch', default: true },
    ],
  },
  {
    key: 'gallery',
    label: 'Galerie photo',
    icon: '📸',
    description: 'Partage de photos par les invités',
    fields: [
      { key: 'allow_upload', label: 'Autoriser upload', type: 'switch', default: true },
      { key: 'moderation', label: 'Modération requise', type: 'switch', default: true },
      { key: 'max_photos_per_user', label: 'Max photos par invité', type: 'number', default: 10 },
    ],
  },
  {
    key: 'donation',
    label: 'Cagnotte',
    icon: '💝',
    description: 'Permettre aux invités de participer à la cagnotte',
    fields: [
      { key: 'goal_amount', label: 'Objectif (€)', type: 'number', default: 5000 },
      { key: 'show_progress', label: 'Afficher la progression', type: 'switch', default: true },
      { key: 'allow_anonymous', label: 'Dons anonymes', type: 'switch', default: true },
      { key: 'min_amount', label: 'Montant minimum (€)', type: 'number', default: 10 },
      { key: 'suggested_amounts', label: 'Montants suggérés (séparés par ,)', type: 'text' },
      { key: 'message', label: 'Message personnalisé', type: 'textarea' },
    ],
  },
  {
    key: 'guestbook',
    label: 'Livre d\'or',
    icon: '📖',
    description: 'Les invités peuvent laisser des messages',
    fields: [
      { key: 'moderation', label: 'Modération requise', type: 'switch', default: false },
      { key: 'allow_photos', label: 'Autoriser photos', type: 'switch', default: true },
    ],
  },
  {
    key: 'playlist',
    label: 'Playlist collaborative',
    icon: '🎵',
    description: 'Les invités suggèrent des chansons',
    fields: [
      { key: 'max_suggestions_per_user', label: 'Max suggestions par invité', type: 'number', default: 3 },
      { key: 'spotify_playlist_url', label: 'URL playlist Spotify', type: 'text' },
    ],
  },
  {
    key: 'seating_plan',
    label: 'Plan de table',
    icon: '🪑',
    description: 'Afficher le plan de table et permettre la recherche',
    fields: [
      { key: 'show_full_plan', label: 'Afficher le plan complet', type: 'switch', default: false },
      { key: 'allow_search', label: 'Recherche de table', type: 'switch', default: true },
    ],
  },
  {
    key: 'menu_choice',
    label: 'Choix de menu',
    icon: '🍽️',
    description: 'Les invités choisissent leur menu à l\'avance',
    fields: [
      { key: 'options', label: 'Options de menu (une par ligne)', type: 'textarea' },
      { key: 'deadline', label: 'Date limite', type: 'text' },
    ],
  },
  {
    key: 'chat',
    label: 'Chat invités',
    icon: '💬',
    description: 'Discussion en direct entre invités',
    fields: [
      { key: 'moderation', label: 'Modération requise', type: 'switch', default: false },
    ],
  },
];

export default function ModulesTab({ data, onChange }: ModulesTabProps) {
  const moduleData = data.modules || {};

  const toggleModule = (moduleKey: string) => {
    const current = moduleData[moduleKey] || { enabled: false };
    onChange({
      ...data,
      modules: {
        ...moduleData,
        [moduleKey]: { ...current, enabled: !current.enabled },
      },
    });
  };

  const updateModuleField = (moduleKey: string, fieldKey: string, value: any) => {
    const current = moduleData[moduleKey] || { enabled: false };
    onChange({
      ...data,
      modules: {
        ...moduleData,
        [moduleKey]: { ...current, [fieldKey]: value },
      },
    });
  };

  const renderField = (moduleKey: string, field: any) => {
    const value = moduleData[moduleKey]?.[field.key] ?? field.default;

    switch (field.type) {
      case 'switch':
        return (
          <FormControl key={field.key}>
            <HStack justify="space-between">
              <FormLabel mb={0} fontSize="sm">{field.label}</FormLabel>
              <Switch
                isChecked={value}
                onChange={(e) => updateModuleField(moduleKey, field.key, e.target.checked)}
              />
            </HStack>
          </FormControl>
        );
      case 'number':
        return (
          <FormControl key={field.key}>
            <FormLabel fontSize="sm">{field.label}</FormLabel>
            <NumberInput
              size="sm"
              value={value}
              onChange={(_, val) => updateModuleField(moduleKey, field.key, val)}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
        );
      case 'textarea':
        return (
          <FormControl key={field.key}>
            <FormLabel fontSize="sm">{field.label}</FormLabel>
            <Textarea
              size="sm"
              value={value || ''}
              onChange={(e) => updateModuleField(moduleKey, field.key, e.target.value)}
              rows={3}
            />
          </FormControl>
        );
      default:
        return (
          <FormControl key={field.key}>
            <FormLabel fontSize="sm">{field.label}</FormLabel>
            <Input
              size="sm"
              value={value || ''}
              onChange={(e) => updateModuleField(moduleKey, field.key, e.target.value)}
            />
          </FormControl>
        );
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Text color="gray.600" mb={2}>
        Activez et configurez les modules disponibles pour votre événement.
      </Text>

      {modules.map((module) => {
        const isEnabled = moduleData[module.key]?.enabled || false;

        return (
          <Card key={module.key} variant={isEnabled ? 'filled' : 'outline'}>
            <CardHeader pb={0}>
              <HStack justify="space-between">
                <HStack>
                  <Text fontSize="xl">{module.icon}</Text>
                  <Box>
                    <Heading size="sm">{module.label}</Heading>
                    <Text fontSize="sm" color="gray.600">
                      {module.description}
                    </Text>
                  </Box>
                </HStack>
                <Switch
                  size="lg"
                  isChecked={isEnabled}
                  onChange={() => toggleModule(module.key)}
                  colorScheme="blue"
                />
              </HStack>
            </CardHeader>

            <Collapse in={isEnabled}>
              <CardBody pt={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {module.fields?.map((field) => renderField(module.key, field))}
                </SimpleGrid>
              </CardBody>
            </Collapse>
          </Card>
        );
      })}
    </VStack>
  );
}
