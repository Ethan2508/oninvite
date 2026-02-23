/**
 * Dashboard - Design professionnel
 */
import { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  SimpleGrid, 
  Card,
  CardBody,
  Button,
  Flex,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Icon,
  Avatar,
  VStack,
  Progress,
  useColorModeValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { 
  FiCalendar, 
  FiDollarSign, 
  FiUsers, 
  FiPlus,
  FiMoreVertical,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiMessageSquare,
  FiArrowUpRight,
  FiArrowDownRight,
  FiRefreshCw,
} from 'react-icons/fi';

// Types
interface EventRSVPs {
  confirmed: number;
  pending: number;
  declined: number;
}

interface EventData {
  id: string;
  title: string;
  type: string;
  event_date: string;
  status: string;
  pack: string;
  rsvps?: EventRSVPs;
  image?: string | null;
}

interface DashboardStats {
  activeEvents: number;
  totalRevenue: number;
  totalRsvps: number;
  photosUploaded: number;
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  draft: { color: 'gray.600', bg: 'gray.100', label: 'Brouillon' },
  pending_review: { color: 'orange.600', bg: 'orange.100', label: 'En attente' },
  live: { color: 'green.600', bg: 'green.100', label: 'En ligne' },
  souvenir: { color: 'blue.600', bg: 'blue.100', label: 'Souvenir' },
  expired: { color: 'red.600', bg: 'red.100', label: 'Expiré' },
};

const typeLabels: Record<string, string> = {
  wedding: 'Mariage',
  bar_mitzvah: 'Bar Mitzvah',
  bat_mitzvah: 'Bat Mitzvah',
  birthday: 'Anniversaire',
  corporate: 'Corporate',
};

const packColors: Record<string, string> = {
  essential: 'gray',
  premium: 'purple',
  vip: 'yellow',
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: any;
  change?: number;
  color: string;
}

function StatCard({ label, value, icon, change, color }: StatCardProps) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const isPositive = change && change > 0;

  return (
    <Card bg={cardBg} borderRadius="xl" boxShadow="sm" border="1px" borderColor="gray.100">
      <CardBody p={6}>
        <Flex justify="space-between" align="flex-start">
          <VStack align="flex-start" spacing={1}>
            <Text fontSize="sm" color="gray.500" fontWeight="500">
              {label}
            </Text>
            <Text fontSize="3xl" fontWeight="700" color="gray.900">
              {value}
            </Text>
            {change !== undefined && (
              <HStack spacing={1}>
                <Icon 
                  as={isPositive ? FiArrowUpRight : FiArrowDownRight} 
                  color={isPositive ? 'green.500' : 'red.500'}
                  boxSize={4}
                />
                <Text 
                  fontSize="sm" 
                  color={isPositive ? 'green.500' : 'red.500'}
                  fontWeight="600"
                >
                  {Math.abs(change)}%
                </Text>
                <Text fontSize="sm" color="gray.400">
                  ce mois
                </Text>
              </HStack>
            )}
          </VStack>
          <Box p={3} borderRadius="xl" bg={`${color}.50`}>
            <Icon as={icon} boxSize={6} color={`${color}.500`} />
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
}

interface EventRowProps {
  event: EventData;
}

function EventRow({ event }: EventRowProps) {
  const status = statusConfig[event.status] || statusConfig.draft;
  const rsvps = event.rsvps || { confirmed: 0, pending: 0, declined: 0 };
  const totalRsvps = rsvps.confirmed + rsvps.pending + rsvps.declined;
  const confirmRate = totalRsvps > 0 ? Math.round((rsvps.confirmed / totalRsvps) * 100) : 0;

  return (
    <Tr _hover={{ bg: 'gray.50' }} transition="all 0.15s">
      <Td py={4}>
        <HStack spacing={4}>
          <Avatar
            size="md"
            name={event.title}
            src={event.image || undefined}
            borderRadius="lg"
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
          <VStack align="flex-start" spacing={0}>
            <Text fontWeight="600" color="gray.900">{event.title}</Text>
            <Text fontSize="sm" color="gray.500">{typeLabels[event.type] || event.type}</Text>
          </VStack>
        </HStack>
      </Td>
      <Td>
        <HStack spacing={2}>
          <Icon as={FiCalendar} color="gray.400" boxSize={4} />
          <Text fontSize="sm" color="gray.600" suppressHydrationWarning>
            {new Date(event.event_date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </HStack>
      </Td>
      <Td>
        <Badge 
          px={3} 
          py={1} 
          borderRadius="full"
          bg={status.bg}
          color={status.color}
          fontWeight="600"
          fontSize="xs"
        >
          {status.label}
        </Badge>
      </Td>
      <Td>
        <Badge 
          variant="outline" 
          colorScheme={packColors[event.pack]}
          borderRadius="full"
          px={3}
          py={1}
          textTransform="capitalize"
          fontWeight="600"
          fontSize="xs"
        >
          {event.pack}
        </Badge>
      </Td>
      <Td>
        <VStack align="flex-start" spacing={1}>
          <HStack spacing={2}>
            <Text fontSize="sm" fontWeight="600" color="gray.900">
              {rsvps.confirmed}
            </Text>
            <Text fontSize="sm" color="gray.400">
              / {totalRsvps || '-'} confirmés
            </Text>
          </HStack>
          {totalRsvps > 0 && (
            <Progress 
              value={confirmRate} 
              size="xs" 
              colorScheme="green" 
              borderRadius="full"
              w="120px"
            />
          )}
        </VStack>
      </Td>
      <Td>
        <HStack spacing={1}>
          <Link href={`/events/${event.id}`}>
            <IconButton
              aria-label="Voir"
              icon={<FiEye />}
              size="sm"
              variant="ghost"
              borderRadius="lg"
            />
          </Link>
          <Link href={`/events/${event.id}/edit`}>
            <IconButton
              aria-label="Modifier"
              icon={<FiEdit2 />}
              size="sm"
              variant="ghost"
              borderRadius="lg"
            />
          </Link>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Plus"
              icon={<FiMoreVertical />}
              size="sm"
              variant="ghost"
              borderRadius="lg"
            />
            <MenuList borderRadius="xl" boxShadow="lg" py={2} minW="160px">
              <MenuItem fontSize="sm" icon={<FiUsers />}>Invités</MenuItem>
              <MenuItem fontSize="sm" icon={<FiImage />}>Photos</MenuItem>
              <MenuItem fontSize="sm" icon={<FiMessageSquare />}>Livre d'or</MenuItem>
              <MenuItem fontSize="sm" icon={<FiTrash2 />} color="red.500">
                Supprimer
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Td>
    </Tr>
  );
}

export default function Dashboard() {
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // State pour éviter les erreurs d'hydratation SSR
  const [mounted, setMounted] = useState(false);
  
  // State pour les données
  const [events, setEvents] = useState<EventData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    activeEvents: 0,
    totalRevenue: 0,
    totalRsvps: 0,
    photosUploaded: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Marquer comme monté côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Charger les données
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des événements');
      }
      const eventsData = await response.json();
      
      // Adapter les données au format attendu
      const formattedEvents: EventData[] = eventsData.map((e: any) => ({
        id: e.id,
        title: e.title,
        type: e.type,
        event_date: e.event_date,
        status: e.status,
        pack: e.pack,
        rsvps: { confirmed: 0, pending: 0, declined: 0 }, // TODO: charger les stats RSVP
        image: null,
      }));
      
      setEvents(formattedEvents);
      
      // Calculer les stats
      setStats({
        activeEvents: eventsData.filter((e: any) => e.status === 'live').length,
        totalRevenue: eventsData.length * 600, // Estimation
        totalRsvps: 0, // TODO: charger les vrais stats
        photosUploaded: 0,
      });
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Layout>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg" fontWeight="700" color="gray.900">
            Tableau de bord
          </Heading>
          <Text color="gray.500" mt={1}>
            Bienvenue ! Voici un aperçu de vos événements.
          </Text>
        </Box>
        <HStack spacing={3}>
          <IconButton
            aria-label="Rafraîchir"
            icon={<FiRefreshCw />}
            onClick={loadData}
            isLoading={loading}
            variant="ghost"
            borderRadius="lg"
          />
          <Link href="/events/new">
            <Button 
              leftIcon={<FiPlus />} 
              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              color="white"
              _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
              borderRadius="lg"
              fontWeight="600"
              transition="all 0.2s"
            >
              Nouvel événement
            </Button>
          </Link>
        </HStack>
      </Flex>

      {error && (
        <Alert status="error" mb={6} borderRadius="lg">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard 
          label="Événements actifs"
          value={stats.activeEvents}
          icon={FiCalendar}
          color="purple"
        />
        <StatCard 
          label="Chiffre d'affaires"
          value={mounted ? `${stats.totalRevenue.toLocaleString('fr-FR')} €` : '0 €'}
          icon={FiDollarSign}
          color="green"
        />
        <StatCard 
          label="RSVPs confirmés"
          value={stats.totalRsvps}
          icon={FiUsers}
          color="blue"
        />
        <StatCard 
          label="Photos uploadées"
          value={stats.photosUploaded}
          icon={FiImage}
          color="orange"
        />
      </SimpleGrid>

      <Card bg={cardBg} borderRadius="xl" boxShadow="sm" border="1px" borderColor="gray.100">
        <CardBody p={0}>
          <Flex justify="space-between" align="center" p={6} borderBottom="1px" borderColor="gray.100">
            <Box>
              <Heading size="md" fontWeight="600" color="gray.900">
                Événements récents
              </Heading>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Gérez vos événements en cours et à venir
              </Text>
            </Box>
            <Link href="/events">
              <Button variant="ghost" size="sm" rightIcon={<FiArrowUpRight />}>
                Voir tous
              </Button>
            </Link>
          </Flex>
          
          <Box overflowX="auto">
            <Table>
              <Thead bg="gray.50">
                <Tr>
                  <Th py={4} fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                    Événement
                  </Th>
                  <Th py={4} fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                    Date
                  </Th>
                  <Th py={4} fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                    Statut
                  </Th>
                  <Th py={4} fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                    Pack
                  </Th>
                  <Th py={4} fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                    RSVPs
                  </Th>
                  <Th py={4} fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={10}>
                      <Spinner size="lg" color="purple.500" />
                      <Text mt={4} color="gray.500">Chargement des événements...</Text>
                    </Td>
                  </Tr>
                ) : events.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={10}>
                      <Text color="gray.500">Aucun événement trouvé</Text>
                      <Link href="/events/new">
                        <Button mt={4} leftIcon={<FiPlus />} colorScheme="purple" size="sm">
                          Créer votre premier événement
                        </Button>
                      </Link>
                    </Td>
                  </Tr>
                ) : (
                  events.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>
    </Layout>
  );
}
