/**
 * Onglet Contacts - Organisateurs et contacts d'urgence
 */
import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
} from '@chakra-ui/react';
import { FiUser, FiPhone, FiMail, FiAlertCircle } from 'react-icons/fi';

interface ContactsTabProps {
  data: any;
  onChange: (data: any) => void;
}

export default function ContactsTab({ data, onChange }: ContactsTabProps) {
  const contacts = data.contacts || {};

  const handleOrganizerChange = (field: string, value: string) => {
    onChange({
      ...data,
      contacts: {
        ...contacts,
        organizer: { ...contacts.organizer, [field]: value },
      },
    });
  };

  const handleEmergencyChange = (field: string, value: string) => {
    onChange({
      ...data,
      contacts: {
        ...contacts,
        emergency: { ...contacts.emergency, [field]: value },
      },
    });
  };

  return (
    <VStack spacing={6} align="stretch">
      <Text color="gray.600">
        Ces informations seront affichées dans l'app pour que les invités puissent 
        contacter l'organisateur en cas de besoin.
      </Text>

      {/* Organisateur */}
      <Card>
        <CardHeader>
          <HStack>
            <Box as={FiUser} />
            <Heading size="sm">Organisateur principal</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Nom</FormLabel>
              <Input
                value={contacts.organizer?.name || ''}
                onChange={(e) => handleOrganizerChange('name', e.target.value)}
                placeholder="Ex: Marie Dupont"
              />
            </FormControl>

            <HStack spacing={4}>
              <FormControl isRequired flex={1}>
                <FormLabel>Téléphone</FormLabel>
                <Input
                  type="tel"
                  value={contacts.organizer?.phone || ''}
                  onChange={(e) => handleOrganizerChange('phone', e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                />
              </FormControl>

              <FormControl flex={1}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={contacts.organizer?.email || ''}
                  onChange={(e) => handleOrganizerChange('email', e.target.value)}
                  placeholder="marie@example.com"
                />
              </FormControl>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Contact d'urgence */}
      <Card>
        <CardHeader>
          <HStack>
            <Box as={FiAlertCircle} color="red.500" />
            <Heading size="sm">Contact d'urgence</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Nom</FormLabel>
              <Input
                value={contacts.emergency?.name || ''}
                onChange={(e) => handleEmergencyChange('name', e.target.value)}
                placeholder="Ex: Jean Martin (témoin)"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Téléphone</FormLabel>
              <Input
                type="tel"
                value={contacts.emergency?.phone || ''}
                onChange={(e) => handleEmergencyChange('phone', e.target.value)}
                placeholder="+33 6 98 76 54 32"
              />
            </FormControl>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}
