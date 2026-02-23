import Head from 'next/head';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  HStack,
  VStack,
  SimpleGrid,
  Icon,
  Image,
  Link,
  Badge,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FiSmartphone,
  FiUsers,
  FiImage,
  FiCalendar,
  FiBell,
  FiHeart,
  FiCheck,
  FiArrowRight,
  FiStar,
  FiMail,
} from 'react-icons/fi';
import { SiApple, SiGoogleplay } from 'react-icons/si';

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);

// Features data
const features = [
  {
    icon: FiSmartphone,
    title: 'Application personnalisée',
    description: 'Une app unique à votre image avec vos couleurs, vos photos et votre histoire.',
  },
  {
    icon: FiUsers,
    title: 'Gestion des invités',
    description: 'RSVPs en temps réel, groupes d\'invitation, suivi des confirmations.',
  },
  {
    icon: FiCalendar,
    title: 'Programme détaillé',
    description: 'Tous les moments de votre événement avec horaires et lieux.',
  },
  {
    icon: FiImage,
    title: 'Galerie photo partagée',
    description: 'Vos invités uploadent leurs photos directement dans l\'app.',
  },
  {
    icon: FiBell,
    title: 'Notifications push',
    description: 'Envoyez des rappels et annonces à tous vos invités instantanément.',
  },
  {
    icon: FiHeart,
    title: 'Livre d\'or digital',
    description: 'Collectez les messages et vœux de vos proches pour toujours.',
  },
];

// Pricing data
const pricingPlans = [
  {
    name: 'Essentiel',
    price: '299',
    features: [
      'Application iOS & Android',
      'Jusqu\'à 100 invités',
      'Programme de l\'événement',
      'RSVPs en ligne',
      'Support email',
    ],
    popular: false,
  },
  {
    name: 'Premium',
    price: '499',
    features: [
      'Tout de Essentiel +',
      'Invités illimités',
      'Galerie photo partagée',
      'Notifications push',
      'Livre d\'or digital',
      'Support prioritaire',
    ],
    popular: true,
  },
  {
    name: 'Sur-mesure',
    price: 'Sur devis',
    features: [
      'Tout de Premium +',
      'Design 100% personnalisé',
      'Fonctionnalités sur-mesure',
      'Accompagnement dédié',
      'Gestion complète',
    ],
    popular: false,
  },
];

