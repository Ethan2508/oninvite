/**
 * Page de gestion des donations
 */
import { useRouter } from 'next/router';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Progress,
  VStack,
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { FiDownload, FiDollarSign } from 'react-icons/fi';

// Données de démo
const mockDonations = [
  { id: '1', donorName: 'Jean Dupont', amount: 100, message: 'Tous nos vœux de bonheur !', anonymous: false, createdAt: '2026-02-10T14:30:00', status: 'completed' },
  { id: '2', donorName: 'Sophie Martin', amount: 50, message: '', anonymous: false, createdAt: '2026-02-10T15:45:00', status: 'completed' },
  { id: '3', donorName: 'Anonyme', amount: 200, message: 'Avec toute notre affection', anonymous: true, createdAt: '2026-02-11T10:20:00', status: 'completed' },
  { id: '4', donorName: 'Claire Leroy', amount: 75, message: '', anonymous: false, createdAt: '2026-02-11T11:00:00', status: 'completed' },
  { id: '5', donorName: 'Marc Cohen', amount: 150, message: 'Mazal Tov !', anonymous: false, createdAt: '2026-02-12T09:15:00', status: 'completed' },
  { id: '6', donorName: 'Rachel Cohen', amount: 100, message: '', anonymous: false, createdAt: '2026-02-12T09:30:00', status: 'pending' },
];

const goalAmount = 5000;

export default function DonationsPage() {
  const router = useRouter();
  const { id } = router.query;

  const totalCollected = mockDonations
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);
  
  const progress = Math.min((totalCollected / goalAmount) * 100, 100);
  const donorsCount = mockDonations.filter(d => d.status === 'completed').length;
  const avgDonation = donorsCount > 0 ? Math.round(totalCollected / donorsCount) : 0;

  return (
    <Layout>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">Cagnotte</Heading>
          <Text color="gray.600">
            <Link href={`/events/${id}`}>
              <Text as="span" color="blue.600" cursor="pointer">← Retour à l'événement</Text>
            </Link>
          </Text>
        </Box>
        <Button leftIcon={<FiDownload />} variant="outline">
          Export CSV
        </Button>
      </Flex>

      {/* Stats */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total collecté</StatLabel>
              <StatNumber color="green.500">{totalCollected}€</StatNumber>
              <StatHelpText>Objectif : {goalAmount}€</StatHelpText>
              <Progress value={progress} colorScheme="green" size="sm" mt={2} borderRadius="full" />
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Contributeurs</StatLabel>
              <StatNumber>{donorsCount}</StatNumber>
              <StatHelpText>personnes ont participé</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Don moyen</StatLabel>
              <StatNumber>{avgDonation}€</StatNumber>
              <StatHelpText>par contributeur</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Progression visuelle */}
      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Progression</Heading>
        </CardHeader>
        <CardBody pt={0}>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Flex justify="space-between" mb={2}>
                <Text fontWeight="medium">{totalCollected}€ collectés</Text>
                <Text color="gray.600">{Math.round(progress)}%</Text>
              </Flex>
              <Progress value={progress} colorScheme="green" size="lg" borderRadius="full" />
            </Box>
            <Text color="gray.600" textAlign="center">
              {totalCollected >= goalAmount 
                ? '🎉 Objectif atteint !' 
                : `Plus que ${goalAmount - totalCollected}€ pour atteindre l'objectif`}
            </Text>
          </VStack>
        </CardBody>
      </Card>

      {/* Liste des dons */}
      <Card>
        <CardHeader>
          <Heading size="md">Historique des dons</Heading>
        </CardHeader>
        <CardBody pt={0}>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Donateur</Th>
                <Th>Montant</Th>
                <Th>Message</Th>
                <Th>Date</Th>
                <Th>Statut</Th>
              </Tr>
            </Thead>
            <Tbody>
              {mockDonations.map((donation) => (
                <Tr key={donation.id}>
                  <Td>
                    <HStack>
                      <Text fontWeight="medium">
                        {donation.anonymous ? 'Anonyme' : donation.donorName}
                      </Text>
                      {donation.anonymous && (
                        <Badge colorScheme="gray" fontSize="xs">Anonyme</Badge>
                      )}
                    </HStack>
                  </Td>
                  <Td>
                    <Text fontWeight="bold" color="green.600">{donation.amount}€</Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" color="gray.600" maxW="300px" isTruncated>
                      {donation.message || '-'}
                    </Text>
                  </Td>
                  <Td>
                    {new Date(donation.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Td>
                  <Td>
                    <Badge colorScheme={donation.status === 'completed' ? 'green' : 'orange'}>
                      {donation.status === 'completed' ? 'Reçu' : 'En attente'}
                    </Badge>
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
