/**
 * Composant d'upload d'images avec preview
 */
import { useState, useRef, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Image,
  Input,
  Button,
  Text,
  IconButton,
  Spinner,
  useToast,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Progress,
} from '@chakra-ui/react';
import { FiUpload, FiLink, FiX, FiImage, FiVideo } from 'react-icons/fi';

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  placeholder?: string;
  previewHeight?: string;
  eventId?: string;
  folder?: string;
  assetType?: 'image' | 'icon' | 'video';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.oninvite.fr';

export default function ImageUpload({
  label,
  value,
  onChange,
  accept = 'image/*',
  placeholder = 'URL de l\'image ou glissez un fichier',
  previewHeight = '120px',
  eventId,
  folder = 'assets',
  assetType = 'image',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('asset_type', assetType);
      if (eventId) {
        formData.append('event_id', eventId);
      }

      // Simuler la progression
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erreur lors de l\'upload');
      }

      const data = await response.json();
      onChange(data.url);

      toast({
        title: 'Upload réussi',
        description: data.simulated
          ? 'Mode simulation - configurez Cloudinary pour un vrai upload'
          : 'Fichier uploadé avec succès',
        status: data.simulated ? 'info' : 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Erreur d\'upload',
        description: error instanceof Error ? error.message : 'Erreur inconnue',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const clearValue = () => {
    onChange('');
  };

  const isVideo = assetType === 'video' || value?.match(/\.(mp4|webm|mov)$/i);

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <VStack spacing={3} align="stretch">
        {/* Zone de drop / Preview */}
        <Box
          position="relative"
          borderWidth={2}
          borderStyle="dashed"
          borderColor={isDragOver ? 'blue.400' : value ? 'green.200' : 'gray.200'}
          borderRadius="md"
          bg={isDragOver ? 'blue.50' : value ? 'gray.50' : 'white'}
          minH={previewHeight}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          cursor="pointer"
          onClick={() => !isUploading && fileInputRef.current?.click()}
          transition="all 0.2s"
          _hover={{ borderColor: 'blue.300', bg: 'blue.50' }}
        >
          {isUploading ? (
            <VStack justify="center" h={previewHeight} spacing={2}>
              <Spinner color="blue.500" />
              <Text fontSize="sm" color="gray.500">
                Upload en cours...
              </Text>
              <Progress
                value={uploadProgress}
                size="sm"
                colorScheme="blue"
                w="80%"
                borderRadius="full"
              />
            </VStack>
          ) : value ? (
            <Box position="relative" h={previewHeight}>
              {isVideo ? (
                <video
                  src={value}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: '6px',
                  }}
                  controls={false}
                  muted
                />
              ) : (
                <Image
                  src={value}
                  alt={label}
                  objectFit="contain"
                  w="100%"
                  h="100%"
                  borderRadius="md"
                  fallback={
                    <VStack justify="center" h="100%">
                      <FiImage size={24} color="gray" />
                      <Text fontSize="xs" color="gray.500">
                        Aperçu indisponible
                      </Text>
                    </VStack>
                  }
                />
              )}
              <IconButton
                aria-label="Supprimer"
                icon={<FiX />}
                size="sm"
                colorScheme="red"
                position="absolute"
                top={2}
                right={2}
                onClick={(e) => {
                  e.stopPropagation();
                  clearValue();
                }}
              />
            </Box>
          ) : (
            <VStack justify="center" h={previewHeight} spacing={2}>
              {assetType === 'video' ? (
                <FiVideo size={32} color="#A0AEC0" />
              ) : (
                <FiUpload size={32} color="#A0AEC0" />
              )}
              <Text fontSize="sm" color="gray.500" textAlign="center" px={4}>
                Glissez un fichier ou cliquez pour sélectionner
              </Text>
            </VStack>
          )}
        </Box>

        {/* Input URL manuel */}
        <InputGroup size="sm">
          <InputLeftElement>
            <FiLink color="gray" />
          </InputLeftElement>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            pl={8}
          />
        </InputGroup>

        {/* Input file caché */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </VStack>
    </FormControl>
  );
}
