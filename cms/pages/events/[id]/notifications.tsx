/**
 * Page d'envoi de notifications push
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
  Spinner,
  Select,
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { FiSend, FiBell } from 'react-icons/fi';
import {
  getNotifications,
  sendNotification,
  getInvitationGroups,
  Notification,
  InvitationGroup,
} from '../../../services/api';

export default function NotificationsPage() {
  const router = useRouter();
  const { id } = router.query;
  const eventId = id as string;
  const toast = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groups, setGroups] = useState<InvitationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetGroupId, setTargetGroupId] = useState('');
  const [scheduled, setScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Charger les données depuis l'API
  useEffect(() => {
    if (!eventId) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [notificationsData, groupsData] = await Promise.all([
          getNotifications(eventId),
          getInvitationGroups(eventId),
        ]);
        setNotifications(notificationsData);
        setGroups(groupsData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [eventId]);

  const handleSend = async () => {
    if (!eventId || !title || !message) {
      toast({
        title: 'Champs requis',
        description: 'Le titre et le message sont obligatoires.',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsSending(true);
    
    try {
      const newNotification = await sendNotification(eventId, {
        title,
        message,
        target_group_id: targetGroupId || undefined,
        scheduled_at: scheduled ? scheduledDate : undefined,
      });
      
      setNotifications(prev => [newNotification, ...prev]);
      
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
      setTargetGroupId('');
      setScheduled(false);
      setScheduledDate('');
    } catch (err) {
      console.error('Error sending notification:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer la notification',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSending(false);
    }
  };

  const totalSent = notifications.filter(n => n.status === 'sent').length;
  const totalOpened = notifications.reduce((sum, n) => sum + n.opened_count, 0);
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;

  return (
    <Layout>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">Notifications push</Heading>
          <Text color="gray.600">
            <Link href={`/events/${eventId}`}>
              <Text as="span" color="blue.600" cursor="pointer">← Retour à l'événement</Text>
            </Link>
          </Text>
        </Box>
      </Flex>

      {/* État de chargement */}
      {loading && (
        <Card>
          <CardBody textAlign="center" py={12}>
            <Spinner size="xl" color="purple.500" mb={4} />
            <Text color="gray.500">Chargement des notifications...</Text>
          </CardBody>
        </Card>
      )}

      {/* État d'erreur */}
      {error && !loading && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Contenu principal */}
      {!loading && !error && (
      <>
      {/* Stats */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Notifications envoyées</StatLabel>
              <StatNumber>{notifications.length}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total ouvertes</StatLabel>
              <StatNumber>{totalOpened}</StatNumber>
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
              <FormLabel>Groupe cible (optionnel)</FormLabel>
              <Select
                value={targetGroupId}
                onChange={(e) => setTargetGroupId(e.target.value)}
                placeholder="Tous les utilisateurs"
              >
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </Select>
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
                <Th>Statut</Th>
                <Th>Envoyée le</Th>
                <Th>Ouvertures</Th>
              </Tr>
            </Thead>
            <Tbody>
              {notifications.length === 0 ? (
                <Tr>
                  <Td colSpan={5} textAlign="center" color="gray.500" py={8}>
                    Aucune notification envoyée pour le moment.
                  </Td>
                </Tr>
              ) : (
                notifications.map((notif) => (
                  <Tr key={notif.id}>
                    <Td fontWeight="medium">{notif.title}</Td>
                    <Td>
                      <Text fontSize="sm" color="gray.600" maxW="250px" isTruncated>
                        {notif.message}
                      </Text>
                    </Td>
                    <Td>
                      <Badge colorScheme={
                        notif.status === 'sent' ? 'green' : 
                        notif.status === 'scheduled' ? 'blue' : 
                        notif.status === 'failed' ? 'red' : 'gray'
                      }>
                        {notif.status === 'sent' ? 'Envoyée' : 
                         notif.status === 'scheduled' ? 'Programmée' : 
                         notif.status === 'failed' ? 'Échec' : 'Brouillon'}
                      </Badge>
                    </Td>
                    <Td>
                      {notif.sent_at ? new Date(notif.sent_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : '-'}
                    </Td>
                    <Td>{notif.opened_count}</Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
      </>
      )}
    </Layout>
  );
}
