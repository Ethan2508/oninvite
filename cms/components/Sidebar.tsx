/**
 * Sidebar de navigation du CMS - Design professionnel
 */
import {
  Box,
  Flex,
  VStack,
  Text,
  Icon,
  Link as ChakraLink,
  useColorModeValue,
  Divider,
  Badge,
  Image,
  Avatar,
  HStack,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiHome,
  FiCalendar,
  FiUsers,
  FiImage,
  FiMessageSquare,
  FiDollarSign,
  FiBell,
  FiSettings,
  FiPlus,
  FiGrid,
  FiPackage,
  FiLogOut,
  FiHelpCircle,
} from 'react-icons/fi';

interface NavItemProps {
  icon: any;
  label: string;
  href: string;
  badge?: string | number;
}

function NavItem({ icon, label, href, badge }: NavItemProps) {
  const router = useRouter();
  const isActive = router.pathname === href || router.asPath.startsWith(href + '/');
  
  const activeBg = useColorModeValue('brand.50', 'brand.900');
  const activeColor = useColorModeValue('brand.700', 'brand.200');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  return (
    <Link href={href} passHref legacyBehavior>
      <ChakraLink
        display="flex"
        alignItems="center"
        px={3}
        py={2.5}
        borderRadius="lg"
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : textColor}
        fontWeight={isActive ? '600' : '500'}
        fontSize="sm"
        _hover={{
          bg: isActive ? activeBg : hoverBg,
          textDecoration: 'none',
          transform: 'translateX(2px)',
        }}
        transition="all 0.15s ease"
      >
        <Icon as={icon} boxSize={4} mr={3} opacity={isActive ? 1 : 0.7} />
        <Text flex="1">{label}</Text>
        {badge && (
          <Badge 
            colorScheme="red" 
            borderRadius="full" 
            px={2} 
            py={0.5}
            fontSize="xs"
            fontWeight="600"
          >
            {badge}
          </Badge>
        )}
      </ChakraLink>
    </Link>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text 
      fontSize="xs" 
      fontWeight="600" 
      color="gray.400" 
      textTransform="uppercase"
      letterSpacing="wider"
      px={3} 
      mb={2}
      mt={2}
    >
      {children}
    </Text>
  );
}

export default function Sidebar() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const logoTextColor = useColorModeValue('gray.900', 'white');

  return (
    <Box
      position="fixed"
      left={0}
      top={0}
      h="100vh"
      w="260px"
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      display={{ base: 'none', md: 'block' }}
      boxShadow="sm"
    >
      {/* Logo Section */}
      <Flex 
        h="70px" 
        alignItems="center" 
        px={5} 
        borderBottom="1px" 
        borderColor={borderColor}
      >
        <Box 
          w="36px" 
          h="36px" 
          borderRadius="lg" 
          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mr={3}
        >
          <Icon as={FiCalendar} color="white" boxSize={4} />
        </Box>
        <Box>
          <Text 
            fontSize="lg" 
            fontWeight="700" 
            color={logoTextColor}
            letterSpacing="-0.5px"
          >
            Oninvite
          </Text>
          <Text fontSize="xs" color="gray.500" fontWeight="500">
            Administration
          </Text>
        </Box>
      </Flex>

      {/* Navigation */}
      <Box overflowY="auto" h="calc(100vh - 70px - 80px)" py={4} px={3}>
        <VStack spacing={0.5} align="stretch">
          <NavItem icon={FiGrid} label="Tableau de bord" href="/dashboard" />
          
          <Divider my={3} borderColor={borderColor} />
          <SectionLabel>Événements</SectionLabel>
          
          <NavItem icon={FiCalendar} label="Tous les événements" href="/events" />
          <NavItem icon={FiPlus} label="Créer un événement" href="/events/new" />
          
          <Divider my={3} borderColor={borderColor} />
          <SectionLabel>Gestion</SectionLabel>
          
          <NavItem icon={FiUsers} label="Invités & RSVPs" href="/rsvps" />
          <NavItem icon={FiImage} label="Galerie photos" href="/photos" />
          <NavItem icon={FiMessageSquare} label="Livre d'or" href="/guestbook" />
          <NavItem icon={FiDollarSign} label="Cagnotte" href="/donations" />
          <NavItem icon={FiBell} label="Notifications" href="/notifications" badge={2} />
          
          <Divider my={3} borderColor={borderColor} />
          <SectionLabel>Système</SectionLabel>
          
          <NavItem icon={FiPackage} label="Clients" href="/clients" />
          <NavItem icon={FiSettings} label="Paramètres" href="/settings" />
          <NavItem icon={FiHelpCircle} label="Aide" href="/help" />
        </VStack>
      </Box>

      {/* User Section */}
      <Box 
        position="absolute" 
        bottom={0} 
        left={0} 
        right={0} 
        p={4}
        borderTop="1px"
        borderColor={borderColor}
        bg={bgColor}
      >
        <HStack spacing={3}>
          <Avatar 
            size="sm" 
            name="Admin" 
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
          <Box flex="1">
            <Text fontSize="sm" fontWeight="600" color={logoTextColor}>
              Admin
            </Text>
            <Text fontSize="xs" color="gray.500">
              admin@oninvite.fr
            </Text>
          </Box>
          <Icon 
            as={FiLogOut} 
            boxSize={4} 
            color="gray.400" 
            cursor="pointer"
            _hover={{ color: 'gray.600' }}
          />
        </HStack>
      </Box>
    </Box>
  );
}
