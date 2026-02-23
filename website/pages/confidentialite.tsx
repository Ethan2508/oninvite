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
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';

export default function Confidentialite() {
  return (
    <>
      <Head>
        <title>Politique de confidentialité | Oninvite</title>
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
            Politique de confidentialité
          </Heading>
          
          <Text color="gray.600">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </Text>

          <VStack spacing={4} align="stretch">
            <Heading size="md">1. Collecte des données</Heading>
            <Text color="gray.600">
              Nous collectons les données suivantes dans le cadre de nos services :
            </Text>
            <UnorderedList color="gray.600" pl={4}>
              <ListItem>Nom et prénom</ListItem>
              <ListItem>Adresse email</ListItem>
              <ListItem>Numéro de téléphone (optionnel)</ListItem>
              <ListItem>Informations relatives à votre événement</ListItem>
              <ListItem>Photos uploadées sur la plateforme</ListItem>
            </UnorderedList>
          </VStack>

          <VStack spacing={4} align="stretch">
            <Heading size="md">2. Utilisation des données</Heading>
            <Text color="gray.600">
              Vos données sont utilisées pour :
            </Text>
            <UnorderedList color="gray.600" pl={4}>
              <ListItem>Créer et gérer votre application événementielle</ListItem>
              <ListItem>Envoyer des notifications aux invités</ListItem>
              <ListItem>Améliorer nos services</ListItem>
              <ListItem>Vous contacter concernant votre compte</ListItem>
            </UnorderedList>
          </VStack>

          <VStack spacing={4} align="stretch">
            <Heading size="md">3. Protection des données</Heading>
            <Text color="gray.600">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles 
              appropriées pour protéger vos données personnelles contre tout accès non autorisé, 
              modification, divulgation ou destruction.
            </Text>
          </VStack>

          <VStack spacing={4} align="stretch">
            <Heading size="md">4. Conservation des données</Heading>
            <Text color="gray.600">
              Vos données sont conservées pendant la durée de votre événement et 
              jusqu'à 12 mois après, sauf demande de suppression de votre part.
            </Text>
          </VStack>

          <VStack spacing={4} align="stretch">
            <Heading size="md">5. Vos droits</Heading>
            <Text color="gray.600">
              Conformément au RGPD, vous disposez des droits suivants :
            </Text>
            <UnorderedList color="gray.600" pl={4}>
              <ListItem>Droit d'accès à vos données</ListItem>
              <ListItem>Droit de rectification</ListItem>
              <ListItem>Droit à l'effacement</ListItem>
              <ListItem>Droit à la portabilité</ListItem>
              <ListItem>Droit d'opposition</ListItem>
            </UnorderedList>
            <Text color="gray.600">
              Pour exercer ces droits, contactez-nous à : privacy@oninvite.fr
            </Text>
          </VStack>

          <VStack spacing={4} align="stretch">
            <Heading size="md">6. Cookies</Heading>
            <Text color="gray.600">
              Notre site utilise des cookies essentiels au fonctionnement du service 
              et des cookies analytiques pour améliorer votre expérience. 
              Vous pouvez paramétrer vos préférences dans les paramètres de votre navigateur.
            </Text>
          </VStack>

          <VStack spacing={4} align="stretch">
            <Heading size="md">7. Contact</Heading>
            <Text color="gray.600">
              Pour toute question relative à cette politique, contactez-nous :<br />
              Email : privacy@oninvite.fr<br />
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
