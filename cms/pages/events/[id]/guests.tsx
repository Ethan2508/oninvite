/**
 * Page de gestion des RSVPs / Invités
 */
import { useState, useEffect } from 'react';
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
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  VStack,
  FormControl,
  FormLabel,
  Divider,
  Code,
  Tooltip,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { 
  FiSearch, 
  FiDownload, 
  FiMail, 
  FiMoreVertical, 
  FiCheck, 
  FiX, 
  FiClock,
  FiUpload,
  FiKey,
  FiCopy,
  FiFilter,
} from 'react-icons/fi';
import {
  getGuests,
  getInvitationGroups,
  getRSVPStats,
  updateGuestGroup,
  generateGuestCodes,
  Guest,
  InvitationGroup,
  RSVPStats,
} from '../../../services/api';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  confirmed: { label: 'Confirmé', color: 'green', icon: FiCheck },
  pending: { label: 'En attente', color: 'orange', icon: FiClock },
  declined: { label: 'Décliné', color: 'red', icon: FiX },
};

export default function GuestsPage() {
  const router = useRouter();
  const { id } = router.query;
  const eventId = id as string;
  const toast = useToast();
  const { isOpen: isImportOpen, onOpen: onImportOpen, onClose: onImportClose } = useDisclosure();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [groups, setGroups] = useState<InvitationGroup[]>([]);
  const [stats, setStats] = useState<RSVPStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingCodes, setGeneratingCodes] = useState(false);

  // Charger les données depuis l'API
  useEffect(() => {
    if (!eventId) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [guestsData, groupsData, statsData] = await Promise.all([
          getGuests(eventId),
          getInvitationGroups(eventId),
          getRSVPStats(eventId),
        ]);
        setGuests(guestsData);
        setGroups(groupsData);
        setStats(statsData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [eventId]);

  // Stats calculées
  const computedStats = {
    confirmed: stats?.confirmed || guests.filter(g => g.status === 'confirmed').length,
    pending: stats?.pending || guests.filter(g => g.status === 'pending').length,
    declined: stats?.declined || guests.filter(g => g.status === 'declined').length,
    totalPlusOnes: guests.reduce((sum, g) => sum + g.plus_ones, 0),
    withCode: guests.filter(g => g.personal_code).length,
  };

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (guest.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'all' || guest.status === statusFilter;
    const matchesGroup = groupFilter === 'all' || guest.invitation_group_id === groupFilter;
    return matchesSearch && matchesStatus && matchesGroup;
  });

  const getGroupInfo = (groupId: string | null | undefined) => {
    if (!groupId) return null;
    return groups.find(g => g.id === groupId);
  };

  const handleExportCSV = () => {
    toast({
      title: 'Export en cours',
      description: 'Le fichier CSV sera téléchargé dans quelques instants.',
      status: 'info',
      duration: 3000,
    });
  };

  const handleGenerateCodes = async () => {
    if (!eventId) return;
    
    const guestsWithoutCode = guests.filter(g => !g.personal_code);
    if (guestsWithoutCode.length === 0) {
      toast({
        title: 'Tous les invités ont déjà un code',
        status: 'info',
        duration: 3000,
      });
      return;
    }
    
    try {
      setGeneratingCodes(true);
      await generateGuestCodes(eventId);
      // Recharger les invités pour récupérer les nouveaux codes
      const updatedGuests = await getGuests(eventId);
      setGuests(updatedGuests);
      toast({
        title: `${guestsWithoutCode.length} codes générés`,
        description: 'Les codes personnels ont été créés pour les invités.',
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      console.error('Error generating codes:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer les codes',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setGeneratingCodes(false);
    }
  };

  const handleExportQRCodes = () => {
    toast({
      title: 'Export QR codes en cours',
      description: 'Un fichier ZIP sera téléchargé avec un QR code par invité.',
      status: 'info',
      duration: 3000,
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Code copié',
      status: 'success',
      duration: 2000,
    });
  };

  const handleChangeGroup = async (guestId: string, newGroupId: string) => {
    if (!eventId) return;
    
    try {
      await updateGuestGroup(eventId, guestId, newGroupId || null);
      setGuests(prev => prev.map(g => 
        g.id === guestId ? { ...g, invitation_group_id: newGroupId || undefined } : g
      ));
      toast({
        title: 'Groupe modifié',
        status: 'success',
        duration: 2000,
      });
    } catch (err) {
      console.error('Error updating group:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le groupe',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Layout>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">RSVPs / Invités</Heading>
          <Text color="gray.600">
            <Link href={`/events/${eventId}`}>
              <Text as="span" color="blue.600" cursor="pointer">← Retour à l'événement</Text>
            </Link>
          </Text>
        </Box>
        <HStack spacing={4}>
          <Menu>
            <MenuButton as={Button} leftIcon={<FiUpload />} variant="outline" isDisabled={loading}>
              Import / Export
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiUpload />} onClick={onImportOpen}>
                Importer CSV
              </MenuItem>
              <MenuItem icon={<FiDownload />} onClick={handleExportCSV}>
                Exporter CSV
              </MenuItem>
              <Divider />
              <MenuItem icon={<FiKey />} onClick={handleGenerateCodes} isDisabled={generatingCodes}>
                {generatingCodes ? 'Génération...' : 'Générer les codes personnels'}
              </MenuItem>
              <MenuItem icon={<FiDownload />} onClick={handleExportQRCodes}>
                Exporter QR codes (ZIP)
              </MenuItem>
            </MenuList>
          </Menu>
          <Button leftIcon={<FiMail />} colorScheme="blue">
            Relancer les non-réponses
          </Button>
        </HStack>
      </Flex>

      {/* Stats */}
      <SimpleGrid columns={{ base: 2, md: 5 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Confirmés</StatLabel>
              <StatNumber color="green.500">{computedStats.confirmed}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>En attente</StatLabel>
              <StatNumber color="orange.500">{computedStats.pending}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Déclinés</StatLabel>
              <StatNumber color="red.500">{computedStats.declined}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Accompagnants</StatLabel>
              <StatNumber>{computedStats.totalPlusOnes}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Avec code</StatLabel>
              <StatNumber color="purple.500">{computedStats.withCode}/{guests.length}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* État de chargement */}
      {loading && (
        <Card>
          <CardBody textAlign="center" py={12}>
            <Spinner size="xl" color="purple.500" mb={4} />
            <Text color="gray.500">Chargement des invités...</Text>
          </CardBody>
        </Card>
      )}

      {/* État d'erreur */}
      {error && !loading && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Contenu principal */}
      {!loading && !error && (
      <>
      {/* Filtres */}
      <Card mb={6}>
        <CardBody>
          <Flex gap={4} flexWrap="wrap">
            <InputGroup flex={1} minW="200px">
              <InputLeftElement>
                <FiSearch color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            <Select
              w="180px"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="confirmed">Confirmés</option>
              <option value="pending">En attente</option>
              <option value="declined">Déclinés</option>
            </Select>
            <Select
              w="180px"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="all">Tous les groupes</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </Select>
          </Flex>
        </CardBody>
      </Card>

      {/* Liste */}
      <Card>
        <CardBody>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Nom</Th>
                <Th>Groupe</Th>
                <Th>Code</Th>
                <Th>Statut</Th>
                <Th>+1</Th>
                <Th>Régime</Th>
                <Th>Répondu le</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredGuests.map((guest) => {
                const status = statusConfig[guest.status];
                const group = getGroupInfo(guest.invitation_group_id);
                return (
                  <Tr key={guest.id}>
                    <Td>
                      <Text fontWeight="medium">{guest.name}</Text>
                      <Text fontSize="xs" color="gray.500">{guest.email || ''}</Text>
                    </Td>
                    <Td>
                      <Select
                        size="xs"
                        value={guest.invitation_group_id || ''}
                        onChange={(e) => handleChangeGroup(guest.id, e.target.value)}
                        w="130px"
                        borderColor={group?.color || 'gray.200'}
                        _focus={{ borderColor: group?.color || 'blue.500' }}
                      >
                        <option value="">Non assigné</option>
                        {groups.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </Select>
                    </Td>
                    <Td>
                      {guest.personal_code ? (
                        <HStack spacing={1}>
                          <Code fontSize="xs" colorScheme="purple">{guest.personal_code}</Code>
                          <Tooltip label="Copier le code">
                            <IconButton
                              aria-label="Copier"
                              icon={<FiCopy />}
                              size="xs"
                              variant="ghost"
                              onClick={() => handleCopyCode(guest.personal_code!)}
                            />
                          </Tooltip>
                        </HStack>
                      ) : (
                        <Text fontSize="xs" color="gray.400">-</Text>
                      )}
                    </Td>
                    <Td>
                      <Badge colorScheme={status.color}>
                        {status.label}
                      </Badge>
                    </Td>
                    <Td>
                      {guest.plus_ones > 0 ? (
                        <Text fontSize="sm">+{guest.plus_ones}</Text>
                      ) : '-'}
                    </Td>
                    <Td>
                      <Text fontSize="sm">{guest.dietary || '-'}</Text>
                      {guest.allergies && (
                        <Badge colorScheme="red" fontSize="xs">⚠️</Badge>
                      )}
                    </Td>
                    <Td>
                      {guest.created_at ? new Date(guest.created_at).toLocaleDateString('fr-FR') : '-'}
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
                          <MenuItem>Voir les détails</MenuItem>
                          <MenuItem>Envoyer un rappel</MenuItem>
                          <MenuItem>Modifier le statut</MenuItem>
                          <Divider />
                          <MenuItem color="red.500">Supprimer</MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
      </>
      )}

      {/* Modal Import CSV */}
      <Modal isOpen={isImportOpen} onClose={onImportClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Importer des invités</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <Box bg="purple.50" p={4} borderRadius="md" borderWidth={1} borderColor="purple.200">
                <Text fontWeight="bold" color="purple.700" mb={2}>
                  📋 Instructions pour votre client
                </Text>
                <Text color="purple.600" fontSize="sm">
                  Envoyez ce modèle Google Sheet à votre client. Il remplit, vous téléchargez en CSV, vous importez ici.
                </Text>
                <Button 
                  mt={3} 
                  size="sm" 
                  colorScheme="purple" 
                  variant="outline"
                  leftIcon={<FiDownload />}
                  onClick={() => {
                    // Télécharger le template
                    window.open('/templates/invites_template.csv', '_blank');
                  }}
                >
                  Télécharger le template CSV
                </Button>
              </Box>

              <Box>
                <Text fontWeight="medium" mb={2}>Format attendu :</Text>
                <Code p={3} borderRadius="md" display="block" whiteSpace="pre" fontSize="xs" bg="gray.50">
{`Nom,Prénom,Email,Téléphone,Groupe,Notes
Cohen,David,david@mail.com,0612345678,Full Invitation,Famille marié
Levy,Sarah,sarah@mail.com,0623456789,Houppa + Soirée,Amis proches
Martin,Paul,paul@mail.com,,Soirée uniquement,Collègues`}
                </Code>
              </Box>

              <Box>
                <Text fontWeight="medium" mb={2}>Colonnes :</Text>
                <SimpleGrid columns={2} spacing={2} fontSize="sm">
                  <Text>✅ <strong>Nom</strong> - Obligatoire</Text>
                  <Text>✅ <strong>Prénom</strong> - Obligatoire</Text>
                  <Text>⚡ <strong>Email</strong> - Optionnel</Text>
                  <Text>⚡ <strong>Téléphone</strong> - Optionnel</Text>
                  <Text>✅ <strong>Groupe</strong> - Obligatoire (doit correspondre aux groupes créés)</Text>
                  <Text>⚡ <strong>Notes</strong> - Optionnel</Text>
                </SimpleGrid>
              </Box>

              <FormControl>
                <FormLabel>Fichier CSV</FormLabel>
                <Input type="file" accept=".csv" pt={1} />
              </FormControl>

              <Box bg="blue.50" p={3} borderRadius="md" fontSize="sm">
                <Text color="blue.700">
                  💡 Les codes personnels seront générés automatiquement après l'import.
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onImportClose}>
              Annuler
            </Button>
            <Button colorScheme="purple" leftIcon={<FiUpload />}>
              Importer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
}
