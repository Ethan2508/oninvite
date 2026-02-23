/**
 * Page globale - Toutes les photos
 */
import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  Image,
  Badge,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  HStack,
} from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../components/Layout';

interface Photo {
  id: string;
  url: string;
  thumbnail_url?: string;
  uploaded_by?: string;
  approved: boolean;
  event_title: string;
  event_id: string;
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const eventsRes = await fetch('/api/events');
        if (!eventsRes.ok) throw new Error('Failed');
        const events = await eventsRes.json();

        const allPhotos: Photo[] = [];
        for (const event of events.slice(0, 10)) {
          try {
            const res = await fetch(`/api/events/${event.id}/photos`);
            if (res.ok) {
              const eventPhotos = await res.json();
              eventPhotos.forEach((p: any) => {
                allPhotos.push({
                  ...p,
                  event_title: event.title,
                  event_id: event.id,
                });
              });
            }
          } catch (err) {
            console.error(err);
          }
        }
        setPhotos(allPhotos);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <Layout>
      <Box mb={8}>
        <Heading size="lg">Galerie photos</Heading>
        <Text color="gray.600">Toutes les photos de tous les événements</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total photos</StatLabel>
              <StatNumber>{photos.length}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Approuvées</StatLabel>
              <StatNumber color="green.500">{photos.filter(p => p.approved).length}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>En attente</StatLabel>
              <StatNumber color="orange.500">{photos.filter(p => !p.approved).length}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {loading ? (
        <Card>
          <CardBody textAlign="center" py={12}>
            <Spinner size="xl" color="purple.500" />
            <Text mt={4} color="gray.500">Chargement...</Text>
          </CardBody>
        </Card>
      ) : photos.length === 0 ? (
        <Card>
          <CardBody textAlign="center" py={12}>
            <Text color="gray.500">Aucune photo pour le moment</Text>
          </CardBody>
        </Card>
      ) : (
        <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4}>
          {photos.map((photo) => (
            <Card key={photo.id} overflow="hidden">
              <Image
                src={photo.thumbnail_url || photo.url}
                alt={photo.uploaded_by || 'Photo'}
                h="150px"
                objectFit="cover"
              />
              <CardBody p={2}>
                <Text fontSize="xs" color="gray.600" isTruncated>
                  {photo.event_title}
                </Text>
                <Badge size="sm" colorScheme={photo.approved ? 'green' : 'orange'}>
                  {photo.approved ? 'Approuvée' : 'En attente'}
                </Badge>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Layout>
  );
}
