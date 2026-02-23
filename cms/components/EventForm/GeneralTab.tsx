/**
 * Onglet Général - Informations de base de l'événement
 */
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  HStack,
  NumberInput,
  NumberInputField,
  Checkbox,
  CheckboxGroup,
  Stack,
} from '@chakra-ui/react';

interface GeneralTabProps {
  data: any;
  onChange: (data: any) => void;
}

const eventTypes = [
  { value: 'wedding', label: 'Mariage' },
  { value: 'bar_mitzvah', label: 'Bar Mitzvah' },
  { value: 'bat_mitzvah', label: 'Bat Mitzvah' },
  { value: 'birthday', label: 'Anniversaire' },
  { value: 'corporate', label: 'Événement corporate' },
  { value: 'other', label: 'Autre' },
];

const languages = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'he', label: 'עברית' },
  { value: 'es', label: 'Español' },
  { value: 'it', label: 'Italiano' },
];

export default function GeneralTab({ data, onChange }: GeneralTabProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleEventChange = (field: string, value: any) => {
    onChange({
      ...data,
      event: { ...data.event, [field]: value },
    });
  };

  return (
    <VStack spacing={6} align="stretch">
      <FormControl isRequired>
        <FormLabel>Type d'événement</FormLabel>
        <Select
          value={data.event?.type || 'wedding'}
          onChange={(e) => handleEventChange('type', e.target.value)}
        >
          {eventTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
      </FormControl>

      <HStack spacing={4}>
        <FormControl isRequired flex={1}>
          <FormLabel>Titre</FormLabel>
          <Input
            value={data.event?.title || ''}
            onChange={(e) => handleEventChange('title', e.target.value)}
            placeholder="Ex: Marie & Jean"
          />
        </FormControl>

        <FormControl flex={1}>
          <FormLabel>Sous-titre</FormLabel>
          <Input
            value={data.event?.subtitle || ''}
            onChange={(e) => handleEventChange('subtitle', e.target.value)}
            placeholder="Ex: Nous nous marions !"
          />
        </FormControl>
      </HStack>

      <HStack spacing={4}>
        <FormControl isRequired flex={1}>
          <FormLabel>Date et heure de début</FormLabel>
          <Input
            type="datetime-local"
            value={data.event?.date?.slice(0, 16) || ''}
            onChange={(e) => handleEventChange('date', e.target.value)}
          />
        </FormControl>

        <FormControl flex={1}>
          <FormLabel>Date et heure de fin</FormLabel>
          <Input
            type="datetime-local"
            value={data.event?.end_date?.slice(0, 16) || ''}
            onChange={(e) => handleEventChange('end_date', e.target.value)}
          />
        </FormControl>
      </HStack>

      <FormControl>
        <FormLabel>Fuseau horaire</FormLabel>
        <Select
          value={data.event?.timezone || 'Europe/Paris'}
          onChange={(e) => handleEventChange('timezone', e.target.value)}
        >
          <option value="Europe/Paris">Europe/Paris</option>
          <option value="Europe/London">Europe/London</option>
          <option value="America/New_York">America/New_York</option>
          <option value="Asia/Jerusalem">Asia/Jerusalem</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Langues</FormLabel>
        <CheckboxGroup
          value={data.event?.language || ['fr']}
          onChange={(values) => handleEventChange('language', values)}
        >
          <Stack direction="row" spacing={4}>
            {languages.map((lang) => (
              <Checkbox key={lang.value} value={lang.value}>
                {lang.label}
              </Checkbox>
            ))}
          </Stack>
        </CheckboxGroup>
      </FormControl>

      <FormControl>
        <FormLabel>Langue par défaut</FormLabel>
        <Select
          value={data.event?.default_language || 'fr'}
          onChange={(e) => handleEventChange('default_language', e.target.value)}
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Nombre d'invités estimé</FormLabel>
        <NumberInput
          value={data.event?.guests_count_estimate || 100}
          onChange={(_, value) => handleEventChange('guests_count_estimate', value)}
          min={1}
          max={1000}
        >
          <NumberInputField />
        </NumberInput>
      </FormControl>
    </VStack>
  );
}
