/**
 * Vue détaillée d'un événement
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
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  HStack,
  VStack,
  Divider,
  Icon,
  Link as ChakraLink,
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import {
  FiEdit,
  FiEye,
  FiUsers,
  FiImage,
  FiMessageSquare,
  FiDollarSign,
  FiBell,
  FiSettings,
  FiExternalLink,
} from 'react-icons/fi';

// Données de démo
const mockEvent = {
  id: '1',
  title: 'Sarah & David',
  subtitle: 'Nous nous marions !',
  type: 'wedding',
  date: '2026-06-15T17:00:00',
  end_date: '2026-06-16T03:00:00',
  status: 'live',
  pack: 'premium',
  createdAt: '2026-01-10',
  stats: {
    rsvps: { confirmed: 142, pending: 23, declined: 8 },
    photos: 56,
    guestbookEntries: 28,
    donations: { count: 45, total: 3250 },
  },
  branding: {
    colors: {
      primary: '#D4AF37',
      secondary: '#1A1A2E',
    },
  },
};

const statusColors: Record<string, string> = {
  draft: 'gray',
  pending_review: 'orange',
  live: 'green',
  souvenir: 'blue',
  expired: 'red',
};

interface QuickLinkProps {
  icon: any;
  label: string;
  href: string;
  count?: number;
}

function QuickLink({ icon, label, href, count }: QuickLinkProps) {
  return (
    <Link href={href} passHref legacyBehavior>
      <ChakraLink
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={4}
        borderRadius="md"
        border="1px"
        borderColor="gray.200"
        _hover={{ bg: 'gray.50', borderColor: 'blue.300' }}
        transition="all 0.2s"
      >
        <HStack>
          <Icon as={icon} boxSize={5} color="blue.500" />
          <Text fontWeight="medium">{label}</Text>
        </HStack>
        {count !== undefined && (
          <Badge colorScheme="blue">{count}</Badge>
        )}
      </ChakraLink>
    </Link>
  );
}

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout>
      <Flex justify="space-between" align="flex-start" mb={8}>
        <Box>
          <HStack mb={2}>
            <Heading size="lg">{mockEvent.title}</Heading>
            <Badge colorScheme={statusColors[mockEvent.status]} fontSize="md" px={3}>
              {mockEvent.status}
            </Badge>
          </HStack>
          <Text color="gray.600">{mockEvent.subtitle}</Text>
          <Text color="gray.500" fontSize="sm" mt={1}>
            {new Date(mockEvent.date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </Box>
        <HStack spacing={4}>
          <Link href={`/events/${id}/preview`}>
            <Button leftIcon={<FiEye />} variant="outline">
              Preview
            </Button>
          </Link>
          <Link href={`/events/${id}/edit`}>
            <Button leftIcon={<FiEdit />} colorScheme="blue">
              Modifier
            </Button>
          </Link>
        </HStack>
      </Flex>

      {/* Stats */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>RSVPs confirmés</StatLabel>
              <StatNumber color="green.500">
                {mockEvent.stats.rsvps.confirmed}
              </StatNumber>
              <StatHelpText>
                {mockEvent.stats.rsvps.pending} en attente
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Photos</StatLabel>
              <StatNumber>{mockEvent.stats.photos}</StatNumber>
              <StatHelpText>uploadées par les invités</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Livre d'or</StatLabel>
              <StatNumber>{mockEvent.stats.guestbookEntries}</StatNumber>
              <StatHelpText>messages laissés</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Cagnotte</StatLabel>
              <StatNumber color="green.500">
                {mockEvent.stats.donations.total}€
              </StatNumber>
              <StatHelpText>
                {mockEvent.stats.donations.count} contributeurs
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Accès rapides */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Card>
          <CardHeader>
            <Heading size="md">Gestion</Heading>
          </CardHeader>
          <CardBody pt={0}>
            <VStack spacing={3} align="stretch">
              <QuickLink
                icon={FiUsers}
                label="RSVPs / Invités"
                href={`/events/${id}/guests`}
                count={mockEvent.stats.rsvps.confirmed + mockEvent.stats.rsvps.pending}
              />
              <QuickLink
                icon={FiImage}
                label="Galerie photo"
                href={`/events/${id}/photos`}
                count={mockEvent.stats.photos}
              />
              <QuickLink
                icon={FiMessageSquare}
                label="Livre d'or"
                href={`/events/${id}/guestbook`}
                count={mockEvent.stats.guestbookEntries}
              />
              <QuickLink
                icon={FiDollarSign}
                label="Cagnotte"
                href={`/events/${id}/donations`}
                count={mockEvent.stats.donations.count}
              />
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Actions</Heading>
          </CardHeader>
          <CardBody pt={0}>
            <VStack spacing={3} align="stretch">
              <QuickLink
                icon={FiBell}
                label="Envoyer une notification"
                href={`/events/${id}/notifications`}
              />
              <QuickLink
                icon={FiSettings}
                label="Lancer un build"
                href={`/events/${id}/build`}
              />
              <QuickLink
                icon={FiEye}
                label="Preview mobile"
                href={`/events/${id}/preview`}
              />
              <QuickLink
                icon={FiExternalLink}
                label="Voir sur App Store"
                href="#"
              />
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Couleurs */}
      <Card mt={6}>
        <CardHeader>
          <Heading size="md">Identité visuelle</Heading>
        </CardHeader>
        <CardBody pt={0}>
          <HStack spacing={4}>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Primaire</Text>
              <Box
                w="60px"
                h="40px"
                borderRadius="md"
                bg={mockEvent.branding.colors.primary}
                border="1px solid"
                borderColor="gray.200"
              />
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600" mb={1}>Secondaire</Text>
              <Box
                w="60px"
                h="40px"
                borderRadius="md"
                bg={mockEvent.branding.colors.secondary}
                border="1px solid"
                borderColor="gray.200"
              />
            </Box>
          </HStack>
        </CardBody>
      </Card>
    </Layout>
  );
}
