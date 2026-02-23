/**
 * Dashboard d'un événement - Vue complète
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
  SimpleGrid,
  HStack,
  VStack,
  Icon,
  Avatar,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import {
  FiEdit,
  FiEye,
  FiUsers,
  FiImage,
  FiMessageSquare,
  FiDollarSign,
  FiBell,
  FiSettings,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiCalendar,
  FiMapPin,
  FiSmartphone,
} from 'react-icons/fi';

interface Event {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
  event_date: string;
  status: string;
  pack: string;
  couple_names?: string;
  contact_email?: string;
  primary_color?: string;
  secondary_color?: string;
  venue_name?: string;
  venue_address?: string;
}

interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  rsvp_status: string;
  created_at: string;
}

interface Photo {
  id: string;
  url: string;
  status: string;
  created_at: string;
}

interface GuestbookEntry {
  id: string;
  author_name: string;
  message: string;
  status: string;
  created_at: string;
}

interface Donation {
  id: string;
  donor_name: string;
  amount: number;
  status: string;
  created_at: string;
}

interface Notification {
  id: string;
  title: string;
  status: string;
  sent_at?: string;
}

const statusColors: Record<string, string> = {
  draft: 'gray',
  pending_review: 'orange',
  live: 'green',
  souvenir: 'blue',
  expired: 'red',
};

const rsvpStatusConfig: Record<string, { color: string; icon: any; label: string }> = {
  confirmed: { color: 'green', icon: FiCheckCircle, label: 'Confirmé' },
  pending: { color: 'orange', icon: FiClock, label: 'En attente' },
  declined: { color: 'red', icon: FiXCircle, label: 'Décliné' },
};

export default function EventDashboard() {
  const router = useRouter();
  const { id } = router.query;
  const cardBg = useColorModeValue('white', 'gray.800');

  const [event, setEvent] = useState<Event | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        // Load event
        const eventRes = await fetch(`/api/events/${id}`);
        if (eventRes.ok) {
          setEvent(await eventRes.json());
        }

        // Load guests
        const guestsRes = await fetch(`/api/events/${id}/guests`);
        if (guestsRes.ok) {
          setGuests(await guestsRes.json());
        }

        // Load photos
        const photosRes = await fetch(`/api/events/${id}/photos`);
        if (photosRes.ok) {
          setPhotos(await photosRes.json());
        }

        // Load guestbook
        const guestbookRes = await fetch(`/api/events/${id}/guestbook`);
        if (guestbookRes.ok) {
          setGuestbook(await guestbookRes.json());
        }

        // Load donations
        const donationsRes = await fetch(`/api/events/${id}/donations`);
        if (donationsRes.ok) {
          setDonations(await donationsRes.json());
        }

        // Load notifications
        const notifRes = await fetch(`/api/events/${id}/notifications`);
        if (notifRes.ok) {
          setNotifications(await notifRes.json());
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Calculate stats
  const confirmedCount = guests.filter(g => g.rsvp_status === 'confirmed').length;
  const pendingCount = guests.filter(g => g.rsvp_status === 'pending').length;
  const declinedCount = guests.filter(g => g.rsvp_status === 'declined').length;
  const totalGuests = guests.length;
  const confirmRate = totalGuests > 0 ? Math.round((confirmedCount / totalGuests) * 100) : 0;

  const approvedPhotos = photos.filter(p => p.status === 'approved').length;
  const pendingPhotos = photos.filter(p => p.status === 'pending').length;

  const approvedMessages = guestbook.filter(g => g.status === 'approved').length;
  const pendingMessages = guestbook.filter(g => g.status === 'pending').length;

  const totalDonations = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const sentNotifications = notifications.filter(n => n.status === 'sent').length;

  if (loading) {
    return (
      <Layout>
        <Flex justify="center" align="center" minH="60vh">
          <Spinner size="xl" color="purple.500" />
        </Flex>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <Box textAlign="center" py={20}>
          <Heading size="lg" color="gray.500">Événement non trouvé</Heading>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <Flex justify="space-between" align="flex-start" mb={8}>
        <Box>
          <HStack mb={2}>
            <Heading size="lg">{event.title}</Heading>
            <Badge colorScheme={statusColors[event.status]} fontSize="md" px={3}>
              {event.status}
            </Badge>
            <Badge variant="outline" colorScheme="purple" px={3}>
              {event.pack}
            </Badge>
          </HStack>
          {event.subtitle && <Text color="gray.600">{event.subtitle}</Text>}
          <HStack mt={2} spacing={4} color="gray.500" fontSize="sm">
            <HStack>
              <Icon as={FiCalendar} />
              <Text suppressHydrationWarning>
                {new Date(event.event_date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </HStack>
            {event.venue_name && (
              <HStack>
                <Icon as={FiMapPin} />
                <Text>{event.venue_name}</Text>
              </HStack>
            )}
          </HStack>
        </Box>
        <HStack spacing={3}>
          <Link href={`/events/${id}/preview`}>
            <Button leftIcon={<FiEye />} variant="outline">
              Preview
            </Button>
          </Link>
          <Link href={`/events/${id}/edit`}>
            <Button leftIcon={<FiEdit />} colorScheme="purple">
              Modifier
            </Button>
          </Link>
        </HStack>
      </Flex>

      {/* Stats principales */}
      <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4} mb={8}>
        <Card bg={cardBg}>
          <CardBody textAlign="center" py={4}>
            <Text fontSize="3xl" fontWeight="bold" color="green.500">{confirmedCount}</Text>
            <Text fontSize="sm" color="gray.500">Confirmés</Text>
          </CardBody>
        </Card>
        <Card bg={cardBg}>
          <CardBody textAlign="center" py={4}>
            <Text fontSize="3xl" fontWeight="bold" color="orange.500">{pendingCount}</Text>
            <Text fontSize="sm" color="gray.500">En attente</Text>
          </CardBody>
        </Card>
        <Card bg={cardBg}>
          <CardBody textAlign="center" py={4}>
            <Text fontSize="3xl" fontWeight="bold" color="red.500">{declinedCount}</Text>
            <Text fontSize="sm" color="gray.500">Déclinés</Text>
          </CardBody>
        </Card>
        <Card bg={cardBg}>
          <CardBody textAlign="center" py={4}>
            <Text fontSize="3xl" fontWeight="bold" color="blue.500">{photos.length}</Text>
            <Text fontSize="sm" color="gray.500">Photos</Text>
          </CardBody>
        </Card>
        <Card bg={cardBg}>
          <CardBody textAlign="center" py={4}>
            <Text fontSize="3xl" fontWeight="bold" color="purple.500">{guestbook.length}</Text>
            <Text fontSize="sm" color="gray.500">Messages</Text>
          </CardBody>
        </Card>
        <Card bg={cardBg}>
          <CardBody textAlign="center" py={4}>
            <Text fontSize="3xl" fontWeight="bold" color="green.600">{totalDonations}€</Text>
            <Text fontSize="sm" color="gray.500">Cagnotte</Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Taux de confirmation */}
      <Card mb={8}>
        <CardBody>
          <Flex justify="space-between" align="center" mb={3}>
            <Text fontWeight="medium">Taux de confirmation</Text>
            <Text fontWeight="bold" color="green.500">{confirmRate}%</Text>
          </Flex>
          <Progress value={confirmRate} colorScheme="green" borderRadius="full" size="lg" />
          <HStack justify="space-between" mt={2} fontSize="sm" color="gray.500">
            <Text>{confirmedCount} confirmés</Text>
            <Text>{totalGuests} invités au total</Text>
          </HStack>
        </CardBody>
      </Card>

      {/* Tabs avec contenu */}
      <Tabs colorScheme="purple" variant="enclosed">
        <TabList>
          <Tab><Icon as={FiUsers} mr={2} /> Invités ({totalGuests})</Tab>
          <Tab><Icon as={FiImage} mr={2} /> Photos ({photos.length})</Tab>
          <Tab><Icon as={FiMessageSquare} mr={2} /> Livre d'or ({guestbook.length})</Tab>
          <Tab><Icon as={FiDollarSign} mr={2} /> Cagnotte ({donations.length})</Tab>
          <Tab><Icon as={FiBell} mr={2} /> Notifications ({notifications.length})</Tab>
        </TabList>

        <TabPanels>
          {/* Invités */}
          <TabPanel px={0}>
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">Liste des invités</Heading>
                  <Link href={`/events/${id}/guests`}>
                    <Button size="sm" colorScheme="purple">Gérer les invités</Button>
                  </Link>
                </Flex>
              </CardHeader>
              <CardBody pt={0}>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Nom</Th>
                      <Th>Email</Th>
                      <Th>Statut</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {guests.slice(0, 10).map((guest) => {
                      const status = rsvpStatusConfig[guest.rsvp_status] || rsvpStatusConfig.pending;
                      return (
                        <Tr key={guest.id}>
                          <Td>
                            <HStack>
                              <Avatar size="xs" name={`${guest.first_name} ${guest.last_name}`} />
                              <Text>{guest.first_name} {guest.last_name}</Text>
                            </HStack>
                          </Td>
                          <Td color="gray.500">{guest.email || '-'}</Td>
                          <Td>
                            <Badge colorScheme={status.color}>
                              <HStack spacing={1}>
                                <Icon as={status.icon} boxSize={3} />
                                <Text>{status.label}</Text>
                              </HStack>
                            </Badge>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
                {guests.length > 10 && (
                  <Box textAlign="center" mt={4}>
                    <Link href={`/events/${id}/guests`}>
                      <Button variant="link" colorScheme="purple">
                        Voir tous les {guests.length} invités →
                      </Button>
                    </Link>
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Photos */}
          <TabPanel px={0}>
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Heading size="md">Galerie photo</Heading>
                    <Text fontSize="sm" color="gray.500">
                      {approvedPhotos} approuvées, {pendingPhotos} en attente
                    </Text>
                  </Box>
                  <Link href={`/events/${id}/photos`}>
                    <Button size="sm" colorScheme="purple">Gérer les photos</Button>
                  </Link>
                </Flex>
              </CardHeader>
              <CardBody pt={0}>
                <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={3}>
                  {photos.slice(0, 12).map((photo) => (
                    <Box
                      key={photo.id}
                      aspectRatio={1}
                      bg="gray.100"
                      borderRadius="md"
                      overflow="hidden"
                      position="relative"
                    >
                      <Box
                        as="img"
                        src={photo.url}
                        alt=""
                        objectFit="cover"
                        w="100%"
                        h="100%"
                      />
                      {photo.status === 'pending' && (
                        <Badge position="absolute" top={1} right={1} colorScheme="orange" fontSize="xs">
                          En attente
                        </Badge>
                      )}
                    </Box>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Livre d'or */}
          <TabPanel px={0}>
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Heading size="md">Messages du livre d'or</Heading>
                    <Text fontSize="sm" color="gray.500">
                      {approvedMessages} approuvés, {pendingMessages} en attente
                    </Text>
                  </Box>
                  <Link href={`/events/${id}/guestbook`}>
                    <Button size="sm" colorScheme="purple">Gérer le livre d'or</Button>
                  </Link>
                </Flex>
              </CardHeader>
              <CardBody pt={0}>
                <VStack spacing={3} align="stretch">
                  {guestbook.slice(0, 5).map((entry) => (
                    <Card key={entry.id} variant="outline">
                      <CardBody py={3}>
                        <Flex justify="space-between" align="start">
                          <Box flex={1}>
                            <Text fontWeight="medium">{entry.author_name}</Text>
                            <Text color="gray.600" fontSize="sm" noOfLines={2}>
                              "{entry.message}"
                            </Text>
                          </Box>
                          <Badge colorScheme={entry.status === 'approved' ? 'green' : 'orange'}>
                            {entry.status === 'approved' ? 'Approuvé' : 'En attente'}
                          </Badge>
                        </Flex>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Cagnotte */}
          <TabPanel px={0}>
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Heading size="md">Cagnotte</Heading>
                    <Text fontSize="sm" color="gray.500">
                      {donations.length} contributions
                    </Text>
                  </Box>
                  <Link href={`/events/${id}/donations`}>
                    <Button size="sm" colorScheme="purple">Gérer la cagnotte</Button>
                  </Link>
                </Flex>
              </CardHeader>
              <CardBody pt={0}>
                <Box textAlign="center" py={6} mb={4} bg="green.50" borderRadius="lg">
                  <Text fontSize="4xl" fontWeight="bold" color="green.600">
                    {totalDonations}€
                  </Text>
                  <Text color="gray.600">Total collecté</Text>
                </Box>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Donateur</Th>
                      <Th isNumeric>Montant</Th>
                      <Th>Date</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {donations.slice(0, 5).map((donation) => (
                      <Tr key={donation.id}>
                        <Td>{donation.donor_name}</Td>
                        <Td isNumeric fontWeight="medium">{donation.amount}€</Td>
                        <Td color="gray.500" suppressHydrationWarning>
                          {new Date(donation.created_at).toLocaleDateString('fr-FR')}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Notifications */}
          <TabPanel px={0}>
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Heading size="md">Notifications envoyées</Heading>
                    <Text fontSize="sm" color="gray.500">
                      {sentNotifications} envoyées
                    </Text>
                  </Box>
                  <Link href={`/events/${id}/notifications`}>
                    <Button size="sm" colorScheme="purple">Envoyer une notification</Button>
                  </Link>
                </Flex>
              </CardHeader>
              <CardBody pt={0}>
                <VStack spacing={3} align="stretch">
                  {notifications.length === 0 ? (
                    <Box textAlign="center" py={8} color="gray.500">
                      Aucune notification envoyée
                    </Box>
                  ) : (
                    notifications.slice(0, 5).map((notif) => (
                      <Card key={notif.id} variant="outline">
                        <CardBody py={3}>
                          <Flex justify="space-between" align="center">
                            <HStack>
                              <Icon as={FiBell} color="purple.500" />
                              <Text fontWeight="medium">{notif.title}</Text>
                            </HStack>
                            <HStack>
                              <Badge colorScheme={notif.status === 'sent' ? 'green' : 'blue'}>
                                {notif.status === 'sent' ? 'Envoyée' : 'Programmée'}
                              </Badge>
                              {notif.sent_at && (
                                <Text fontSize="xs" color="gray.500" suppressHydrationWarning>
                                  {new Date(notif.sent_at).toLocaleDateString('fr-FR')}
                                </Text>
                              )}
                            </HStack>
                          </Flex>
                        </CardBody>
                      </Card>
                    ))
                  )}
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Actions rapides */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mt={8}>
        <Link href={`/events/${id}/sub-events`}>
          <Card cursor="pointer" _hover={{ shadow: 'md' }} transition="all 0.2s">
            <CardBody textAlign="center" py={6}>
              <Icon as={FiCalendar} boxSize={8} color="blue.500" mb={2} />
              <Text fontWeight="medium">Sous-événements</Text>
            </CardBody>
          </Card>
        </Link>
        <Link href={`/events/${id}/groups`}>
          <Card cursor="pointer" _hover={{ shadow: 'md' }} transition="all 0.2s">
            <CardBody textAlign="center" py={6}>
              <Icon as={FiUsers} boxSize={8} color="purple.500" mb={2} />
              <Text fontWeight="medium">Groupes</Text>
            </CardBody>
          </Card>
        </Link>
        <Link href={`/events/${id}/build`}>
          <Card cursor="pointer" _hover={{ shadow: 'md' }} transition="all 0.2s">
            <CardBody textAlign="center" py={6}>
              <Icon as={FiSmartphone} boxSize={8} color="green.500" mb={2} />
              <Text fontWeight="medium">Générer l'app</Text>
            </CardBody>
          </Card>
        </Link>
        <Link href={`/events/${id}/edit`}>
          <Card cursor="pointer" _hover={{ shadow: 'md' }} transition="all 0.2s">
            <CardBody textAlign="center" py={6}>
              <Icon as={FiSettings} boxSize={8} color="gray.500" mb={2} />
              <Text fontWeight="medium">Paramètres</Text>
            </CardBody>
          </Card>
        </Link>
      </SimpleGrid>
    </Layout>
  );
}
