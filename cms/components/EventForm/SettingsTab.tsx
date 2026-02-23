/**
 * Onglet Paramètres - Options avancées
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
  NumberInput,
  NumberInputField,
  Select,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';

interface SettingsTabProps {
  data: any;
  onChange: (data: any) => void;
}

const packs = [
  { value: 'essential', label: 'Essentiel (490€)', description: 'Fonctionnalités de base' },
  { value: 'premium', label: 'Premium (790€)', description: 'Toutes les fonctionnalités' },
  { value: 'vip', label: 'VIP (1200€)', description: 'Support prioritaire + personnalisation' },
];

const statuses = [
  { value: 'draft', label: 'Brouillon', color: 'gray' },
  { value: 'pending_review', label: 'En attente de review', color: 'orange' },
  { value: 'live', label: 'En ligne', color: 'green' },
  { value: 'souvenir', label: 'Mode souvenir', color: 'blue' },
  { value: 'expired', label: 'Expiré', color: 'red' },
];

export default function SettingsTab({ data, onChange }: SettingsTabProps) {
  const settings = data.settings || {};

  const handleChange = (field: string, value: any) => {
    onChange({
      ...data,
      settings: { ...settings, [field]: value },
    });
  };

  const handleRootChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Statut et Pack */}
      <Card>
        <CardHeader>
          <Heading size="sm">Statut & Facturation</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack spacing={4}>
              <FormControl flex={1}>
                <FormLabel>Statut de l'événement</FormLabel>
                <Select
                  value={data.status || 'draft'}
                  onChange={(e) => handleRootChange('status', e.target.value)}
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl flex={1}>
                <FormLabel>Pack</FormLabel>
                <Select
                  value={data.pack || 'premium'}
                  onChange={(e) => handleRootChange('pack', e.target.value)}
                >
                  {packs.map((pack) => (
                    <option key={pack.value} value={pack.value}>
                      {pack.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>ID Stripe</FormLabel>
              <Input
                value={data.stripe_customer_id || ''}
                onChange={(e) => handleRootChange('stripe_customer_id', e.target.value)}
                placeholder="cus_xxxxx"
                fontFamily="mono"
              />
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      {/* Mode souvenir */}
      <Card>
        <CardHeader>
          <Heading size="sm">Mode souvenir</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                Le mode souvenir transforme automatiquement l'app après l'événement : 
                désactivation RSVP, affichage "cet événement est terminé", accès galerie préservé.
              </Text>
            </Alert>

            <FormControl>
              <HStack justify="space-between">
                <Box>
                  <FormLabel mb={0}>Activer automatiquement</FormLabel>
                  <Text fontSize="sm" color="gray.600">
                    Passer en mode souvenir après l'événement
                  </Text>
                </Box>
                <Switch
                  isChecked={settings.auto_souvenir_mode || false}
                  onChange={(e) => handleChange('auto_souvenir_mode', e.target.checked)}
                />
              </HStack>
            </FormControl>

            <FormControl>
              <FormLabel>Délai avant activation (jours)</FormLabel>
              <NumberInput
                value={settings.souvenir_delay_days || 7}
                onChange={(_, val) => handleChange('souvenir_delay_days', val)}
                min={1}
                max={30}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      {/* Expiration */}
      <Card>
        <CardHeader>
          <Heading size="sm">Expiration</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Date d'expiration de l'app</FormLabel>
              <Input
                type="date"
                value={settings.expiration_date || ''}
                onChange={(e) => handleChange('expiration_date', e.target.value)}
              />
              <Text fontSize="sm" color="gray.600" mt={1}>
                L'app restera accessible jusqu'à cette date
              </Text>
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      {/* Affichage */}
      <Card>
        <CardHeader>
          <Heading size="sm">Affichage</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <HStack justify="space-between">
                <Box>
                  <FormLabel mb={0}>Afficher "Propulsé par Oninvite"</FormLabel>
                  <Text fontSize="sm" color="gray.600">
                    Badge discret dans le footer de l'app
                  </Text>
                </Box>
                <Switch
                  isChecked={settings.show_powered_by !== false}
                  onChange={(e) => handleChange('show_powered_by', e.target.checked)}
                />
              </HStack>
            </FormControl>

            <FormControl>
              <HStack justify="space-between">
                <Box>
                  <FormLabel mb={0}>Mode maintenance</FormLabel>
                  <Text fontSize="sm" color="gray.600">
                    Afficher un message de maintenance aux utilisateurs
                  </Text>
                </Box>
                <Switch
                  isChecked={settings.maintenance_mode || false}
                  onChange={(e) => handleChange('maintenance_mode', e.target.checked)}
                />
              </HStack>
            </FormControl>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
