/**
 * Onglet Lieux - Gestion des lieux de l'événement
 */
import { useState } from 'react';
import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  IconButton,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface LocationsTabProps {
  data: any;
  onChange: (data: any) => void;
}

const locationTypes = [
  { value: 'ceremony', label: 'Cérémonie' },
  { value: 'reception', label: 'Réception' },
  { value: 'party', label: 'Soirée' },
  { value: 'brunch', label: 'Brunch' },
  { value: 'other', label: 'Autre' },
];

interface LocationCardProps {
  location: any;
  index: number;
  onUpdate: (index: number, location: any) => void;
  onDelete: (index: number) => void;
}

function LocationCard({ location, index, onUpdate, onDelete }: LocationCardProps) {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

  const handleChange = (field: string, value: any) => {
    onUpdate(index, { ...location, [field]: value });
  };

  return (
    <Card>
      <CardHeader pb={2}>
        <HStack justify="space-between">
          <HStack>
            <IconButton
              aria-label="Toggle"
              icon={isOpen ? <FiChevronUp /> : <FiChevronDown />}
              variant="ghost"
              size="sm"
              onClick={onToggle}
            />
            <Heading size="sm">
              {location.name || `Lieu ${index + 1}`}
            </Heading>
          </HStack>
          <IconButton
            aria-label="Supprimer"
            icon={<FiTrash2 />}
            variant="ghost"
            colorScheme="red"
            size="sm"
            onClick={() => onDelete(index)}
          />
        </HStack>
      </CardHeader>

      <Collapse in={isOpen}>
        <CardBody pt={0}>
          <VStack spacing={4} align="stretch">
            <HStack spacing={4}>
              <FormControl isRequired flex={2}>
                <FormLabel>Nom du lieu</FormLabel>
                <Input
                  value={location.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ex: Château de Versainville"
                />
              </FormControl>

              <FormControl isRequired flex={1}>
                <FormLabel>Type</FormLabel>
                <Select
                  value={location.type || 'ceremony'}
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  {locationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </HStack>

            <FormControl isRequired>
              <FormLabel>Adresse</FormLabel>
              <Input
                value={location.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Ex: 14 Rue du Château, 75000 Paris"
              />
            </FormControl>

            <HStack spacing={4}>
              <FormControl flex={1}>
                <FormLabel>Latitude</FormLabel>
                <Input
                  type="number"
                  step="0.0001"
                  value={location.latitude || ''}
                  onChange={(e) => handleChange('latitude', parseFloat(e.target.value))}
                  placeholder="48.8566"
                />
              </FormControl>

              <FormControl flex={1}>
                <FormLabel>Longitude</FormLabel>
                <Input
                  type="number"
                  step="0.0001"
                  value={location.longitude || ''}
                  onChange={(e) => handleChange('longitude', parseFloat(e.target.value))}
                  placeholder="2.3522"
                />
              </FormControl>

              <FormControl flex={1}>
                <FormLabel>Horaire</FormLabel>
                <Input
                  type="time"
                  value={location.time || ''}
                  onChange={(e) => handleChange('time', e.target.value)}
                />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Notes / Instructions</FormLabel>
              <Textarea
                value={location.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Ex: Merci d'arriver 15 minutes en avance"
                rows={2}
              />
            </FormControl>

            <HStack spacing={4}>
              <FormControl flex={1}>
                <FormLabel>Infos parking</FormLabel>
                <Input
                  value={location.parking_info || ''}
                  onChange={(e) => handleChange('parking_info', e.target.value)}
                  placeholder="Ex: Parking gratuit sur place"
                />
              </FormControl>

              <FormControl flex={1}>
                <FormLabel>Dress code</FormLabel>
                <Input
                  value={location.dress_code || ''}
                  onChange={(e) => handleChange('dress_code', e.target.value)}
                  placeholder="Ex: Tenue de soirée"
                />
              </FormControl>
            </HStack>
          </VStack>
        </CardBody>
      </Collapse>
    </Card>
  );
}

export default function LocationsTab({ data, onChange }: LocationsTabProps) {
  const locations = data.locations || [];

  const addLocation = () => {
    const newLocation = {
      id: `loc_${Date.now()}`,
      name: '',
      type: 'ceremony',
      address: '',
      latitude: null,
      longitude: null,
      time: '',
      notes: '',
      parking_info: '',
      dress_code: '',
    };
    onChange({
      ...data,
      locations: [...locations, newLocation],
    });
  };

  const updateLocation = (index: number, location: any) => {
    const newLocations = [...locations];
    newLocations[index] = location;
    onChange({ ...data, locations: newLocations });
  };

  const deleteLocation = (index: number) => {
    const newLocations = locations.filter((_: any, i: number) => i !== index);
    onChange({ ...data, locations: newLocations });
  };

  return (
    <VStack spacing={4} align="stretch">
      {locations.map((location: any, index: number) => (
        <LocationCard
          key={location.id || index}
          location={location}
          index={index}
          onUpdate={updateLocation}
          onDelete={deleteLocation}
        />
      ))}

      <Button
        leftIcon={<FiPlus />}
        variant="outline"
        colorScheme="blue"
        onClick={addLocation}
      >
        Ajouter un lieu
      </Button>
    </VStack>
  );
}
