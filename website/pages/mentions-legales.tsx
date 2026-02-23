import Head from 'next/head';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Link,
  Flex,
  HStack,
} from '@chakra-ui/react';

export default function MentionsLegales() {
  return (
    <>
      <Head>
        <title>Mentions légales | Oninvite</title>
      </Head>

      {/* Navigation */}
      <Box as="nav" py={4} borderBottom="1px" borderColor="gray.100">
        <Container maxW="container.xl">
          <Link href="/">
            <Heading size="md" fontFamily="heading" color="brand.500">
              Oninvite
            </Heading>
          </Link>
        </Container>
      </Box>

      <Container maxW="container.md" py={16}>
        <VStack spacing={8} align="stretch">
          <Heading size="xl" fontFamily="heading">
            Mentions légales
          </Heading>

          <VStack spacing={4} align="stretch">
            <Heading size="md">Éditeur du site</Heading>
            <Text>
              Oninvite SAS<br />
              Capital social : 10 000 €<br />
              Siège social : Paris, France<br />
              RCS Paris : XXX XXX XXX<br />
              N° TVA : FR XX XXX XXX XXX
            </Text>
          </VStack>

          <VStack spacing={4} align="stretch">
            <Heading size="md">Directeur de la publication</Heading>
            <Text>
              [Nom du directeur de publication]<br />
              contact@oninvite.fr
            </Text>
          </VStack>

          <VStack spacing={4} align="stretch">
            <Heading size="md">Hébergement</Heading>
            <Text>
              Vercel Inc.<br />
              340 S Lemon Ave #4133<br />
              Walnut, CA 91789, USA<br />
              https://vercel.com
            </Text>
          </VStack>

          <VStack spacing={4} align="stretch">
            <Heading size="md">Propriété intellectuelle</Heading>
            <Text color="gray.600">
              L'ensemble du contenu de ce site (textes, images, logos, icônes, etc.) est la propriété 
              exclusive de Oninvite ou de ses partenaires. Toute reproduction, représentation, 
              modification, publication, adaptation de tout ou partie du contenu du site, 
              quel que soit le moyen ou le procédé utilisé, est interdite.
            </Text>
          </VStack>

          <VStack spacing={4} align="stretch">
            <Heading size="md">Contact</Heading>
            <Text>
              Email : contact@oninvite.fr<br />
              Adresse : Paris, France
            </Text>
          </VStack>
        </VStack>
      </Container>

      {/* Footer */}
      <Box as="footer" py={8} bg="gray.50" mt={16}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <HStack spacing={2}>
              <Heading size="sm" fontFamily="heading" color="brand.500">
                Oninvite
              </Heading>
              <Text color="gray.500" fontSize="sm">© {new Date().getFullYear()}</Text>
            </HStack>
            <Link href="/" color="gray.600" fontSize="sm">
              Retour à l'accueil
            </Link>
          </Flex>
        </Container>
      </Box>
    </>
  );
}
