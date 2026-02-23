/**
 * Page d'envoi de notifications push
 */
import { useState } from 'react';
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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  HStack,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  useToast,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { FiSend, FiBell } from 'react-icons/fi';

// Données de démo
const mockNotifications = [
  { id: '1', title: 'Rappel : J-7 !', message: 'Plus que 7 jours avant le grand jour ! Avez-vous confirmé votre présence ?', sentAt: '2026-06-08T10:00:00', sent: 156, opened: 89 },
  { id: '2', title: 'Programme mis à jour', message: 'Le programme de la soirée a été mis à jour. Consultez-le dans l\'app !', sentAt: '2026-06-10T15:30:00', sent: 142, opened: 67 },
  { id: '3', title: 'Info parking', message: 'Attention, le parking du château est limité. Pensez au covoiturage !', sentAt: '2026-06-14T09:00:00', sent: 142, opened: 0 },
];

export default function NotificationsPage() {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [scheduled, setScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!title || !message) {
      toast({
        title: 'Champs requis',
        description: 'Le titre et le message sont obligatoires.',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSending(true);
    
    // Simulation d'envoi
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast({
      title: scheduled ? 'Notification programmée' : 'Notification envoyée',
      description: scheduled 
        ? `La notification sera envoyée le ${new Date(scheduledDate).toLocaleDateString('fr-FR')}`
        : 'La notification a été envoyée à tous les utilisateurs.',
      status: 'success',
      duration: 3000,
    });

    setTitle('');
    setMessage('');
    setScheduled(false);
    setScheduledDate('');
    setIsSending(false);
  };

  const totalSent = mockNotifications.reduce((sum, n) => sum + n.sent, 0);
  const totalOpened = mockNotifications.reduce((sum, n) => sum + n.opened, 0);
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;

  return (
    <Layout>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">Notifications push</Heading>
          <Text color="gray.600">
            <Link href={`/events/${id}`}>
              <Text as="span" color="blue.600" cursor="pointer">← Retour à l'événement</Text>
            </Link>
          </Text>
        </Box>
      </Flex>

      {/* Stats */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Notifications envoyées</StatLabel>
              <StatNumber>{mockNotifications.length}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total délivrées</StatLabel>
              <StatNumber>{totalSent}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Taux d'ouverture</StatLabel>
              <StatNumber>{openRate}%</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Formulaire d'envoi */}
      <Card mb={8}>
        <CardHeader>
          <HStack>
            <FiBell />
            <Heading size="md">Nouvelle notification</Heading>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                Les notifications seront envoyées à tous les utilisateurs ayant installé l'app et accepté les notifications.
              </Text>
            </Alert>

            <FormControl isRequired>
              <FormLabel>Titre</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Rappel important"
                maxLength={50}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>{title.length}/50 caractères</Text>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Message</FormLabel>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: N'oubliez pas de confirmer votre présence avant le 15 juin !"
                rows={3}
                maxLength={200}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>{message.length}/200 caractères</Text>
            </FormControl>

            <FormControl>
              <HStack justify="space-between">
                <FormLabel mb={0}>Programmer l'envoi</FormLabel>
                <Switch
                  isChecked={scheduled}
                  onChange={(e) => setScheduled(e.target.checked)}
                />
              </HStack>
            </FormControl>

            {scheduled && (
              <FormControl isRequired>
                <FormLabel>Date et heure d'envoi</FormLabel>
                <Input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </FormControl>
            )}

            <Button
              leftIcon={<FiSend />}
              colorScheme="blue"
              onClick={handleSend}
              isLoading={isSending}
              loadingText="Envoi en cours..."
            >
              {scheduled ? 'Programmer' : 'Envoyer maintenant'}
            </Button>
          </VStack>
        </CardBody>
      </Card>

      {/* Historique */}
      <Card>
        <CardHeader>
          <Heading size="md">Historique</Heading>
        </CardHeader>
        <CardBody pt={0}>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Titre</Th>
                <Th>Message</Th>
                <Th>Envoyée le</Th>
                <Th>Délivrées</Th>
                <Th>Ouvertes</Th>
                <Th>Taux</Th>
              </Tr>
            </Thead>
            <Tbody>
              {mockNotifications.map((notif) => (
                <Tr key={notif.id}>
                  <Td fontWeight="medium">{notif.title}</Td>
                  <Td>
                    <Text fontSize="sm" color="gray.600" maxW="250px" isTruncated>
                      {notif.message}
                    </Text>
                  </Td>
                  <Td>
                    {new Date(notif.sentAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Td>
                  <Td>{notif.sent}</Td>
                  <Td>{notif.opened}</Td>
                  <Td>
                    <Badge colorScheme={notif.sent > 0 && (notif.opened / notif.sent) > 0.5 ? 'green' : 'gray'}>
                      {notif.sent > 0 ? Math.round((notif.opened / notif.sent) * 100) : 0}%
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Layout>
  );
}
