/**
 * Onglet Programme - Déroulé de l'événement
 */
import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Box,
  Card,
  CardBody,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiMove } from 'react-icons/fi';

interface ProgramTabProps {
  data: any;
  onChange: (data: any) => void;
}

const icons = [
  { value: 'church', label: '⛪ Église' },
  { value: 'synagogue', label: '🕍 Synagogue' },
  { value: 'mosque', label: '🕌 Mosquée' },
  { value: 'houppa', label: '💒 Houppa' },
  { value: 'rings', label: '💍 Bagues' },
  { value: 'cocktail', label: '🍸 Cocktail' },
  { value: 'dinner', label: '🍽️ Dîner' },
  { value: 'cake', label: '🎂 Gâteau' },
  { value: 'dance', label: '💃 Danse' },
  { value: 'music', label: '🎵 Musique' },
  { value: 'photo', label: '📸 Photos' },
  { value: 'bus', label: '🚌 Navette' },
  { value: 'fireworks', label: '🎆 Feu d\'artifice' },
  { value: 'party', label: '🎉 Fête' },
  { value: 'brunch', label: '🥐 Brunch' },
  { value: 'speech', label: '🎤 Discours' },
];

export default function ProgramTab({ data, onChange }: ProgramTabProps) {
  const program = data.program || [];
  const locations = data.locations || [];

  const addStep = () => {
    const newStep = {
      time: '',
      title: '',
      subtitle: '',
      icon: 'party',
      location_id: locations[0]?.id || null,
    };
    onChange({
      ...data,
      program: [...program, newStep],
    });
  };

  const updateStep = (index: number, field: string, value: any) => {
    const newProgram = [...program];
    newProgram[index] = { ...newProgram[index], [field]: value };
    onChange({ ...data, program: newProgram });
  };

  const deleteStep = (index: number) => {
    const newProgram = program.filter((_: any, i: number) => i !== index);
    onChange({ ...data, program: newProgram });
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= program.length) return;
    
    const newProgram = [...program];
    [newProgram[index], newProgram[newIndex]] = [newProgram[newIndex], newProgram[index]];
    onChange({ ...data, program: newProgram });
  };

  return (
    <VStack spacing={4} align="stretch">
      <Text color="gray.600" mb={2}>
        Définissez le déroulé de votre événement. Les étapes seront affichées dans l'ordre.
      </Text>

      {program.map((step: any, index: number) => (
        <Card key={index}>
          <CardBody>
            <HStack spacing={4} align="flex-start">
              {/* Contrôles de réorganisation */}
              <VStack spacing={1}>
                <IconButton
                  aria-label="Monter"
                  icon={<Text>↑</Text>}
                  size="xs"
                  variant="ghost"
                  isDisabled={index === 0}
                  onClick={() => moveStep(index, 'up')}
                />
                <Text fontSize="xs" color="gray.500" fontWeight="bold">
                  {index + 1}
                </Text>
                <IconButton
                  aria-label="Descendre"
                  icon={<Text>↓</Text>}
                  size="xs"
                  variant="ghost"
                  isDisabled={index === program.length - 1}
                  onClick={() => moveStep(index, 'down')}
                />
              </VStack>

              {/* Champs */}
              <Box flex={1}>
                <HStack spacing={4} mb={3}>
                  <FormControl w="120px">
                    <FormLabel fontSize="sm">Horaire</FormLabel>
                    <Input
                      type="time"
                      size="sm"
                      value={step.time || ''}
                      onChange={(e) => updateStep(index, 'time', e.target.value)}
                    />
                  </FormControl>

                  <FormControl w="150px">
                    <FormLabel fontSize="sm">Icône</FormLabel>
                    <Select
                      size="sm"
                      value={step.icon || 'party'}
                      onChange={(e) => updateStep(index, 'icon', e.target.value)}
                    >
                      {icons.map((icon) => (
                        <option key={icon.value} value={icon.value}>
                          {icon.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl flex={1}>
                    <FormLabel fontSize="sm">Titre</FormLabel>
                    <Input
                      size="sm"
                      value={step.title || ''}
                      onChange={(e) => updateStep(index, 'title', e.target.value)}
                      placeholder="Ex: Cérémonie religieuse"
                    />
                  </FormControl>
                </HStack>

                <HStack spacing={4}>
                  <FormControl flex={1}>
                    <FormLabel fontSize="sm">Sous-titre</FormLabel>
                    <Input
                      size="sm"
                      value={step.subtitle || ''}
                      onChange={(e) => updateStep(index, 'subtitle', e.target.value)}
                      placeholder="Ex: À la synagogue"
                    />
                  </FormControl>

                  <FormControl w="200px">
                    <FormLabel fontSize="sm">Lieu associé</FormLabel>
                    <Select
                      size="sm"
                      value={step.location_id || ''}
                      onChange={(e) => updateStep(index, 'location_id', e.target.value)}
                    >
                      <option value="">Aucun</option>
                      {locations.map((loc: any) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name || 'Sans nom'}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>
              </Box>

              {/* Bouton supprimer */}
              <IconButton
                aria-label="Supprimer"
                icon={<FiTrash2 />}
                variant="ghost"
                colorScheme="red"
                onClick={() => deleteStep(index)}
              />
            </HStack>
          </CardBody>
        </Card>
      ))}

      <Button
        leftIcon={<FiPlus />}
        variant="outline"
        colorScheme="blue"
        onClick={addStep}
      >
        Ajouter une étape
      </Button>
    </VStack>
  );
}
