/**
 * Page de gestion des sous-événements du mariage
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { 
  getSubEvents, 
  createSubEvent, 
  updateSubEvent, 
  deleteSubEvent,
  SubEvent 
} from '../../../services/api';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiMoreVertical,
  FiMapPin,
  FiClock,
  FiCalendar,
  FiMove
} from 'react-icons/fi';

// Templates de sous-événements
const templates = [
  { slug: 'mairie', name: 'Cérémonie civile', dress_code: 'Tenue de ville', icon: '🏛️' },
  { slug: 'henne', name: 'Soirée Henné', dress_code: 'Tenue traditionnelle', icon: '🪬' },
  { slug: 'houppa', name: 'Cérémonie religieuse & Houppa', dress_code: 'Tenue de soirée', icon: '✡️' },
  { slug: 'party', name: 'Soirée & Dîner', dress_code: 'Tenue de gala', icon: '🎉' },
  { slug: 'chabbat', name: 'Chabbat Hatan', dress_code: 'Chic décontracté', icon: '🕯️' },
  { slug: 'cocktail', name: 'Cocktail', dress_code: 'Tenue de soirée', icon: '🥂' },
  { slug: 'brunch', name: 'Brunch du lendemain', dress_code: 'Décontracté', icon: '🥐' },
];

const emptySubEvent: Partial<SubEvent> = {
  id: '',
  slug: '',
  name: '',
  date: '',
  start_time: '',
  end_time: '',
  location_name: '',
  location_address: '',
  dress_code: '',
  notes: '',
  sort_order: 0
};

export default function SubEventsPage() {
  const router = useRouter();
  const { id } = router.query;
  const eventId = id as string;
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [subEvents, setSubEvents] = useState<SubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSubEvent, setEditingSubEvent] = useState<Partial<SubEvent>>(emptySubEvent);
  const [isEditing, setIsEditing] = useState(false);

  // Charger les sous-événements depuis l'API
  useEffect(() => {
    if (!eventId) return;
    
    const loadSubEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSubEvents(eventId);
        setSubEvents(data);
      } catch (err) {
        console.error('Error loading sub-events:', err);
        setError('Impossible de charger les sous-événements');
      } finally {
        setLoading(false);
      }
    };

    loadSubEvents();
  }, [eventId]);

  const handleAddFromTemplate = (template: typeof templates[0]) => {
    setEditingSubEvent({
      ...emptySubEvent,
      slug: template.slug,
      name: template.name,
      dress_code: template.dress_code,
      sort_order: subEvents.length
    });
    setIsEditing(false);
    onOpen();
  };

  const handleEdit = (subEvent: SubEvent) => {
    setEditingSubEvent(subEvent);
    setIsEditing(true);
    onOpen();
  };

  const handleSave = async () => {
    if (!eventId) return;
    
    try {
      setSaving(true);
      
      if (isEditing && editingSubEvent.id) {
        const updated = await updateSubEvent(eventId, editingSubEvent.id, editingSubEvent);
        setSubEvents(prev => prev.map(se => 
          se.id === editingSubEvent.id ? updated : se
        ));
        toast({
          title: 'Sous-événement modifié',
          status: 'success',
          duration: 3000,
        });
      } else {
        const created = await createSubEvent(eventId, editingSubEvent);
        setSubEvents(prev => [...prev, created]);
        toast({
          title: 'Sous-événement ajouté',
          status: 'success',
          duration: 3000,
        });
      }
      onClose();
      setEditingSubEvent(emptySubEvent);
    } catch (err) {
      console.error('Error saving sub-event:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le sous-événement',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (subEventId: string) => {
    if (!eventId) return;
    
    try {
      await deleteSubEvent(eventId, subEventId);
      setSubEvents(prev => prev.filter(se => se.id !== subEventId));
      toast({
        title: 'Sous-événement supprimé',
        status: 'info',
        duration: 3000,
      });
    } catch (err) {
      console.error('Error deleting sub-event:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le sous-événement',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <Layout>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">Sous-événements du mariage</Heading>
          <Text color="gray.600">
            <Link href={`/events/${eventId}`}>
              <Text as="span" color="blue.600" cursor="pointer">← Retour à l'événement</Text>
            </Link>
          </Text>
        </Box>
        <Menu>
          <MenuButton as={Button} leftIcon={<FiPlus />} colorScheme="purple" isDisabled={loading}>
            Ajouter un sous-événement
          </MenuButton>
          <MenuList>
            {templates.map((template) => (
              <MenuItem 
                key={template.slug} 
                onClick={() => handleAddFromTemplate(template)}
              >
                {template.icon} {template.name}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Flex>

      {/* État de chargement */}
      {loading && (
        <Card>
          <CardBody textAlign="center" py={12}>
            <Spinner size="xl" color="purple.500" mb={4} />
            <Text color="gray.500">Chargement des sous-événements...</Text>
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

      {/* Liste des sous-événements */}
      {!loading && !error && (
      <VStack spacing={4} align="stretch">
        {subEvents.length === 0 ? (
          <Card>
            <CardBody textAlign="center" py={12}>
              <Text color="gray.500" mb={4}>
                Aucun sous-événement n'a été ajouté.
              </Text>
              <Text color="gray.400" fontSize="sm">
                Utilisez le bouton "Ajouter un sous-événement" pour commencer.
              </Text>
            </CardBody>
          </Card>
        ) : (
          subEvents.map((subEvent, index) => (
            <Card key={subEvent.id} variant="outline">
              <CardBody>
                <Flex justify="space-between" align="flex-start">
                  <HStack align="flex-start" spacing={4}>
                    <Box 
                      w="40px" 
                      h="40px" 
                      bg="purple.100" 
                      borderRadius="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="purple.600"
                      fontWeight="bold"
                    >
                      {index + 1}
                    </Box>
                    <Box>
                      <HStack mb={1}>
                        <Heading size="md">{subEvent.name}</Heading>
                        <Badge colorScheme="purple" fontSize="xs">
                          {subEvent.slug}
                        </Badge>
                      </HStack>
                      <HStack spacing={4} color="gray.600" fontSize="sm">
                        <HStack>
                          <FiCalendar size={14} />
                          <Text>{formatDate(subEvent.date || '')}</Text>
                        </HStack>
                        <HStack>
                          <FiClock size={14} />
                          <Text>{subEvent.start_time} - {subEvent.end_time}</Text>
                        </HStack>
                      </HStack>
                      <HStack mt={2} spacing={4} color="gray.600" fontSize="sm">
                        <HStack>
                          <FiMapPin size={14} />
                          <Text>{subEvent.location_name}</Text>
                        </HStack>
                      </HStack>
                      {subEvent.dress_code && (
                        <Badge mt={2} colorScheme="blue" variant="subtle">
                          👔 {subEvent.dress_code}
                        </Badge>
                      )}
                      {subEvent.notes && (
                        <Text mt={2} fontSize="sm" color="gray.500" fontStyle="italic">
                          ℹ️ {subEvent.notes}
                        </Text>
                      )}
                    </Box>
                  </HStack>
                  <HStack>
                    <IconButton
                      aria-label="Déplacer"
                      icon={<FiMove />}
                      variant="ghost"
                      size="sm"
                      cursor="grab"
                    />
                    <IconButton
                      aria-label="Modifier"
                      icon={<FiEdit2 />}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(subEvent)}
                    />
                    <IconButton
                      aria-label="Supprimer"
                      icon={<FiTrash2 />}
                      variant="ghost"
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(subEvent.id)}
                    />
                  </HStack>
                </Flex>
              </CardBody>
            </Card>
          ))
        )}
      </VStack>
      )}

      {/* Modal d'édition */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? 'Modifier le sous-événement' : 'Ajouter un sous-événement'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Nom</FormLabel>
                  <Input
                    value={editingSubEvent.name}
                    onChange={(e) => setEditingSubEvent(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Cérémonie civile"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Identifiant (slug)</FormLabel>
                  <Input
                    value={editingSubEvent.slug}
                    onChange={(e) => setEditingSubEvent(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="Ex: mairie"
                  />
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={3} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    value={editingSubEvent.date || ''}
                    onChange={(e) => setEditingSubEvent(prev => ({ ...prev, date: e.target.value }))}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Heure de début</FormLabel>
                  <Input
                    type="time"
                    value={editingSubEvent.start_time || ''}
                    onChange={(e) => setEditingSubEvent(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Heure de fin</FormLabel>
                  <Input
                    type="time"
                    value={editingSubEvent.end_time || ''}
                    onChange={(e) => setEditingSubEvent(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Nom du lieu</FormLabel>
                <Input
                  value={editingSubEvent.location_name || ''}
                  onChange={(e) => setEditingSubEvent(prev => ({ ...prev, location_name: e.target.value }))}
                  placeholder="Ex: Mairie du 16ème"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Adresse</FormLabel>
                <Input
                  value={editingSubEvent.location_address || ''}
                  onChange={(e) => setEditingSubEvent(prev => ({ ...prev, location_address: e.target.value }))}
                  placeholder="Ex: 71 Avenue Henri Martin, 75016 Paris"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Code vestimentaire</FormLabel>
                <Input
                  value={editingSubEvent.dress_code || ''}
                  onChange={(e) => setEditingSubEvent(prev => ({ ...prev, dress_code: e.target.value }))}
                  placeholder="Ex: Tenue de soirée"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={editingSubEvent.notes || ''}
                  onChange={(e) => setEditingSubEvent(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Informations supplémentaires pour les invités..."
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose} isDisabled={saving}>
              Annuler
            </Button>
            <Button colorScheme="purple" onClick={handleSave} isLoading={saving}>
              {isEditing ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
}
