/**
 * Page globale - Livre d'or
 */
import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  Spinner,
  Avatar,
  VStack,
  Badge,
} from '@chakra-ui/react';
import Layout from '../components/Layout';

interface GuestbookEntry {
  id: string;
  author_name: string;
  message: string;
  approved: boolean;
  created_at: string;
  event_title: string;
  event_id: string;
}

export default function GuestbookPage() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const eventsRes = await fetch('/api/events');
        if (!eventsRes.ok) throw new Error('Failed');
        const events = await eventsRes.json();

        const allEntries: GuestbookEntry[] = [];
        for (const event of events.slice(0, 10)) {
          try {
            const res = await fetch(`/api/events/${event.id}/guestbook`);
            if (res.ok) {
              const eventEntries = await res.json();
              eventEntries.forEach((e: any) => {
                allEntries.push({
                  ...e,
                  event_title: event.title,
                  event_id: event.id,
                });
              });
            }
          } catch (err) {
            console.error(err);
          }
        }
        setEntries(allEntries);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <Layout>
      <Box mb={8}>
        <Heading size="lg">Livre d'or</Heading>
        <Text color="gray.600">Tous les messages de tous les événements ({entries.length})</Text>
      </Box>

      {loading ? (
        <Card>
          <CardBody textAlign="center" py={12}>
            <Spinner size="xl" color="purple.500" />
          </CardBody>
        </Card>
      ) : entries.length === 0 ? (
        <Card>
          <CardBody textAlign="center" py={12}>
            <Text color="gray.500">Aucun message pour le moment</Text>
          </CardBody>
        </Card>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardBody>
                <VStack align="start" spacing={3}>
                  <Box display="flex" alignItems="center" gap={3}>
                    <Avatar name={entry.author_name} size="sm" />
                    <Box>
                      <Text fontWeight="bold">{entry.author_name}</Text>
                      <Text fontSize="xs" color="gray.500">{entry.event_title}</Text>
                    </Box>
                  </Box>
                  <Text fontSize="sm" color="gray.700">{entry.message}</Text>
                  <Badge colorScheme={entry.approved ? 'green' : 'orange'}>
                    {entry.approved ? 'Approuvé' : 'En attente'}
                  </Badge>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Layout>
  );
}
