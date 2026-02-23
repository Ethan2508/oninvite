/**
 * Dashboard - Design professionnel
 */
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
} from 'react-icons/fi';

// Données de démo
const mockEvents = [
  {
    id: '1',
    title: 'Sarah & David',
    type: 'wedding',
    date: '2026-06-15',
    status: 'live',
    pack: 'premium',
    rsvps: { confirmed: 98, pending: 32, declined: 12 },
    image: null,
  },
  {
    id: '2',
    title: 'Nathan - Bar Mitzvah',
    type: 'bar_mitzvah',
    date: '2026-07-20',
    status: 'pending_review',
    pack: 'essential',
    rsvps: { confirmed: 0, pending: 0, declined: 0 },
    image: null,
  },
  {
    id: '3',
    title: 'Emma & Thomas',
    type: 'wedding',
    date: '2026-09-05',
    status: 'draft',
    pack: 'vip',
    rsvps: { confirmed: 0, pending: 0, declined: 0 },
    image: null,
  },
];

const mockStats = {
  activeEvents: 3,
  totalRevenue: 2480,
  totalRsvps: 142,
  photosUploaded: 347,
  monthlyGrowth: 15,
  revenueGrowth: 23,
};

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
  event: typeof mockEvents[0];
}

function EventRow({ event }: EventRowProps) {
  const status = statusConfig[event.status] || statusConfig.draft;
  const totalRsvps = event.rsvps.confirmed + event.rsvps.pending + event.rsvps.declined;
  const confirmRate = totalRsvps > 0 ? Math.round((event.rsvps.confirmed / totalRsvps) * 100) : 0;

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
          <Text fontSize="sm" color="gray.600">
            {new Date(event.date).toLocaleDateString('fr-FR', {
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
              {event.rsvps.confirmed}
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
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard 
          label="Événements actifs"
          value={mockStats.activeEvents}
          icon={FiCalendar}
          change={mockStats.monthlyGrowth}
          color="purple"
        />
        <StatCard 
          label="Chiffre d'affaires"
          value={`${mockStats.totalRevenue.toLocaleString('fr-FR')} €`}
          icon={FiDollarSign}
          change={mockStats.revenueGrowth}
          color="green"
        />
        <StatCard 
          label="RSVPs confirmés"
          value={mockStats.totalRsvps}
          icon={FiUsers}
          color="blue"
        />
        <StatCard 
          label="Photos uploadées"
          value={mockStats.photosUploaded}
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
                {mockEvents.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>
    </Layout>
  );
}