// Testimonials
const testimonials = [
  {
    name: 'Sarah & David',
    event: 'Mariage',
    text: 'Une application magnifique qui a impressionné tous nos invités. Le must-have du mariage moderne !',
    rating: 5,
  },
  {
    name: 'Famille Cohen',
    event: 'Bar Mitzvah',
    text: 'Parfait pour notre événement multiculturel. La gestion des groupes d\'invitation est géniale.',
    rating: 5,
  },
  {
    name: 'Emma & Lucas',
    event: 'Mariage',
    text: 'Nos invités ont adoré pouvoir partager leurs photos sur l\'app. Un souvenir unique !',
    rating: 5,
  },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Oninvite | L'application personnalisée pour vos événements</title>
        <meta
          name="description"
          content="Créez une application unique pour votre mariage, bar mitzvah ou tout événement. Invitations digitales, RSVPs, galerie photo et plus."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Navigation */}
      <Box
        as="nav"
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={100}
        bg="rgba(255,255,255,0.95)"
        backdropFilter="blur(10px)"
        borderBottom="1px"
        borderColor="gray.100"
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" py={4}>
            <Heading size="md" fontFamily="heading" color="brand.500">
              Oninvite
            </Heading>
            <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
              <Link href="#fonctionnalites" fontWeight="medium" _hover={{ color: 'brand.500' }}>
                Fonctionnalités
              </Link>
              <Link href="#tarifs" fontWeight="medium" _hover={{ color: 'brand.500' }}>
                Tarifs
              </Link>
              <Link href="#temoignages" fontWeight="medium" _hover={{ color: 'brand.500' }}>
                Témoignages
              </Link>
            </HStack>
            <HStack spacing={4}>
              <Button
                as="a"
                href="https://dashboard.oninvite.fr"
                variant="outline"
                size="sm"
                colorScheme="gray"
              >
                Connexion
              </Button>
              <Button
                as="a"
                href="#contact"
                size="sm"
                bg="brand.500"
                color="white"
                _hover={{ bg: 'brand.600' }}
              >
                Demander un devis
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        as="section"
        pt={{ base: 32, md: 40 }}
        pb={{ base: 20, md: 32 }}
        bg="linear-gradient(180deg, #FFFBF0 0%, #FFFFFF 100%)"
      >
        <Container maxW="container.xl">
          <Flex
            direction={{ base: 'column', lg: 'row' }}
            align="center"
            justify="space-between"
            gap={12}
          >
            <VStack align={{ base: 'center', lg: 'flex-start' }} spacing={6} maxW="600px">
              <Badge colorScheme="orange" px={3} py={1} borderRadius="full" fontSize="sm">
                ✨ Application événementielle
              </Badge>
              <MotionHeading
                as="h1"
                size="3xl"
                fontFamily="heading"
                fontWeight="600"
                lineHeight="1.2"
                textAlign={{ base: 'center', lg: 'left' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Votre événement mérite{' '}
                <Text as="span" color="brand.500">
                  son application
                </Text>
              </MotionHeading>
              <Text
                fontSize="xl"
                color="gray.600"
                textAlign={{ base: 'center', lg: 'left' }}
                maxW="500px"
              >
                Créez une expérience digitale unique pour vos invités. Mariage, bar mitzvah, 
                anniversaire — impressionnez avec une app personnalisée.
              </Text>
              <HStack spacing={4} pt={4}>
                <Button
                  as="a"
                  href="#contact"
                  size="lg"
                  bg="brand.500"
                  color="white"
                  px={8}
                  _hover={{ bg: 'brand.600', transform: 'translateY(-2px)' }}
                  rightIcon={<FiArrowRight />}
                >
                  Commencer
                </Button>
                <Button
                  as="a"
                  href="#demo"
                  size="lg"
                  variant="outline"
                  px={8}
                >
                  Voir la démo
                </Button>
              </HStack>
              <HStack spacing={6} pt={6}>
                <HStack>
                  <Icon as={SiApple} boxSize={6} />
                  <Text fontSize="sm" color="gray.600">App Store</Text>
                </HStack>
                <HStack>
                  <Icon as={SiGoogleplay} boxSize={5} />
                  <Text fontSize="sm" color="gray.600">Play Store</Text>
                </HStack>
              </HStack>
            </VStack>

            {/* Phone Mockup */}
            <MotionBox
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Box
                w={{ base: '280px', md: '320px' }}
                h={{ base: '560px', md: '640px' }}
                bg="gray.900"
                borderRadius="3xl"
                p={3}
                boxShadow="2xl"
                position="relative"
              >
                <Box
                  w="full"
                  h="full"
                  bg="linear-gradient(135deg, #D4AF37 0%, #B8942F 100%)"
                  borderRadius="2xl"
                  overflow="hidden"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  p={6}
                >
                  <Heading
                    color="white"
                    fontFamily="heading"
                    fontSize="3xl"
                    textAlign="center"
                    mb={4}
                  >
                    Sarah & David
                  </Heading>
                  <Text color="white" fontSize="lg" opacity={0.9} textAlign="center">
                    Nous nous marions !
                  </Text>
                  <Text color="white" fontSize="md" opacity={0.8} mt={2}>
                    15 Juin 2026
                  </Text>
                  <VStack spacing={3} mt={8} w="full">
                    <Button w="full" bg="white" color="brand.600" size="lg">
                      Confirmer ma présence
                    </Button>
                    <Button w="full" variant="outline" borderColor="white" color="white" size="lg">
                      Voir le programme
                    </Button>
                  </VStack>
                </Box>
              </Box>
            </MotionBox>
          </Flex>
        </Container>
      </Box>

      {/* Features Section */}
      <Box as="section" id="fonctionnalites" py={{ base: 16, md: 24 }}>
        <Container maxW="container.xl">
          <VStack spacing={4} mb={16} textAlign="center">
            <Heading size="xl" fontFamily="heading">
              Tout ce dont vous avez besoin
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="600px">
              Une suite complète de fonctionnalités pour gérer votre événement 
              et offrir une expérience mémorable à vos invités.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {features.map((feature, i) => (
              <Card
                key={i}
                variant="outline"
                _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                transition="all 0.2s"
              >
                <CardBody>
                  <VStack align="flex-start" spacing={4}>
                    <Box
                      p={3}
                      bg="brand.50"
                      borderRadius="lg"
                    >
                      <Icon as={feature.icon} boxSize={6} color="brand.500" />
                    </Box>
                    <Heading size="md">{feature.title}</Heading>
                    <Text color="gray.600">{feature.description}</Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box as="section" id="tarifs" py={{ base: 16, md: 24 }} bg="gray.50">
        <Container maxW="container.xl">
          <VStack spacing={4} mb={16} textAlign="center">
            <Heading size="xl" fontFamily="heading">
              Des formules adaptées à vos besoins
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="600px">
              Choisissez la formule qui correspond à votre événement. 
              Prix tout compris, sans frais cachés.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} maxW="1000px" mx="auto">
            {pricingPlans.map((plan, i) => (
              <Card
                key={i}
                variant={plan.popular ? 'filled' : 'outline'}
                bg={plan.popular ? 'brand.500' : 'white'}
                transform={plan.popular ? 'scale(1.05)' : 'none'}
                position="relative"
              >
                {plan.popular && (
                  <Badge
                    position="absolute"
                    top={-3}
                    left="50%"
                    transform="translateX(-50%)"
                    bg="dark.500"
                    color="white"
                    px={4}
                    py={1}
                    borderRadius="full"
                  >
                    Le plus populaire
                  </Badge>
                )}
                <CardBody py={8}>
                  <VStack spacing={6}>
                    <Heading
                      size="md"
                      color={plan.popular ? 'white' : 'gray.900'}
                    >
                      {plan.name}
                    </Heading>
                    <HStack align="baseline">
                      <Heading
                        size="3xl"
                        color={plan.popular ? 'white' : 'gray.900'}
                      >
                        {plan.price}
                      </Heading>
                      {plan.price !== 'Sur devis' && (
                        <Text
                          fontSize="lg"
                          color={plan.popular ? 'whiteAlpha.800' : 'gray.500'}
                        >
                          €
                        </Text>
                      )}
                    </HStack>
                    <VStack spacing={3} align="stretch" w="full">
                      {plan.features.map((feature, j) => (
                        <HStack key={j}>
                          <Icon
                            as={FiCheck}
                            color={plan.popular ? 'white' : 'green.500'}
                          />
                          <Text
                            fontSize="sm"
                            color={plan.popular ? 'whiteAlpha.900' : 'gray.600'}
                          >
                            {feature}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                    <Button
                      as="a"
                      href="#contact"
                      w="full"
                      bg={plan.popular ? 'white' : 'brand.500'}
                      color={plan.popular ? 'brand.500' : 'white'}
                      _hover={{
                        bg: plan.popular ? 'gray.100' : 'brand.600',
                      }}
                    >
                      Choisir
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box as="section" id="temoignages" py={{ base: 16, md: 24 }}>
        <Container maxW="container.xl">
          <VStack spacing={4} mb={16} textAlign="center">
            <Heading size="xl" fontFamily="heading">
              Ils nous font confiance
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="600px">
              Découvrez les retours de nos clients qui ont créé leur application avec Oninvite.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            {testimonials.map((testimonial, i) => (
              <Card key={i} variant="outline">
                <CardBody>
                  <VStack align="flex-start" spacing={4}>
                    <HStack>
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Icon key={j} as={FiStar} color="brand.500" fill="brand.500" />
                      ))}
                    </HStack>
                    <Text color="gray.600" fontStyle="italic">
                      "{testimonial.text}"
                    </Text>
                    <Box>
                      <Text fontWeight="bold">{testimonial.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {testimonial.event}
                      </Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        as="section"
        id="contact"
        py={{ base: 16, md: 24 }}
        bg="linear-gradient(135deg, #D4AF37 0%, #B8942F 100%)"
      >
        <Container maxW="container.md" textAlign="center">
          <VStack spacing={6}>
            <Heading size="xl" fontFamily="heading" color="white">
              Prêt à créer votre application ?
            </Heading>
            <Text fontSize="lg" color="whiteAlpha.900" maxW="500px">
              Contactez-nous pour discuter de votre projet. 
              Nous vous répondons sous 24h.
            </Text>
            <HStack spacing={4} pt={4}>
              <Button
                as="a"
                href="mailto:contact@oninvite.fr"
                size="lg"
                bg="white"
                color="brand.600"
                px={8}
                leftIcon={<FiMail />}
                _hover={{ transform: 'translateY(-2px)' }}
              >
                contact@oninvite.fr
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box as="footer" py={12} bg="dark.500">
        <Container maxW="container.xl">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            gap={6}
          >
            <HStack spacing={2}>
              <Heading size="md" fontFamily="heading" color="brand.500">
                Oninvite
              </Heading>
              <Text color="gray.400">© {new Date().getFullYear()}</Text>
            </HStack>
            <HStack spacing={8}>
              <Link href="/mentions-legales" color="gray.400" fontSize="sm" _hover={{ color: 'white' }}>
                Mentions légales
              </Link>
              <Link href="/confidentialite" color="gray.400" fontSize="sm" _hover={{ color: 'white' }}>
                Confidentialité
              </Link>
              <Link href="/cgv" color="gray.400" fontSize="sm" _hover={{ color: 'white' }}>
                CGV
              </Link>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </>
  );
}
