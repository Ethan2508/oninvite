/**
 * Page globale - Cagnotte / Donations
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

interface Donation {
  id: string;
  donor_name?: string;
  amount: number;
  currency: string;
  message?: string;
  status: string;
  anonymous: boolean;
  created_at: string;
  event_title: string;
  event_id: string;
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const eventsRes = await fetch('/api/events');
        if (!eventsRes.ok) throw new Error('Failed');
        const events = await eventsRes.json();

        const allDonations: Donation[] = [];
        for (const event of events.slice(0, 10)) {
          try {
            const res = await fetch(`/api/events/${event.id}/donations`);
            if (res.ok) {
              const eventDonations = await res.json();
              eventDonations.forEach((d: any) => {
                allDonations.push({
                  ...d,
                  event_title: event.title,
                  event_id: event.id,
                });
              });
            }
          } catch (err) {
            console.error(err);
          }
        }
        setDonations(allDonations);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const totalAmount = donations.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.amount, 0);

  return (
    <Layout>
      <Box mb={8}>
        <Heading size="lg">Cagnotte</Heading>
        <Text color="gray.600">Tous les dons de tous les événements</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total collecté</StatLabel>
              <StatNumber color="green.500">{totalAmount.toLocaleString('fr-FR')} €</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Nombre de dons</StatLabel>
              <StatNumber>{donations.length}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Don moyen</StatLabel>
              <StatNumber>{donations.length > 0 ? Math.round(totalAmount / donations.length) : 0} €</StatNumber>
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
                  <Th>Donateur</Th>
                  <Th>Montant</Th>
                  <Th>Événement</Th>
                  <Th>Statut</Th>
                  <Th>Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {donations.length === 0 ? (
                  <Tr>
                    <Td colSpan={5} textAlign="center" py={8} color="gray.500">
                      Aucun don pour le moment
                    </Td>
                  </Tr>
                ) : (
                  donations.map((donation) => (
                    <Tr key={donation.id}>
                      <Td>{donation.anonymous ? 'Anonyme' : donation.donor_name || '-'}</Td>
                      <Td fontWeight="bold">{donation.amount} {donation.currency}</Td>
                      <Td>
                        <Link href={`/events/${donation.event_id}/donations`}>
                          <Text color="blue.600" cursor="pointer">{donation.event_title}</Text>
                        </Link>
                      </Td>
                      <Td>
                        <Badge colorScheme={donation.status === 'completed' ? 'green' : 'orange'}>
                          {donation.status === 'completed' ? 'Reçu' : 'En attente'}
                        </Badge>
                      </Td>
                      <Td>{new Date(donation.created_at).toLocaleDateString('fr-FR')}</Td>
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
