/**
 * Page globale - Tous les RSVPs / Invités
 */
import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { FiSearch, FiCheck, FiX, FiClock } from 'react-icons/fi';

interface Guest {
  id: string;
  name: string;
  email?: string;
  status: string;
  event_title: string;
  event_id: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Confirmé', color: 'green' },
  pending: { label: 'En attente', color: 'orange' },
  declined: { label: 'Décliné', color: 'red' },
};

export default function RSVPsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger tous les événements puis leurs invités
        const eventsRes = await fetch('/api/events');
        if (!eventsRes.ok) throw new Error('Failed to load events');
        const events = await eventsRes.json();

        const allGuests: Guest[] = [];
        for (const event of events.slice(0, 10)) { // Limiter à 10 events
          try {
            const guestsRes = await fetch(`/api/events/${event.id}/guests`);
            if (guestsRes.ok) {
              const eventGuests = await guestsRes.json();
              eventGuests.forEach((g: any) => {
                allGuests.push({
                  ...g,
                  event_title: event.title,
                  event_id: event.id,
                });
              });
            }
          } catch (err) {
            console.error(`Error loading guests for ${event.id}:`, err);
          }
        }
        setGuests(allGuests);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (guest.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'all' || guest.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    confirmed: guests.filter(g => g.status === 'confirmed').length,
    pending: guests.filter(g => g.status === 'pending').length,
    declined: guests.filter(g => g.status === 'declined').length,
  };

  return (
    <Layout>
      <Box mb={8}>
        <Heading size="lg">Tous les RSVPs</Heading>
        <Text color="gray.600">Vue globale de tous les invités</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Confirmés</StatLabel>
              <StatNumber color="green.500">{stats.confirmed}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>En attente</StatLabel>
              <StatNumber color="orange.500">{stats.pending}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Déclinés</StatLabel>
              <StatNumber color="red.500">{stats.declined}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {loading ? (
        <Card>
          <CardBody textAlign="center" py={12}>
            <Spinner size="xl" color="purple.500" />
            <Text mt={4} color="gray.500">Chargement...</Text>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody>
            <HStack mb={4} spacing={4}>
              <InputGroup maxW="300px">
                <InputLeftElement><FiSearch color="gray" /></InputLeftElement>
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
              <Select maxW="200px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Tous les statuts</option>
                <option value="confirmed">Confirmés</option>
                <option value="pending">En attente</option>
                <option value="declined">Déclinés</option>
              </Select>
            </HStack>

            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Nom</Th>
                  <Th>Email</Th>
                  <Th>Événement</Th>
                  <Th>Statut</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredGuests.length === 0 ? (
                  <Tr>
                    <Td colSpan={4} textAlign="center" py={8} color="gray.500">
                      Aucun invité trouvé
                    </Td>
                  </Tr>
                ) : (
                  filteredGuests.map((guest) => (
                    <Tr key={guest.id}>
                      <Td fontWeight="medium">{guest.name}</Td>
                      <Td color="gray.600">{guest.email || '-'}</Td>
                      <Td>
                        <Link href={`/events/${guest.event_id}/guests`}>
                          <Text color="blue.600" cursor="pointer" _hover={{ textDecoration: 'underline' }}>
                            {guest.event_title}
                          </Text>
                        </Link>
                      </Td>
                      <Td>
                        <Badge colorScheme={statusConfig[guest.status]?.color || 'gray'}>
                          {statusConfig[guest.status]?.label || guest.status}
                        </Badge>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      )}
    </Layout>
  );
}
