/**
 * Page globale - Notifications
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
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../components/Layout';

interface Notification {
  id: string;
  title: string;
  message: string;
  status: string;
  sent_at?: string;
  opened_count: number;
  event_title: string;
  event_id: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const eventsRes = await fetch('/api/events');
        if (!eventsRes.ok) throw new Error('Failed');
        const events = await eventsRes.json();

        const allNotifications: Notification[] = [];
        for (const event of events.slice(0, 10)) {
          try {
            const res = await fetch(`/api/events/${event.id}/notifications`);
            if (res.ok) {
              const eventNotifs = await res.json();
              eventNotifs.forEach((n: any) => {
                allNotifications.push({
                  ...n,
                  event_title: event.title,
                  event_id: event.id,
                });
              });
            }
          } catch (err) {
            console.error(err);
          }
        }
        setNotifications(allNotifications);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const sentCount = notifications.filter(n => n.status === 'sent').length;
  const scheduledCount = notifications.filter(n => n.status === 'scheduled').length;

  return (
    <Layout>
      <Box mb={8}>
        <Heading size="lg">Notifications</Heading>
        <Text color="gray.600">Toutes les notifications push envoyées</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Envoyées</StatLabel>
              <StatNumber color="green.500">{sentCount}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Programmées</StatLabel>
              <StatNumber color="blue.500">{scheduledCount}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total ouvertures</StatLabel>
              <StatNumber>{notifications.reduce((sum, n) => sum + n.opened_count, 0)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

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
                  <Th>Titre</Th>
                  <Th>Événement</Th>
                  <Th>Statut</Th>
                  <Th>Ouvertures</Th>
                  <Th>Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {notifications.length === 0 ? (
                  <Tr>
                    <Td colSpan={5} textAlign="center" py={8} color="gray.500">
                      Aucune notification envoyée
                    </Td>
                  </Tr>
                ) : (
                  notifications.map((notif) => (
                    <Tr key={notif.id}>
                      <Td fontWeight="medium">{notif.title}</Td>
                      <Td>
                        <Link href={`/events/${notif.event_id}/notifications`}>
                          <Text color="blue.600" cursor="pointer">{notif.event_title}</Text>
                        </Link>
                      </Td>
                      <Td>
                        <Badge colorScheme={
                          notif.status === 'sent' ? 'green' : 
                          notif.status === 'scheduled' ? 'blue' : 'gray'
                        }>
                          {notif.status === 'sent' ? 'Envoyée' : 
                           notif.status === 'scheduled' ? 'Programmée' : notif.status}
                        </Badge>
                      </Td>
                      <Td>{notif.opened_count}</Td>
                      <Td>{notif.sent_at ? new Date(notif.sent_at).toLocaleDateString('fr-FR') : '-'}</Td>
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
