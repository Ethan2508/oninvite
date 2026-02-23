/**
 * Layout principal du CMS - Design professionnel
 */
import { ReactNode } from 'react';
import {
  Box,
  Flex,
  useColorModeValue,
  IconButton,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Icon,
  Text,
} from '@chakra-ui/react';
import Sidebar from './Sidebar';
import { FiSearch, FiBell, FiSettings, FiLogOut, FiUser } from 'react-icons/fi';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headerBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <Flex minH="100vh">
      <Sidebar />
      <Box
        flex="1"
        ml={{ base: 0, md: '260px' }}
        bg={bgColor}
        minH="100vh"
      >
        {/* Top Header */}
        <Box
          position="sticky"
          top={0}
          zIndex={10}
          bg={headerBg}
          borderBottom="1px"
          borderColor={borderColor}
          px={8}
          py={4}
        >
          <Flex justify="space-between" align="center">
            {/* Search */}
            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input 
                placeholder="Rechercher un événement, un invité..." 
                bg={useColorModeValue('gray.50', 'gray.700')}
                border="none"
                borderRadius="lg"
                fontSize="sm"
                _placeholder={{ color: 'gray.400' }}
                _focus={{ 
                  bg: useColorModeValue('white', 'gray.600'),
                  boxShadow: 'sm',
                }}
              />
            </InputGroup>

            {/* Actions */}
            <HStack spacing={3}>
              <IconButton
                aria-label="Notifications"
                icon={<FiBell />}
                variant="ghost"
                borderRadius="lg"
                position="relative"
              />
              
              <Menu>
                <MenuButton>
                  <Avatar 
                    size="sm" 
                    name="Admin"
                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    cursor="pointer"
                  />
                </MenuButton>
                <MenuList borderRadius="xl" boxShadow="lg" py={2}>
                  <MenuItem icon={<FiUser />} fontSize="sm">Mon profil</MenuItem>
                  <MenuItem icon={<FiSettings />} fontSize="sm">Paramètres</MenuItem>
                  <MenuDivider />
                  <MenuItem icon={<FiLogOut />} fontSize="sm" color="red.500">
                    Déconnexion
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>
        </Box>

        {/* Main Content */}
        <Box p={8}>
          {children}
        </Box>
      </Box>
    </Flex>
  );
}
