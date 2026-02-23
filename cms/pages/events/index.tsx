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
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { FiSearch, FiMoreVertical, FiEdit, FiEye, FiTrash2, FiCopy } from 'react-icons/fi';
import { useState } from 'react';

// Données de démo
const mockEvents = [
  {
    id: '1',
    title: 'Sarah & David',
    type: 'wedding',
    date: '2026-06-15',
    status: 'live',
    pack: 'premium',
    rsvps: 142,
    createdAt: '2026-01-10',
  },
  {
    id: '2',
    title: 'Nathan - Bar Mitzvah',
    type: 'bar_mitzvah',
    date: '2026-07-20',
    status: 'pending_review',
    pack: 'essential',
    rsvps: 0,
    createdAt: '2026-02-05',
  },
  {
    id: '3',
    title: 'Emma & Thomas',
    type: 'wedding',
    date: '2026-09-05',
    status: 'draft',
    pack: 'vip',
    rsvps: 0,
    createdAt: '2026-02-15',
  },
];

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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">Événements</Heading>
          <Text color="gray.600">{mockEvents.length} événements au total</Text>
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
              {filteredEvents.map((event) => (
                <Tr key={event.id} _hover={{ bg: 'gray.50' }}>
                  <Td>
                    <Link href={`/events/${event.id}`}>
                      <Text fontWeight="medium" color="blue.600" cursor="pointer" _hover={{ textDecoration: 'underline' }}>
                        {event.title}
                      </Text>
                    </Link>
                  </Td>
                  <Td>{typeLabels[event.type] || event.type}</Td>
                  <Td>{new Date(event.date).toLocaleDateString('fr-FR')}</Td>
                  <Td>
                    <Badge colorScheme={statusColors[event.status]}>
                      {statusLabels[event.status] || event.status}
                    </Badge>
                  </Td>
                  <Td>{event.rsvps}</Td>
                  <Td>
                    <Badge colorScheme="purple">{event.pack}</Badge>
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
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Layout>
  );
}
