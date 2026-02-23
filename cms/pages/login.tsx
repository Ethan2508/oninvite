import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  Text,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      toast({
        title: 'Erreur de connexion',
        description: 'Email ou mot de passe incorrect',
        status: 'error',
        duration: 3000,
      });
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <Box minH="100vh" bg="gray.900" display="flex" alignItems="center">
      <Container maxW="sm">
        <Box bg="white" p={8} borderRadius="xl" boxShadow="2xl">
          <VStack spacing={6}>
            <Box textAlign="center">
              <Heading size="lg" color="gray.800">
                Oninvite
              </Heading>
              <Text color="gray.500" mt={2}>
                Connectez-vous au dashboard
              </Text>
            </Box>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@oninvite.fr"
                    size="lg"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Mot de passe</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showPassword ? 'Masquer' : 'Afficher'}
                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="purple"
                  size="lg"
                  width="100%"
                  isLoading={isLoading}
                  loadingText="Connexion..."
                >
                  Se connecter
                </Button>
              </VStack>
            </form>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
