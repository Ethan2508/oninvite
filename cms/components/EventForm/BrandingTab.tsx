/**
 * Onglet Branding - Couleurs, logos et style
 */
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  HStack,
  Box,
  Text,
  Button,
  SimpleGrid,
  Image,
} from '@chakra-ui/react';
import { FiUpload } from 'react-icons/fi';
import ImageUpload from '../ImageUpload';

interface BrandingTabProps {
  data: any;
  onChange: (data: any) => void;
}

const colorFields = [
  { key: 'primary', label: 'Couleur primaire', default: '#D4AF37' },
  { key: 'secondary', label: 'Couleur secondaire', default: '#1A1A2E' },
  { key: 'accent', label: 'Accent', default: '#F5E6CC' },
  { key: 'background', label: 'Fond', default: '#FFFFFF' },
  { key: 'text', label: 'Texte', default: '#333333' },
  { key: 'text_light', label: 'Texte clair', default: '#FFFFFF' },
];

const fonts = [
  'Playfair Display',
  'Lato',
  'Montserrat',
  'Open Sans',
  'Roboto',
  'Dancing Script',
  'Great Vibes',
  'Cormorant Garamond',
];

const styles = [
  { value: 'elegant', label: 'Élégant' },
  { value: 'modern', label: 'Moderne' },
  { value: 'rustic', label: 'Rustique' },
  { value: 'minimalist', label: 'Minimaliste' },
  { value: 'romantic', label: 'Romantique' },
  { value: 'festive', label: 'Festif' },
];

export default function BrandingTab({ data, onChange }: BrandingTabProps) {
  const handleBrandingChange = (field: string, value: any) => {
    onChange({
      ...data,
      branding: { ...data.branding, [field]: value },
    });
  };

  const handleColorChange = (colorKey: string, value: string) => {
    onChange({
      ...data,
      branding: {
        ...data.branding,
        colors: { ...data.branding?.colors, [colorKey]: value },
      },
    });
  };

  const handleFontChange = (fontKey: string, value: string) => {
    onChange({
      ...data,
      branding: {
        ...data.branding,
        fonts: { ...data.branding?.fonts, [fontKey]: value },
      },
    });
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Nom de l'app */}
      <FormControl>
        <FormLabel>Nom de l'application</FormLabel>
        <Input
          value={data.branding?.app_name || ''}
          onChange={(e) => handleBrandingChange('app_name', e.target.value)}
          placeholder="Ex: Marie & Jean"
        />
      </FormControl>

      {/* Style */}
      <FormControl>
        <FormLabel>Style visuel</FormLabel>
        <Select
          value={data.branding?.style || 'elegant'}
          onChange={(e) => handleBrandingChange('style', e.target.value)}
        >
          {styles.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </Select>
      </FormControl>

      {/* Couleurs */}
      <Box>
        <Text fontWeight="semibold" mb={4}>Couleurs</Text>
        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
          {colorFields.map((color) => (
            <FormControl key={color.key}>
              <FormLabel fontSize="sm">{color.label}</FormLabel>
              <HStack>
                <Input
                  type="color"
                  value={data.branding?.colors?.[color.key] || color.default}
                  onChange={(e) => handleColorChange(color.key, e.target.value)}
                  w="60px"
                  h="40px"
                  p={1}
                  cursor="pointer"
                />
                <Input
                  value={data.branding?.colors?.[color.key] || color.default}
                  onChange={(e) => handleColorChange(color.key, e.target.value)}
                  size="sm"
                  fontFamily="mono"
                />
              </HStack>
            </FormControl>
          ))}
        </SimpleGrid>
      </Box>

      {/* Polices */}
      <Box>
        <Text fontWeight="semibold" mb={4}>Polices</Text>
        <HStack spacing={4}>
          <FormControl flex={1}>
            <FormLabel>Titres</FormLabel>
            <Select
              value={data.branding?.fonts?.heading || 'Playfair Display'}
              onChange={(e) => handleFontChange('heading', e.target.value)}
            >
              {fonts.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl flex={1}>
            <FormLabel>Corps de texte</FormLabel>
            <Select
              value={data.branding?.fonts?.body || 'Lato'}
              onChange={(e) => handleFontChange('body', e.target.value)}
            >
              {fonts.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </Select>
          </FormControl>
        </HStack>
      </Box>

      {/* Images */}
      <Box>
        <Text fontWeight="semibold" mb={4}>Images</Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <ImageUpload
            label="Logo"
            value={data.branding?.logo_url || ''}
            onChange={(url) => handleBrandingChange('logo_url', url)}
            folder="logos"
            eventId={data.id}
            previewHeight="100px"
          />

          <ImageUpload
            label="Icône (1024x1024)"
            value={data.branding?.icon_url || ''}
            onChange={(url) => handleBrandingChange('icon_url', url)}
            folder="icons"
            eventId={data.id}
            previewHeight="100px"
          />

          <ImageUpload
            label="Splash screen"
            value={data.branding?.splash_url || ''}
            onChange={(url) => handleBrandingChange('splash_url', url)}
            folder="splash"
            eventId={data.id}
            previewHeight="140px"
          />

          <ImageUpload
            label="Image de fond"
            value={data.branding?.background_image_url || ''}
            onChange={(url) => handleBrandingChange('background_image_url', url)}
            folder="backgrounds"
            eventId={data.id}
            previewHeight="140px"
          />
        </SimpleGrid>
      </Box>

      {/* Vidéo d'intro */}
      <ImageUpload
        label="Vidéo d'introduction (optionnel)"
        value={data.branding?.video_intro_url || ''}
        onChange={(url) => handleBrandingChange('video_intro_url', url)}
        accept="video/*"
        folder="videos"
        eventId={data.id}
        assetType="video"
        previewHeight="160px"
      />
    </VStack>
  );
}
