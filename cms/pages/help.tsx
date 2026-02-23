/**
 * Page globale - Aide
 */
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Link,
  Icon,
  SimpleGrid,
  Button,
} from '@chakra-ui/react';
import { ExternalLinkIcon, EmailIcon, PhoneIcon, ChatIcon } from '@chakra-ui/icons';
import Layout from '../components/Layout';

const faqs = [
  {
    question: 'Comment créer un nouvel événement ?',
    answer:
      'Cliquez sur "Nouvel événement" dans le dashboard. Remplissez les informations de base (titre, date, lieu) puis personnalisez les détails dans les onglets dédiés.',
  },
  {
    question: 'Comment importer une liste d\'invités ?',
    answer:
      'Dans la page "Invités" d\'un événement, cliquez sur "Importer CSV". Téléchargez le template, remplissez-le avec vos invités, puis uploadez le fichier.',
  },
  {
    question: 'Comment fonctionnent les groupes d\'invitation ?',
    answer:
      'Les groupes permettent de définir à quels sous-événements chaque invité est convié. Par exemple "Full Invitation" = tous les moments, "Cérémonie + Soirée" = sans le vin d\'honneur. Créez vos groupes et assignez-les aux invités.',
  },
  {
    question: 'Comment envoyer des notifications push ?',
    answer:
      'Dans l\'onglet "Notifications" de l\'événement, créez une nouvelle notification avec titre et message. Vous pouvez l\'envoyer immédiatement ou la programmer.',
  },
  {
    question: 'Comment gérer la galerie photo ?',
    answer:
      'Les invités uploadent leurs photos via l\'app mobile. Dans "Photos", vous pouvez approuver/rejeter les photos, les télécharger ou les supprimer.',
  },
  {
    question: 'Comment configurer la cagnotte ?',
    answer:
      'Dans l\'onglet "Cagnotte" de l\'événement, activez la fonctionnalité et ajoutez votre lien de paiement (PayPal, Leetchi, etc.). Les invités verront le bouton dans l\'app.',
  },
  {
    question: 'Comment générer l\'application mobile ?',
    answer:
      'L\'app est générée automatiquement avec les informations de l\'événement. Utilisez le script de build EAS pour créer les fichiers iOS et Android.',
  },
  {
    question: 'Comment modérer le livre d\'or ?',
    answer:
      'Dans "Livre d\'or", vous voyez tous les messages. Approuvez les messages appropriés pour qu\'ils s\'affichent dans l\'app des invités.',
  },
];

export default function HelpPage() {
  return (
    <Layout>
      <Box mb={8}>
        <Heading size="lg">Aide & Support</Heading>
        <Text color="gray.600">Documentation et assistance</Text>
      </Box>

      {/* Quick Links */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <VStack spacing={4}>
              <Icon as={EmailIcon} boxSize={8} color="purple.500" />
              <Heading size="sm">Email</Heading>
              <Text color="gray.600" textAlign="center">
                support@oninvite.fr
              </Text>
              <Button
                as="a"
                href="mailto:support@oninvite.fr"
                colorScheme="purple"
                variant="outline"
                size="sm"
              >
                Contacter
              </Button>
            </VStack>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <VStack spacing={4}>
              <Icon as={PhoneIcon} boxSize={8} color="purple.500" />
              <Heading size="sm">Téléphone</Heading>
              <Text color="gray.600" textAlign="center">
                +33 1 23 45 67 89
              </Text>
              <Button
                as="a"
                href="tel:+33123456789"
                colorScheme="purple"
                variant="outline"
                size="sm"
              >
                Appeler
              </Button>
            </VStack>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <VStack spacing={4}>
              <Icon as={ChatIcon} boxSize={8} color="purple.500" />
              <Heading size="sm">Chat</Heading>
              <Text color="gray.600" textAlign="center">
                Assistance en direct
              </Text>
              <Button colorScheme="purple" variant="outline" size="sm">
                Démarrer chat
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* FAQ */}
      <Card mb={8}>
        <CardHeader>
          <Heading size="md">Questions fréquentes</Heading>
        </CardHeader>
        <CardBody>
          <Accordion allowMultiple>
            {faqs.map((faq, index) => (
              <AccordionItem key={index}>
                <h2>
                  <AccordionButton py={4}>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      {faq.question}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} color="gray.600">
                  {faq.answer}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </CardBody>
      </Card>

      {/* Documentation Links */}
      <Card>
        <CardHeader>
          <Heading size="md">Documentation</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md">
              <Text>Guide de démarrage rapide</Text>
              <Link href="#" color="purple.600" isExternal>
                Voir <ExternalLinkIcon mx="2px" />
              </Link>
            </HStack>
            <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md">
              <Text>Documentation API</Text>
              <Link href="https://api.oninvite.fr/docs" color="purple.600" isExternal>
                Voir <ExternalLinkIcon mx="2px" />
              </Link>
            </HStack>
            <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md">
              <Text>Tutoriels vidéo</Text>
              <Link href="#" color="purple.600" isExternal>
                Voir <ExternalLinkIcon mx="2px" />
              </Link>
            </HStack>
            <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md">
              <Text>Changelog / Mises à jour</Text>
              <Link href="#" color="purple.600" isExternal>
                Voir <ExternalLinkIcon mx="2px" />
              </Link>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Layout>
  );
}
