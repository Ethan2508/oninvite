/**
 * Page de modération des photos
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
  SimpleGrid,
  Image,
  HStack,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Checkbox,
  Select,
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { FiDownload, FiTrash2, FiCheck, FiX, FiMaximize2 } from 'react-icons/fi';

// Données de démo
const mockPhotos = [
  { id: '1', url: 'https://picsum.photos/seed/1/400/300', uploadedBy: 'Jean Dupont', uploadedAt: '2026-02-10T14:30:00', approved: true },
  { id: '2', url: 'https://picsum.photos/seed/2/400/300', uploadedBy: 'Sophie Martin', uploadedAt: '2026-02-10T15:45:00', approved: true },
  { id: '3', url: 'https://picsum.photos/seed/3/400/300', uploadedBy: 'Pierre Bernard', uploadedAt: '2026-02-11T10:20:00', approved: false },
  { id: '4', url: 'https://picsum.photos/seed/4/400/300', uploadedBy: 'Claire Leroy', uploadedAt: '2026-02-11T11:00:00', approved: true },
  { id: '5', url: 'https://picsum.photos/seed/5/400/300', uploadedBy: 'Marc Cohen', uploadedAt: '2026-02-12T09:15:00', approved: false },
  { id: '6', url: 'https://picsum.photos/seed/6/400/300', uploadedBy: 'Rachel Cohen', uploadedAt: '2026-02-12T09:30:00', approved: true },
];

export default function PhotosPage() {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [photos, setPhotos] = useState(mockPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const filteredPhotos = photos.filter((photo) => {
    if (filter === 'approved') return photo.approved;
    if (filter === 'pending') return !photo.approved;
    return true;
  });

  const handleApprove = (photoId: string) => {
    setPhotos(photos.map(p => p.id === photoId ? { ...p, approved: true } : p));
    toast({ title: 'Photo approuvée', status: 'success', duration: 2000 });
  };

  const handleDelete = (photoId: string) => {
    setPhotos(photos.filter(p => p.id !== photoId));
    toast({ title: 'Photo supprimée', status: 'info', duration: 2000 });
  };

  const handleBulkApprove = () => {
    setPhotos(photos.map(p => selectedPhotos.includes(p.id) ? { ...p, approved: true } : p));
    setSelectedPhotos([]);
    toast({ title: `${selectedPhotos.length} photos approuvées`, status: 'success', duration: 2000 });
  };

  const handleDownloadAll = () => {
    toast({
      title: 'Téléchargement en cours',
      description: 'L\'archive ZIP sera téléchargée dans quelques instants.',
      status: 'info',
      duration: 3000,
    });
  };

  const openPhotoModal = (url: string) => {
    setSelectedPhoto(url);
    onOpen();
  };

  const togglePhotoSelection = (photoId: string) => {
    if (selectedPhotos.includes(photoId)) {
      setSelectedPhotos(selectedPhotos.filter(id => id !== photoId));
    } else {
      setSelectedPhotos([...selectedPhotos, photoId]);
    }
  };

  return (
    <Layout>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="lg">Galerie photo</Heading>
          <Text color="gray.600">
            <Link href={`/events/${id}`}>
              <Text as="span" color="blue.600" cursor="pointer">← Retour à l'événement</Text>
            </Link>
            {' • '}{photos.length} photos ({photos.filter(p => !p.approved).length} en attente)
          </Text>
        </Box>
        <HStack spacing={4}>
          {selectedPhotos.length > 0 && (
            <Button colorScheme="green" onClick={handleBulkApprove}>
              Approuver ({selectedPhotos.length})
            </Button>
          )}
          <Button leftIcon={<FiDownload />} variant="outline" onClick={handleDownloadAll}>
            Télécharger tout (ZIP)
          </Button>
        </HStack>
      </Flex>

      {/* Filtre */}
      <Card mb={6}>
        <CardBody>
          <Flex gap={4} align="center">
            <Text fontWeight="medium">Filtrer :</Text>
            <Select w="200px" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Toutes les photos</option>
              <option value="approved">Approuvées</option>
              <option value="pending">En attente</option>
            </Select>
            <Text color="gray.600">{filteredPhotos.length} photos</Text>
          </Flex>
        </CardBody>
      </Card>

      {/* Grille de photos */}
      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
        {filteredPhotos.map((photo) => (
          <Card key={photo.id} position="relative" overflow="hidden">
            <Box position="absolute" top={2} left={2} zIndex={2}>
              <Checkbox
                isChecked={selectedPhotos.includes(photo.id)}
                onChange={() => togglePhotoSelection(photo.id)}
                colorScheme="blue"
                bg="white"
                borderRadius="md"
              />
            </Box>
            {!photo.approved && (
              <Badge
                position="absolute"
                top={2}
                right={2}
                colorScheme="orange"
                zIndex={2}
              >
                En attente
              </Badge>
            )}
            <Image
              src={photo.url}
              alt="Photo"
              h="200px"
              w="100%"
              objectFit="cover"
              cursor="pointer"
              onClick={() => openPhotoModal(photo.url)}
            />
            <CardBody py={2} px={3}>
              <Text fontSize="sm" fontWeight="medium">{photo.uploadedBy}</Text>
              <Text fontSize="xs" color="gray.500">
                {new Date(photo.uploadedAt).toLocaleDateString('fr-FR')}
              </Text>
              <HStack mt={2} spacing={2}>
                <IconButton
                  aria-label="Voir"
                  icon={<FiMaximize2 />}
                  size="sm"
                  variant="ghost"
                  onClick={() => openPhotoModal(photo.url)}
                />
                {!photo.approved && (
                  <IconButton
                    aria-label="Approuver"
                    icon={<FiCheck />}
                    size="sm"
                    colorScheme="green"
                    variant="ghost"
                    onClick={() => handleApprove(photo.id)}
                  />
                )}
                <IconButton
                  aria-label="Supprimer"
                  icon={<FiTrash2 />}
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => handleDelete(photo.id)}
                />
              </HStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Modal de visualisation */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalCloseButton color="white" />
          <ModalBody p={0}>
            {selectedPhoto && (
              <Image src={selectedPhoto} alt="Photo" w="100%" borderRadius="md" />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Layout>
  );
}
