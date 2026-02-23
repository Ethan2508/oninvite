/**
 * GuestContext - Gestion de l'état de l'invité connecté
 * Gère l'identification, le code personnel, et le programme personnalisé
 */
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  getSavedPersonalCode, 
  savePersonalCode, 
  clearGuestData,
  getGuestByCode,
  getPersonalizedProgram,
  identifyGuest,
} from '../services/api';
import { useConfig } from './ConfigContext';

interface Guest {
  id: string;
  name: string;
  first_name?: string;
  personal_code: string;
  email?: string;
  status: 'pending' | 'confirmed' | 'declined';
  invitation_group_id?: string;
}

interface SubEvent {
  id: string;
  name: string;
  slug: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  location_name?: string;
  location_address?: string;
  latitude?: number;
  longitude?: number;
  dress_code?: string;
  notes?: string;
  rsvp_status?: 'pending' | 'confirmed' | 'declined';
  attendees_count?: number;
}

interface PersonalizedProgram {
  guest: Guest;
  sub_events: SubEvent[];
}

interface GuestContextType {
  // État
  guest: Guest | null;
  program: PersonalizedProgram | null;
  isIdentified: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  identify: (query: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProgram: () => Promise<void>;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

interface GuestProviderProps {
  children: ReactNode;
}

export const GuestProvider: React.FC<GuestProviderProps> = ({ children }) => {
  const { eventId } = useConfig();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [program, setProgram] = useState<PersonalizedProgram | null>(null);
  const [isIdentified, setIsIdentified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger l'invité depuis le storage au démarrage
  useEffect(() => {
    const loadSavedGuest = async () => {
      try {
        const saved = await getSavedPersonalCode();
        if (saved) {
          // Récupérer les infos de l'invité depuis l'API
          const guestData = await getGuestByCode(eventId, saved.code);
          setGuest(guestData);
          setIsIdentified(true);
          
          // Charger le programme personnalisé
          const programData = await getPersonalizedProgram(eventId, saved.code);
          setProgram(programData);
        }
      } catch (err) {
        console.log('[GuestContext] Pas d\'invité sauvegardé ou erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSavedGuest();
  }, [eventId]);

  // Identifier un invité
  const identify = useCallback(async (query: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await identifyGuest(eventId, query);
      
      if (result.guests && result.guests.length > 0) {
        // Pour l'instant, prendre le premier résultat
        // TODO: Afficher une liste si plusieurs résultats
        const identifiedGuest = result.guests[0];
        
        // Sauvegarder le code
        await savePersonalCode(identifiedGuest.personal_code, identifiedGuest.name);
        
        setGuest(identifiedGuest);
        setIsIdentified(true);
        
        // Charger le programme personnalisé
        const programData = await getPersonalizedProgram(eventId, identifiedGuest.personal_code);
        setProgram(programData);
        
        return true;
      } else {
        setError('Aucun invité trouvé avec ce nom ou code');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'identification');
      return false;
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Déconnexion
  const logout = useCallback(async () => {
    await clearGuestData();
    setGuest(null);
    setProgram(null);
    setIsIdentified(false);
  }, []);

  // Rafraîchir le programme
  const refreshProgram = useCallback(async () => {
    if (!guest?.personal_code) return;
    
    try {
      const programData = await getPersonalizedProgram(eventId, guest.personal_code);
      setProgram(programData);
    } catch (err) {
      console.error('[GuestContext] Erreur rafraîchissement programme:', err);
    }
  }, [eventId, guest]);

  return (
    <GuestContext.Provider
      value={{
        guest,
        program,
        isIdentified,
        loading,
        error,
        identify,
        logout,
        refreshProgram,
      }}
    >
      {children}
    </GuestContext.Provider>
  );
};

export const useGuest = (): GuestContextType => {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
};

export default GuestContext;
