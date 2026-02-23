/**
 * Page de gestion des groupes d'invitation
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
  HStack,
  VStack,
  Input,
  FormControl,
  FormLabel,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useToast,
  Textarea,
  SimpleGrid,
  Checkbox,
  CheckboxGroup,
  Stack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiMoreVertical,
  FiUsers,
  FiCheck,
} from 'react-icons/fi';
import {
  getSubEvents,
  getInvitationGroups,
  createInvitationGroup,
  updateInvitationGroup,
  deleteInvitationGroup,
  linkSubEventsToGroup,
  SubEvent,
  InvitationGroup,
} from '../../../services/api';

// Couleurs disponibles pour les groupes
const groupColors = [
  { value: '#22C55E', name: 'Vert' },
  { value: '#3B82F6', name: 'Bleu' },
  { value: '#F59E0B', name: 'Orange' },
  { value: '#8B5CF6', name: 'Violet' },
  { value: '#EC4899', name: 'Rose' },
  { value: '#EF4444', name: 'Rouge' },
  { value: '#14B8A6', name: 'Turquoise' },
  { value: '#6366F1', name: 'Indigo' },
];

// Interface locale pour le formulaire (avec subEventIds)
interface GroupFormData {
  id: string;
  name: string;
  description: string;
  color: string;
  subEventIds: string[];
}

const emptyGroup: GroupFormData = {
  id: '',
  name: '',
  description: '',
  color: '#22C55E',
  subEventIds: [],
};

// Templates de groupes
const groupTemplates = [
  { 
    name: 'Full invitation', 
    description: 'Invités à tous les événements',
    color: '#22C55E',
    allSubEvents: true
  },
  { 
    name: 'Cérémonie + Soirée', 
    description: 'Invités à la cérémonie et à la soirée',
    color: '#3B82F6',
    defaultSlugs: ['mairie', 'houppa', 'party']
  },
  { 
    name: 'Soirée uniquement', 
    description: 'Invités uniquement à la soirée',
    color: '#F59E0B',
    defaultSlugs: ['party']
  },
];

export default function GroupsPage() {
  const router = useRouter();
  const { id } = router.query;
  const eventId = id as string;
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [groups, setGroups] = useState<InvitationGroup[]>([]);
  const [subEvents, setSubEvents] = useState<SubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<GroupFormData>(emptyGroup);
  const [isEditing, setIsEditing] = useState(false);

  // Charger les groupes et sous-événements depuis l'API
  useEffect(() => {
    if (!eventId) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [groupsData, subEventsData] = await Promise.all([
          getInvitationGroups(eventId),
          getSubEvents(eventId),
        ]);
        setGroups(groupsData);
        setSubEvents(subEventsData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [eventId]);

  // Convertir InvitationGroup en GroupFormData pour l'édition
  const groupToFormData = (group: InvitationGroup): GroupFormData => ({
    id: group.id,
    name: group.name,
    description: group.description || '',
    color: group.color || '#22C55E',
    subEventIds: group.sub_events?.map(se => se.id) || [],
  });

  const handleAddFromTemplate = (template: typeof groupTemplates[0]) => {
    let selectedSubEventIds: string[] = [];
    
    if (template.allSubEvents) {
      selectedSubEventIds = subEvents.map(se => se.id);
    } else if (template.defaultSlugs) {
      selectedSubEventIds = subEvents
        .filter(se => template.defaultSlugs?.includes(se.slug))
        .map(se => se.id);
    }
    
    setEditingGroup({
      ...emptyGroup,
      name: template.name,
      description: template.description,
      color: template.color,
      subEventIds: selectedSubEventIds
    });
    setIsEditing(false);
    onOpen();
  };

  const handleEdit = (group: InvitationGroup) => {
    setEditingGroup(groupToFormData(group));
    setIsEditing(true);
    onOpen();
  };

  const handleSave = async () => {
    if (!eventId) return;
    
    try {
      setSaving(true);
      
      if (isEditing && editingGroup.id) {
        // Mettre à jour le groupe
        const updated = await updateInvitationGroup(eventId, editingGroup.id, {
          name: editingGroup.name,
          description: editingGroup.description,
          color: editingGroup.color,
        });
        // Mettre à jour les liens vers les sous-événements
        await linkSubEventsToGroup(eventId, editingGroup.id, editingGroup.subEventIds);
        
        setGroups(prev => prev.map(g => 
          g.id === editingGroup.id ? { ...updated, sub_events: subEvents.filter(se => editingGroup.subEventIds.includes(se.id)) } : g
        ));
        toast({
          title: 'Groupe modifié',
          status: 'success',
          duration: 3000,
        });
      } else {
        // Créer le groupe
        const created = await createInvitationGroup(eventId, {
          name: editingGroup.name,
          description: editingGroup.description,
          color: editingGroup.color,
        });
        // Lier les sous-événements
        if (editingGroup.subEventIds.length > 0) {
          await linkSubEventsToGroup(eventId, created.id, editingGroup.subEventIds);
        }
        
        setGroups(prev => [...prev, { ...created, sub_events: subEvents.filter(se => editingGroup.subEventIds.includes(se.id)) }]);
        toast({
          title: 'Groupe créé',
          status: 'success',
          duration: 3000,
        });
      }
      onClose();
      setEditingGroup(emptyGroup);
    } catch (err) {
      console.error('Error saving group:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le groupe',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (groupId: string) => {
    if (!eventId) return;
    
    try {
      await deleteInvitationGroup(eventId, groupId);
      setGroups(prev => prev.filter(g => g.id !== groupId));
      toast({
        title: 'Groupe supprimé',
        description: 'Les invités de ce groupe ont été désassignés.',
        status: 'info',
        duration: 3000,
      });
    } catch (err) {
      console.error('Error deleting group:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le groupe',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleSubEventToggle = (subEventId: string) => {
    setEditingGroup(prev => {
      const newIds = prev.subEventIds.includes(subEventId)
        ? prev.subEventIds.filter(id => id !== subEventId)
        : [...prev.subEventIds, subEventId];
      return { ...prev, subEventIds: newIds };
    });
  };

  const getSubEventName = (subEventId: string) => {
    return subEvents.find(se => se.id === subEventId)?.name || '';
  };

  const totalGuests = groups.reduce((sum, g) => sum + (g.guest_count || 0), 0);

  return (
    <Layout>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">Groupes d'invitation</Heading>
          <Text color="gray.600">
            <Link href={`/events/${eventId}`}>
              <Text as="span" color="blue.600" cursor="pointer">← Retour à l'événement</Text>
            </Link>
          </Text>
        </Box>
        <Menu>
          <MenuButton as={Button} leftIcon={<FiPlus />} colorScheme="purple" isDisabled={loading}>
            Créer un groupe
          </MenuButton>
          <MenuList>
            {groupTemplates.map((template, index) => (
              <MenuItem 
                key={index} 
                onClick={() => handleAddFromTemplate(template)}
              >
                <Box w="12px" h="12px" bg={template.color} borderRadius="full" mr={2} />
                {template.name}
              </MenuItem>
            ))}
            <Divider my={2} />
            <MenuItem onClick={() => { setEditingGroup(emptyGroup); setIsEditing(false); onOpen(); }}>
              Groupe personnalisé...
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      {/* État de chargement */}
      {loading && (
        <Card>
          <CardBody textAlign="center" py={12}>
            <Spinner size="xl" color="purple.500" mb={4} />
            <Text color="gray.500">Chargement des groupes...</Text>
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
      {/* Résumé */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={8}>
        <Card>
          <CardBody>
            <HStack>
              <Box p={3} bg="purple.100" borderRadius="lg">
                <FiUsers color="var(--chakra-colors-purple-600)" size={24} />
              </Box>
              <Box>
                <Text color="gray.600" fontSize="sm">Total invités</Text>
                <Text fontSize="2xl" fontWeight="bold">{totalGuests}</Text>
              </Box>
            </HStack>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <HStack>
              <Box p={3} bg="blue.100" borderRadius="lg">
                <FiUsers color="var(--chakra-colors-blue-600)" size={24} />
              </Box>
              <Box>
                <Text color="gray.600" fontSize="sm">Groupes créés</Text>
                <Text fontSize="2xl" fontWeight="bold">{groups.length}</Text>
              </Box>
            </HStack>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <HStack>
              <Box p={3} bg="green.100" borderRadius="lg">
                <FiCheck color="var(--chakra-colors-green-600)" size={24} />
              </Box>
              <Box>
                <Text color="gray.600" fontSize="sm">Sous-événements</Text>
                <Text fontSize="2xl" fontWeight="bold">{subEvents.length}</Text>
              </Box>
            </HStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Liste des groupes */}
      <VStack spacing={4} align="stretch">
        {groups.length === 0 ? (
          <Card>
            <CardBody textAlign="center" py={12}>
              <Text color="gray.500" mb={4}>
                Aucun groupe d'invitation n'a été créé.
              </Text>
              <Text color="gray.400" fontSize="sm">
                Créez des groupes pour définir quels invités ont accès à quels sous-événements.
              </Text>
            </CardBody>
          </Card>
        ) : (
          groups.map((group) => (
            <Card key={group.id} variant="outline">
              <CardBody>
                <Flex justify="space-between" align="flex-start">
                  <HStack align="flex-start" spacing={4}>
                    <Box 
                      w="16px" 
                      h="16px" 
                      bg={group.color} 
                      borderRadius="full"
                      mt={1}
                      flexShrink={0}
                    />
                    <Box flex={1}>
                      <HStack mb={1}>
                        <Heading size="md">{group.name}</Heading>
                        <Badge colorScheme="gray">
                          {group.guest_count || 0} invités
                        </Badge>
                      </HStack>
                      {group.description && (
                        <Text color="gray.600" fontSize="sm" mb={3}>
                          {group.description}
                        </Text>
                      )}
                      <HStack spacing={2} flexWrap="wrap" gap={2}>
                        {subEvents.map((subEvent) => {
                          const isIncluded = group.sub_events?.some(se => se.id === subEvent.id) || false;
                          return (
                            <Badge
                              key={subEvent.id}
                              colorScheme={isIncluded ? 'green' : 'gray'}
                              variant={isIncluded ? 'solid' : 'outline'}
                              opacity={isIncluded ? 1 : 0.5}
                            >
                              {isIncluded ? '✓' : '✗'} {subEvent.name}
                            </Badge>
                          );
                        })}
                      </HStack>
                    </Box>
                  </HStack>
                  <HStack>
                    <IconButton
                      aria-label="Modifier"
                      icon={<FiEdit2 />}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(group)}
                    />
                    <IconButton
                      aria-label="Supprimer"
                      icon={<FiTrash2 />}
                      variant="ghost"
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(group.id!)}
                    />
                  </HStack>
                </Flex>
              </CardBody>
            </Card>
          ))
        )}
      </VStack>
      </>
      )}

      {/* Modal d'édition */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? 'Modifier le groupe' : 'Créer un groupe'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Nom du groupe</FormLabel>
                <Input
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Famille proche"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={editingGroup.description}
                  onChange={(e) => setEditingGroup(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description optionnelle..."
                />
              </FormControl>

              <FormControl>
                <FormLabel>Couleur</FormLabel>
                <HStack spacing={2} flexWrap="wrap">
                  {groupColors.map((color) => (
                    <Box
                      key={color.value}
                      w="32px"
                      h="32px"
                      bg={color.value}
                      borderRadius="full"
                      cursor="pointer"
                      border={editingGroup.color === color.value ? '3px solid black' : '2px solid transparent'}
                      onClick={() => setEditingGroup(prev => ({ ...prev, color: color.value }))}
                      _hover={{ transform: 'scale(1.1)' }}
                      transition="transform 0.2s"
                    />
                  ))}
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel>Sous-événements inclus</FormLabel>
                <Text fontSize="sm" color="gray.600" mb={3}>
                  Cochez les événements auxquels les membres de ce groupe sont invités.
                </Text>
                <Stack spacing={3}>
                  {subEvents.map((subEvent) => (
                    <Checkbox
                      key={subEvent.id}
                      isChecked={editingGroup.subEventIds.includes(subEvent.id)}
                      onChange={() => handleSubEventToggle(subEvent.id)}
                      colorScheme="purple"
                    >
                      {subEvent.name}
                    </Checkbox>
                  ))}
                </Stack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} isDisabled={saving}>
              Annuler
            </Button>
            <Button 
              colorScheme="purple" 
              onClick={handleSave}
              isLoading={saving}
              isDisabled={!editingGroup.name}
            >
              {isEditing ? 'Enregistrer' : 'Créer'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
}
