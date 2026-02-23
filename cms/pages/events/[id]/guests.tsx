/**
 * Page de gestion des RSVPs / Invités
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

// Groupes de démo
const mockGroups = [
  { id: '1', name: 'Famille proche', color: '#22C55E' },
  { id: '2', name: 'Amis proches', color: '#3B82F6' },
  { id: '3', name: 'Collègues', color: '#F59E0B' },
  { id: '4', name: 'Famille éloignée', color: '#8B5CF6' },
];

// Données de démo avec groupe et code personnel
const mockGuests = [
  { id: '1', name: 'Jean Dupont', firstName: 'Jean', email: 'jean@example.com', phone: '+33612345678', status: 'confirmed', plusOnes: 1, plusOneNames: ['Marie Dupont'], dietary: 'Végétarien', allergies: '', menuChoice: 'poisson', respondedAt: '2026-02-10', groupId: '1', personalCode: 'JD7K2M' },
  { id: '2', name: 'Sophie Martin', firstName: 'Sophie', email: 'sophie@example.com', phone: '+33698765432', status: 'confirmed', plusOnes: 0, plusOneNames: [], dietary: '', allergies: 'Arachides', menuChoice: 'viande', respondedAt: '2026-02-12', groupId: '2', personalCode: 'SM3N8P' },
  { id: '3', name: 'Pierre Bernard', firstName: 'Pierre', email: 'pierre@example.com', phone: '+33611223344', status: 'pending', plusOnes: 2, plusOneNames: [], dietary: '', allergies: '', menuChoice: '', respondedAt: '', groupId: '3', personalCode: null },
  { id: '4', name: 'Claire Leroy', firstName: 'Claire', email: 'claire@example.com', phone: '+33655667788', status: 'declined', plusOnes: 0, plusOneNames: [], dietary: '', allergies: '', menuChoice: '', respondedAt: '2026-02-15', groupId: '2', personalCode: 'CL9R4T' },
  { id: '5', name: 'Marc Cohen', firstName: 'Marc', email: 'marc@example.com', phone: '+33699887766', status: 'confirmed', plusOnes: 1, plusOneNames: ['Rachel Cohen'], dietary: 'Casher', allergies: '', menuChoice: 'poisson', respondedAt: '2026-02-08', groupId: '1', personalCode: 'MC2W5X' },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  confirmed: { label: 'Confirmé', color: 'green', icon: FiCheck },
  pending: { label: 'En attente', color: 'orange', icon: FiClock },
  declined: { label: 'Décliné', color: 'red', icon: FiX },
};

export default function GuestsPage() {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  const { isOpen: isImportOpen, onOpen: onImportOpen, onClose: onImportClose } = useDisclosure();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [guests, setGuests] = useState(mockGuests);

  const stats = {
    confirmed: guests.filter(g => g.status === 'confirmed').length,
    pending: guests.filter(g => g.status === 'pending').length,
    declined: guests.filter(g => g.status === 'declined').length,
    totalPlusOnes: guests.reduce((sum, g) => sum + g.plusOnes, 0),
    withCode: guests.filter(g => g.personalCode).length,
  };

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guest.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || guest.status === statusFilter;
    const matchesGroup = groupFilter === 'all' || guest.groupId === groupFilter;
    return matchesSearch && matchesStatus && matchesGroup;
  });

  const getGroupInfo = (groupId: string | null) => {
    if (!groupId) return null;
    return mockGroups.find(g => g.id === groupId);
  };

  const handleExportCSV = () => {
    toast({
      title: 'Export en cours',
      description: 'Le fichier CSV sera téléchargé dans quelques instants.',
      status: 'info',
      duration: 3000,
    });
  };

  const handleGenerateCodes = () => {
    const guestsWithoutCode = guests.filter(g => !g.personalCode);
    if (guestsWithoutCode.length === 0) {
      toast({
        title: 'Tous les invités ont déjà un code',
        status: 'info',
        duration: 3000,
      });
      return;
    }
    
    // Génération fictive de codes
    const updatedGuests = guests.map(g => {
      if (!g.personalCode) {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        const code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        return { ...g, personalCode: code };
      }
      return g;
    });
    
    setGuests(updatedGuests);
    toast({
      title: `${guestsWithoutCode.length} codes générés`,
      description: 'Les codes personnels ont été créés pour les invités.',
      status: 'success',
      duration: 3000,
    });
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

  const handleChangeGroup = (guestId: string, newGroupId: string) => {
    setGuests(prev => prev.map(g => 
      g.id === guestId ? { ...g, groupId: newGroupId } : g
    ));
    toast({
      title: 'Groupe modifié',
      status: 'success',
      duration: 2000,
    });
  };

  return (
    <Layout>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">RSVPs / Invités</Heading>
          <Text color="gray.600">
            <Link href={`/events/${id}`}>
              <Text as="span" color="blue.600" cursor="pointer">← Retour à l'événement</Text>
            </Link>
          </Text>
        </Box>
        <HStack spacing={4}>
          <Menu>
            <MenuButton as={Button} leftIcon={<FiUpload />} variant="outline">
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
              <MenuItem icon={<FiKey />} onClick={handleGenerateCodes}>
                Générer les codes personnels
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
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Accompagnants</StatLabel>
              <StatNumber>{stats.totalPlusOnes}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Avec code</StatLabel>
              <StatNumber color="purple.500">{stats.withCode}/{guests.length}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

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
              {mockGroups.map(group => (
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
                const group = getGroupInfo(guest.groupId);
                return (
                  <Tr key={guest.id}>
                    <Td>
                      <Text fontWeight="medium">{guest.name}</Text>
                      <Text fontSize="xs" color="gray.500">{guest.email}</Text>
                    </Td>
                    <Td>
                      <Select
                        size="xs"
                        value={guest.groupId || ''}
                        onChange={(e) => handleChangeGroup(guest.id, e.target.value)}
                        w="130px"
                        borderColor={group?.color || 'gray.200'}
                        _focus={{ borderColor: group?.color || 'blue.500' }}
                      >
                        <option value="">Non assigné</option>
                        {mockGroups.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </Select>
                    </Td>
                    <Td>
                      {guest.personalCode ? (
                        <HStack spacing={1}>
                          <Code fontSize="xs" colorScheme="purple">{guest.personalCode}</Code>
                          <Tooltip label="Copier le code">
                            <IconButton
                              aria-label="Copier"
                              icon={<FiCopy />}
                              size="xs"
                              variant="ghost"
                              onClick={() => handleCopyCode(guest.personalCode!)}
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
                      {guest.plusOnes > 0 ? (
                        <Text fontSize="sm">+{guest.plusOnes}</Text>
                      ) : '-'}
                    </Td>
                    <Td>
                      <Text fontSize="sm">{guest.dietary || '-'}</Text>
                      {guest.allergies && (
                        <Badge colorScheme="red" fontSize="xs">⚠️</Badge>
                      )}
                    </Td>
                    <Td>
                      {guest.respondedAt ? new Date(guest.respondedAt).toLocaleDateString('fr-FR') : '-'}
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
