/**
 * Page de gestion des sous-événements du mariage
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
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
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
  { slug: 'mairie', name: 'Cérémonie civile', dressCode: 'Tenue de ville', icon: '🏛️' },
  { slug: 'henne', name: 'Soirée Henné', dressCode: 'Tenue traditionnelle', icon: '🪬' },
  { slug: 'houppa', name: 'Cérémonie religieuse & Houppa', dressCode: 'Tenue de soirée', icon: '✡️' },
  { slug: 'party', name: 'Soirée & Dîner', dressCode: 'Tenue de gala', icon: '🎉' },
  { slug: 'chabbat', name: 'Chabbat Hatan', dressCode: 'Chic décontracté', icon: '🕯️' },
  { slug: 'cocktail', name: 'Cocktail', dressCode: 'Tenue de soirée', icon: '🥂' },
  { slug: 'brunch', name: 'Brunch du lendemain', dressCode: 'Décontracté', icon: '🥐' },
];

// Données de démo
const mockSubEvents = [
  { 
    id: '1', 
    slug: 'mairie', 
    name: 'Cérémonie civile', 
    date: '2026-06-14', 
    startTime: '15:00', 
    endTime: '16:00',
    locationName: 'Mairie du 16ème',
    locationAddress: '71 Avenue Henri Martin, 75016 Paris',
    dressCode: 'Tenue de ville',
    notes: '',
    sortOrder: 0
  },
  { 
    id: '2', 
    slug: 'henne', 
    name: 'Soirée Henné', 
    date: '2026-06-14', 
    startTime: '20:00', 
    endTime: '01:00',
    locationName: 'Salle Or Léa',
    locationAddress: '12 Rue de la Paix, 75002 Paris',
    dressCode: 'Tenue traditionnelle',
    notes: 'Tenue blanche pour les femmes',
    sortOrder: 1
  },
  { 
    id: '3', 
    slug: 'houppa', 
    name: 'Cérémonie religieuse & Houppa', 
    date: '2026-06-15', 
    startTime: '17:00', 
    endTime: '18:30',
    locationName: 'Synagogue de la Victoire',
    locationAddress: '44 Rue de la Victoire, 75009 Paris',
    dressCode: 'Tenue de soirée',
    notes: 'Kippa fournie sur place',
    sortOrder: 2
  },
  { 
    id: '4', 
    slug: 'party', 
    name: 'Soirée & Dîner', 
    date: '2026-06-15', 
    startTime: '20:00', 
    endTime: '05:00',
    locationName: 'Pavillon Royal',
    locationAddress: 'Route de Suresnes, 75016 Paris',
    dressCode: 'Tenue de gala',
    notes: 'Cocktail à 20h, dîner à 21h30',
    sortOrder: 3
  },
];

interface SubEvent {
  id?: string;
  slug: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  locationName: string;
  locationAddress: string;
  dressCode: string;
  notes: string;
  sortOrder: number;
}

const emptySubEvent: SubEvent = {
  slug: '',
  name: '',
  date: '',
  startTime: '',
  endTime: '',
  locationName: '',
  locationAddress: '',
  dressCode: '',
  notes: '',
  sortOrder: 0
};

export default function SubEventsPage() {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [subEvents, setSubEvents] = useState(mockSubEvents);
  const [editingSubEvent, setEditingSubEvent] = useState<SubEvent>(emptySubEvent);
  const [isEditing, setIsEditing] = useState(false);

  const handleAddFromTemplate = (template: typeof templates[0]) => {
    setEditingSubEvent({
      ...emptySubEvent,
      slug: template.slug,
      name: template.name,
      dressCode: template.dressCode,
      sortOrder: subEvents.length
    });
    setIsEditing(false);
    onOpen();
  };

  const handleEdit = (subEvent: typeof mockSubEvents[0]) => {
    setEditingSubEvent(subEvent);
    setIsEditing(true);
    onOpen();
  };

  const handleSave = () => {
    if (isEditing) {
      setSubEvents(prev => prev.map(se => 
        se.id === editingSubEvent.id ? editingSubEvent : se
      ));
      toast({
        title: 'Sous-événement modifié',
        status: 'success',
        duration: 3000,
      });
    } else {
      const newSubEvent = {
        ...editingSubEvent,
        id: Date.now().toString(),
      };
      setSubEvents(prev => [...prev, newSubEvent]);
      toast({
        title: 'Sous-événement ajouté',
        status: 'success',
        duration: 3000,
      });
    }
    onClose();
    setEditingSubEvent(emptySubEvent);
  };

  const handleDelete = (subEventId: string) => {
    setSubEvents(prev => prev.filter(se => se.id !== subEventId));
    toast({
      title: 'Sous-événement supprimé',
      status: 'info',
      duration: 3000,
    });
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
            <Link href={`/events/${id}`}>
              <Text as="span" color="blue.600" cursor="pointer">← Retour à l'événement</Text>
            </Link>
          </Text>
        </Box>
        <Menu>
          <MenuButton as={Button} leftIcon={<FiPlus />} colorScheme="purple">
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

      {/* Liste des sous-événements */}
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
                          <Text>{formatDate(subEvent.date)}</Text>
                        </HStack>
                        <HStack>
                          <FiClock size={14} />
                          <Text>{subEvent.startTime} - {subEvent.endTime}</Text>
                        </HStack>
                      </HStack>
                      <HStack mt={2} spacing={4} color="gray.600" fontSize="sm">
                        <HStack>
                          <FiMapPin size={14} />
                          <Text>{subEvent.locationName}</Text>
                        </HStack>
                      </HStack>
                      {subEvent.dressCode && (
                        <Badge mt={2} colorScheme="blue" variant="subtle">
                          👔 {subEvent.dressCode}
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
                    value={editingSubEvent.date}
                    onChange={(e) => setEditingSubEvent(prev => ({ ...prev, date: e.target.value }))}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Heure de début</FormLabel>
                  <Input
                    type="time"
                    value={editingSubEvent.startTime}
                    onChange={(e) => setEditingSubEvent(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Heure de fin</FormLabel>
                  <Input
                    type="time"
                    value={editingSubEvent.endTime}
                    onChange={(e) => setEditingSubEvent(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Nom du lieu</FormLabel>
                <Input
                  value={editingSubEvent.locationName}
                  onChange={(e) => setEditingSubEvent(prev => ({ ...prev, locationName: e.target.value }))}
                  placeholder="Ex: Mairie du 16ème"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Adresse</FormLabel>
                <Input
                  value={editingSubEvent.locationAddress}
                  onChange={(e) => setEditingSubEvent(prev => ({ ...prev, locationAddress: e.target.value }))}
                  placeholder="Ex: 71 Avenue Henri Martin, 75016 Paris"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Code vestimentaire</FormLabel>
                <Input
                  value={editingSubEvent.dressCode}
                  onChange={(e) => setEditingSubEvent(prev => ({ ...prev, dressCode: e.target.value }))}
                  placeholder="Ex: Tenue de soirée"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={editingSubEvent.notes}
                  onChange={(e) => setEditingSubEvent(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Informations supplémentaires pour les invités..."
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button colorScheme="purple" onClick={handleSave}>
              {isEditing ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Layout>
  );
}
