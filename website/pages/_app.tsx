import type { AppProps } from 'next/app';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#FFF9E6',
      100: '#FFF0BF',
      200: '#FFE799',
      300: '#FFDD73',
      400: '#FFD44D',
      500: '#D4AF37', // Gold primary
      600: '#B8942F',
      700: '#9C7A27',
      800: '#80601F',
      900: '#644617',
    },
    dark: {
      50: '#E8E8EB',
      100: '#C5C5CD',
      200: '#A2A2AF',
      300: '#7F7F91',
      400: '#5C5C73',
      500: '#1A1A2E', // Dark primary
      600: '#161627',
      700: '#121220',
      800: '#0E0E19',
      900: '#0A0A12',
    },
  },
  fonts: {
    heading: `'Cormorant Garamond', serif`,
    body: `'Inter', system-ui, sans-serif`,
  },
  styles: {
    global: {
      body: {
        bg: 'white',
        color: 'gray.900',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}
