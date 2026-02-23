/**
 * Liste des événements
 */
import {
  Box,
  Heading,
  Text,
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
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { FiSearch, FiMoreVertical, FiEdit, FiEye, FiTrash2, FiCopy } from 'react-icons/fi';
import { useState, useEffect } from 'react';

interface Event {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  type: string;
  status: string;
  pack?: string;
  mainDate?: string;
  createdAt: string;
  guestCount?: number;
}

const statusColors: Record<string, string> = {
  draft: 'gray',
  pending_review: 'orange',
  live: 'green',
  souvenir: 'blue',
  expired: 'red',
};

const statusLabels: Record<string, string> = {
  draft: 'Brouillon',
  pending_review: 'En review',
  live: 'En ligne',
  souvenir: 'Souvenir',
  expired: 'Expiré',
};

const typeLabels: Record<string, string> = {
  wedding: 'Mariage',
  bar_mitzvah: 'Bar Mitzvah',
  bat_mitzvah: 'Bat Mitzvah',
  birthday: 'Anniversaire',
  corporate: 'Corporate',
};

export default function EventsListPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/events');
        if (!res.ok) throw new Error('Erreur lors du chargement des événements');
        const data = await res.json();
        setEvents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Layout>
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="brand.500" />
        </Flex>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          {error}
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">Événements</Heading>
          <Text color="gray.600">{events.length} événement{events.length > 1 ? 's' : ''} au total</Text>
        </Box>
        <Link href="/events/new">
          <Button colorScheme="blue">+ Nouvel événement</Button>
        </Link>
      </Flex>

      {/* Filtres */}
      <Card mb={6}>
        <CardBody>
          <Flex gap={4}>
            <InputGroup flex={1}>
              <InputLeftElement>
                <FiSearch color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Rechercher un événement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            <Select
              w="200px"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="pending_review">En review</option>
              <option value="live">En ligne</option>
              <option value="souvenir">Souvenir</option>
              <option value="expired">Expiré</option>
            </Select>
          </Flex>
        </CardBody>
      </Card>

      {/* Liste */}
      <Card>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Événement</Th>
                <Th>Type</Th>
                <Th>Date</Th>
                <Th>Statut</Th>
                <Th>RSVPs</Th>
                <Th>Pack</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredEvents.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8}>
                    <Text color="gray.500">Aucun événement trouvé</Text>
                  </Td>
                </Tr>
              ) : (
                filteredEvents.map((event) => (
                <Tr key={event.id} _hover={{ bg: 'gray.50' }}>
                  <Td>
                    <Link href={`/events/${event.id}`}>
                      <Text fontWeight="medium" color="blue.600" cursor="pointer" _hover={{ textDecoration: 'underline' }}>
                        {event.title}
                      </Text>
                    </Link>
                  </Td>
                  <Td>{typeLabels[event.type] || event.type}</Td>
                  <Td>{event.mainDate ? new Date(event.mainDate).toLocaleDateString('fr-FR') : '-'}</Td>
                  <Td>
                    <Badge colorScheme={statusColors[event.status] || 'gray'}>
                      {statusLabels[event.status] || event.status}
                    </Badge>
                  </Td>
                  <Td>{event.guestCount ?? 0}</Td>
                  <Td>
                    <Badge colorScheme="purple">{event.pack || 'standard'}</Badge>
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <Link href={`/events/${event.id}`}>
                          <MenuItem icon={<FiEye />}>Voir</MenuItem>
                        </Link>
                        <Link href={`/events/${event.id}/edit`}>
                          <MenuItem icon={<FiEdit />}>Éditer</MenuItem>
                        </Link>
                        <MenuItem icon={<FiCopy />}>Dupliquer</MenuItem>
                        <MenuItem icon={<FiTrash2 />} color="red.500">
                          Supprimer
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))
              )}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Layout>
  );
}
