/**
 * Page globale - Clients
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
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Badge,
  Avatar,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import Layout from '../components/Layout';

interface Client {
  id: string;
  name: string;
  email: string;
  event_count: number;
  guest_count: number;
  last_event?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load events and extract unique clients (event owners)
        const eventsRes = await fetch('/api/events');
        if (!eventsRes.ok) throw new Error('Failed');
        const events = await eventsRes.json();

        // Group by client email (simulate - in real app, would have proper client model)
        const clientMap = new Map<string, Client>();
        
        for (const event of events) {
          const email = event.contact_email || 'unknown@email.com';
          if (clientMap.has(email)) {
            const existing = clientMap.get(email)!;
            existing.event_count++;
            existing.guest_count += event.guest_count || 0;
          } else {
            clientMap.set(email, {
              id: event.id,
              name: event.couple_names || email.split('@')[0],
              email,
              event_count: 1,
              guest_count: event.guest_count || 0,
              last_event: event.title,
            });
          }
        }
        
        setClients(Array.from(clientMap.values()));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <Box mb={8}>
        <Heading size="lg">Clients</Heading>
        <Text color="gray.600">Gestion des clients et propriétaires d'événements</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total clients</StatLabel>
              <StatNumber>{clients.length}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Événements</StatLabel>
              <StatNumber>{clients.reduce((sum, c) => sum + c.event_count, 0)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Invités totaux</StatLabel>
              <StatNumber>{clients.reduce((sum, c) => sum + c.guest_count, 0)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card mb={6}>
        <CardBody>
          <InputGroup>
            <InputLeftElement>
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </CardBody>
      </Card>

      {loading ? (
        <Card>
          <CardBody textAlign="center" py={12}>
            <Spinner size="xl" color="purple.500" />
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Client</Th>
                  <Th>Email</Th>
                  <Th>Événements</Th>
                  <Th>Invités</Th>
                  <Th>Dernier événement</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredClients.length === 0 ? (
                  <Tr>
                    <Td colSpan={5} textAlign="center" py={8} color="gray.500">
                      Aucun client trouvé
                    </Td>
                  </Tr>
                ) : (
                  filteredClients.map((client) => (
                    <Tr key={client.email}>
                      <Td>
                        <HStack>
                          <Avatar size="sm" name={client.name} />
                          <Text fontWeight="medium">{client.name}</Text>
                        </HStack>
                      </Td>
                      <Td>{client.email}</Td>
                      <Td>
                        <Badge colorScheme="purple">{client.event_count}</Badge>
                      </Td>
                      <Td>{client.guest_count}</Td>
                      <Td>
                        <Link href={`/events/${client.id}`}>
                          <Text color="blue.600" cursor="pointer">{client.last_event}</Text>
                        </Link>
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
