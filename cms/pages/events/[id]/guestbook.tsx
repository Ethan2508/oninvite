/**
 * Page du livre d'or
 */
import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  Button,
  Flex,
  Badge,
  SimpleGrid,
  HStack,
  VStack,
  IconButton,
  Avatar,
  useToast,
  Select,
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { FiCheck, FiX, FiTrash2 } from 'react-icons/fi';

// Données de démo
const mockEntries = [
  { id: '1', authorName: 'Jean Dupont', message: 'Tous nos vœux de bonheur pour cette nouvelle aventure ! Profitez de chaque instant ensemble.', photoUrl: null, approved: true, createdAt: '2026-02-10T14:30:00' },
  { id: '2', authorName: 'Sophie Martin', message: 'Quelle magnifique cérémonie ! On a adoré chaque moment. Mazal Tov !', photoUrl: 'https://picsum.photos/seed/g1/100/100', approved: true, createdAt: '2026-02-10T15:45:00' },
  { id: '3', authorName: 'Pierre Bernard', message: 'Merci pour cette soirée inoubliable ! La fête était incroyable.', photoUrl: null, approved: false, createdAt: '2026-02-11T10:20:00' },
  { id: '4', authorName: 'Claire Leroy', message: 'Vous êtes tellement beaux ensemble ! On vous souhaite tout le bonheur du monde.', photoUrl: 'https://picsum.photos/seed/g2/100/100', approved: true, createdAt: '2026-02-11T11:00:00' },
  { id: '5', authorName: 'Marc Cohen', message: 'Une journée magique du début à la fin. Merci de nous avoir inclus dans ce moment si spécial.', photoUrl: null, approved: false, createdAt: '2026-02-12T09:15:00' },
];

export default function GuestbookPage() {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  
  const [entries, setEntries] = useState(mockEntries);
  const [filter, setFilter] = useState('all');

  const filteredEntries = entries.filter((entry) => {
    if (filter === 'approved') return entry.approved;
    if (filter === 'pending') return !entry.approved;
    return true;
  });

  const handleApprove = (entryId: string) => {
    setEntries(entries.map(e => e.id === entryId ? { ...e, approved: true } : e));
    toast({ title: 'Message approuvé', status: 'success', duration: 2000 });
  };

  const handleReject = (entryId: string) => {
    setEntries(entries.map(e => e.id === entryId ? { ...e, approved: false } : e));
    toast({ title: 'Message rejeté', status: 'info', duration: 2000 });
  };

  const handleDelete = (entryId: string) => {
    setEntries(entries.filter(e => e.id !== entryId));
    toast({ title: 'Message supprimé', status: 'info', duration: 2000 });
  };

  return (
    <Layout>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">Livre d'or</Heading>
          <Text color="gray.600">
            <Link href={`/events/${id}`}>
              <Text as="span" color="blue.600" cursor="pointer">← Retour à l'événement</Text>
            </Link>
            {' • '}{entries.length} messages ({entries.filter(e => !e.approved).length} en attente)
          </Text>
        </Box>
      </Flex>

      {/* Filtre */}
      <Card mb={6}>
        <CardBody>
          <Flex gap={4} align="center">
            <Text fontWeight="medium">Filtrer :</Text>
            <Select w="200px" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Tous les messages</option>
              <option value="approved">Approuvés</option>
              <option value="pending">En attente</option>
            </Select>
            <Text color="gray.600">{filteredEntries.length} messages</Text>
          </Flex>
        </CardBody>
      </Card>

      {/* Liste des messages */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {filteredEntries.map((entry) => (
          <Card key={entry.id} variant={entry.approved ? 'outline' : 'filled'}>
            <CardBody>
              <Flex justify="space-between" align="flex-start">
                <HStack align="flex-start" spacing={3}>
                  <Avatar
                    size="sm"
                    name={entry.authorName}
                    src={entry.photoUrl || undefined}
                  />
                  <VStack align="start" spacing={1}>
                    <HStack>
                      <Text fontWeight="medium">{entry.authorName}</Text>
                      {!entry.approved && (
                        <Badge colorScheme="orange">En attente</Badge>
                      )}
                    </HStack>
                    <Text fontSize="sm" color="gray.500">
                      {new Date(entry.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </VStack>
                </HStack>
                <HStack spacing={1}>
                  {!entry.approved && (
                    <IconButton
                      aria-label="Approuver"
                      icon={<FiCheck />}
                      size="sm"
                      colorScheme="green"
                      variant="ghost"
                      onClick={() => handleApprove(entry.id)}
                    />
                  )}
                  {entry.approved && (
                    <IconButton
                      aria-label="Rejeter"
                      icon={<FiX />}
                      size="sm"
                      colorScheme="orange"
                      variant="ghost"
                      onClick={() => handleReject(entry.id)}
                    />
                  )}
                  <IconButton
                    aria-label="Supprimer"
                    icon={<FiTrash2 />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDelete(entry.id)}
                  />
                </HStack>
              </Flex>
              <Text mt={3} fontSize="sm">
                {entry.message}
              </Text>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {filteredEntries.length === 0 && (
        <Card>
          <CardBody textAlign="center" py={10}>
            <Text color="gray.500">Aucun message pour le moment</Text>
          </CardBody>
        </Card>
      )}
    </Layout>
  );
}
