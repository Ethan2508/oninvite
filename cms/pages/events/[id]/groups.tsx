/**
 * Page de gestion des groupes d'invitation
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

// Sous-événements de démo (normalement récupérés depuis l'API)
const mockSubEvents = [
  { id: '1', slug: 'mairie', name: 'Cérémonie civile' },
  { id: '2', slug: 'henne', name: 'Soirée Henné' },
  { id: '3', slug: 'houppa', name: 'Houppa' },
  { id: '4', slug: 'party', name: 'Soirée & Dîner' },
  { id: '5', slug: 'chabbat', name: 'Chabbat Hatan' },
];

// Groupes de démo
const mockGroups = [
  { 
    id: '1', 
    name: 'Famille proche', 
    description: 'Parents, frères et sœurs, grands-parents',
    color: '#22C55E',
    subEventIds: ['1', '2', '3', '4', '5'],
    guestCount: 45
  },
  { 
    id: '2', 
    name: 'Amis proches', 
    description: 'Amis de longue date',
    color: '#3B82F6',
    subEventIds: ['1', '3', '4'],
    guestCount: 60
  },
  { 
    id: '3', 
    name: 'Collègues', 
    description: 'Collègues de travail',
    color: '#F59E0B',
    subEventIds: ['3', '4'],
    guestCount: 35
  },
  { 
    id: '4', 
    name: 'Famille éloignée', 
    description: 'Oncles, tantes, cousins',
    color: '#8B5CF6',
    subEventIds: ['2', '3', '4', '5'],
    guestCount: 55
  },
];

interface Group {
  id: string;
  name: string;
  description: string;
  color: string;
  subEventIds: string[];
  guestCount: number;
}

const emptyGroup: Group = {
  id: '',
  name: '',
  description: '',
  color: '#22C55E',
  subEventIds: [],
  guestCount: 0
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
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [groups, setGroups] = useState(mockGroups);
  const [editingGroup, setEditingGroup] = useState<Group>(emptyGroup);
  const [isEditing, setIsEditing] = useState(false);

  const handleAddFromTemplate = (template: typeof groupTemplates[0]) => {
    let subEventIds: string[] = [];
    
    if (template.allSubEvents) {
      subEventIds = mockSubEvents.map(se => se.id);
    } else if (template.defaultSlugs) {
      subEventIds = mockSubEvents
        .filter(se => template.defaultSlugs?.includes(se.slug))
        .map(se => se.id);
    }
    
    setEditingGroup({
      ...emptyGroup,
      name: template.name,
      description: template.description,
      color: template.color,
      subEventIds
    });
    setIsEditing(false);
    onOpen();
  };

  const handleEdit = (group: typeof mockGroups[0]) => {
    setEditingGroup(group);
    setIsEditing(true);
    onOpen();
  };

  const handleSave = () => {
    if (isEditing) {
      setGroups(prev => prev.map(g => 
        g.id === editingGroup.id ? editingGroup : g
      ));
      toast({
        title: 'Groupe modifié',
        status: 'success',
        duration: 3000,
      });
    } else {
      const newGroup = {
        ...editingGroup,
        id: Date.now().toString(),
      };
      setGroups(prev => [...prev, newGroup]);
      toast({
        title: 'Groupe créé',
        status: 'success',
        duration: 3000,
      });
    }
    onClose();
    setEditingGroup(emptyGroup);
  };

  const handleDelete = (groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
    toast({
      title: 'Groupe supprimé',
      description: 'Les invités de ce groupe ont été désassignés.',
      status: 'info',
      duration: 3000,
    });
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
    return mockSubEvents.find(se => se.id === subEventId)?.name || '';
  };

  const totalGuests = groups.reduce((sum, g) => sum + g.guestCount, 0);

  return (
    <Layout>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">Groupes d'invitation</Heading>
          <Text color="gray.600">
            <Link href={`/events/${id}`}>
              <Text as="span" color="blue.600" cursor="pointer">← Retour à l'événement</Text>
            </Link>
          </Text>
        </Box>
        <Menu>
          <MenuButton as={Button} leftIcon={<FiPlus />} colorScheme="purple">
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
                <Text fontSize="2xl" fontWeight="bold">{mockSubEvents.length}</Text>
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
                          {group.guestCount} invités
                        </Badge>
                      </HStack>
                      {group.description && (
                        <Text color="gray.600" fontSize="sm" mb={3}>
                          {group.description}
                        </Text>
                      )}
                      <HStack spacing={2} flexWrap="wrap" gap={2}>
                        {mockSubEvents.map((subEvent) => {
                          const isIncluded = group.subEventIds.includes(subEvent.id);
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
                  {mockSubEvents.map((subEvent) => (
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
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button 
              colorScheme="purple" 
              onClick={handleSave}
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
