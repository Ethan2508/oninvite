# ÉTAPE 5 — CMS / Back-Office

> **Statut** : À implémenter
> **Prérequis** : Étape 4 (Config & Assets)
> **Livrable** : Interface admin Next.js complète

---

## 1. STACK

- **Frontend** : Next.js (React)
- **Auth** : NextAuth.js ou Firebase Auth (pour notre login admin uniquement)
- **API** : API Routes Next.js ou Django REST Framework
- **Hébergement** : Vercel (front) + Railway/Render (API) ou tout sur un VPS

---

## 2. PAGES DU CMS

### 2.1 Dashboard

- Liste de tous les événements (actifs, passés, en attente de review Apple)
- Statut de chaque événement : `draft` | `pending_review` | `live` | `souvenir` | `expired`
- Stats globales : nombre d'événements actifs, CA total, RSVPs reçus

---

### 2.2 Création / Édition d'événement

Un formulaire qui correspond exactement aux champs du `config.json`. Organisé en onglets :

**Onglet "Général"**
- Type d'événement (dropdown)
- Titre, sous-titre
- Date et heure de début/fin
- Langue(s)

**Onglet "Branding"**
- Upload logo, icône, splash screen, fond d'écran
- Color picker pour chaque couleur (primary, secondary, accent, background, text)
- Sélection de police (dropdown parmi les polices supportées)
- Upload vidéo d'intro (optionnel)

**Onglet "Lieux"**
- Ajouter/supprimer des lieux
- Pour chaque lieu : nom, type, adresse, coordonnées GPS (auto via Google Places API), horaire, notes, parking, dress code

**Onglet "Programme"**
- Liste ordonnée des étapes
- Pour chaque étape : horaire, titre, sous-titre, icône (dropdown), lieu associé
- Drag & drop pour réordonner

**Onglet "Modules"**
- Toggle on/off pour chaque module
- Pour chaque module activé : sous-formulaire avec les options spécifiques (cf. config.json)

**Onglet "Contacts"**
- Organisateur : nom, téléphone, email
- Contact d'urgence : nom, téléphone

**Onglet "Paramètres"**
- Mode souvenir automatique (on/off, délai en jours)
- Date d'expiration de l'app
- Afficher "Propulsé par" (on/off)

---

### 2.3 Preview

- Un iframe qui affiche l'app en mode mobile (375x812px)
- Se met à jour en temps réel quand on modifie les champs
- Bouton "Envoyer le lien de preview au client" (génère un lien temporaire)

---

### 2.4 Gestion des invités / RSVPs

- Tableau avec tous les RSVPs reçus
- Filtres : confirmé / en attente / décliné
- Export CSV / Excel
- Stats : nombre de confirmés, nombre d'accompagnants, répartition des menus, restrictions alimentaires

---

### 2.5 Notifications push

- Formulaire : titre, message, date/heure d'envoi (immédiat ou programmé)
- Historique des notifications envoyées
- Stats : envoyées, ouvertes

---

### 2.6 Galerie photo (modération)

- Grille de toutes les photos uploadées par les invités
- Bouton supprimer si modération activée
- Download ZIP de toutes les photos

---

### 2.7 Build & Déploiement

- Bouton "Générer le build iOS + Android"
- Status du build en cours (building, submitted, in review, approved, rejected)
- Liens vers App Store Connect et Google Play Console
- QR code généré automatiquement (lien vers les stores)

---

## 3. STRUCTURE DES DOSSIERS CMS

```
/cms
├── pages/
│   ├── index.tsx                 ← Redirection vers dashboard
│   ├── login.tsx                 ← Page de connexion
│   ├── dashboard.tsx             ← Dashboard principal
│   ├── events/
│   │   ├── index.tsx             ← Liste des événements
│   │   ├── new.tsx               ← Formulaire de création
│   │   ├── [id]/
│   │   │   ├── index.tsx         ← Vue détaillée
│   │   │   ├── edit.tsx          ← Édition (formulaire à onglets)
│   │   │   ├── preview.tsx       ← Preview mobile
│   │   │   ├── guests.tsx        ← Liste RSVPs
│   │   │   ├── photos.tsx        ← Modération galerie
│   │   │   ├── donations.tsx     ← Liste des dons
│   │   │   ├── guestbook.tsx     ← Messages livre d'or
│   │   │   ├── notifications.tsx ← Envoi notifications
│   │   │   └── build.tsx         ← Lancer le build
│   │   └── ...
│   └── api/                      ← API Routes Next.js (si utilisé)
├── components/
│   ├── Layout.tsx
│   ├── Sidebar.tsx
│   ├── EventForm/
│   │   ├── GeneralTab.tsx
│   │   ├── BrandingTab.tsx
│   │   ├── LocationsTab.tsx
│   │   ├── ProgramTab.tsx
│   │   ├── ModulesTab.tsx
│   │   ├── ContactsTab.tsx
│   │   └── SettingsTab.tsx
│   ├── GuestsTable.tsx
│   ├── PhotoGrid.tsx
│   ├── NotificationForm.tsx
│   ├── ColorPicker.tsx
│   └── ...
├── hooks/
│   ├── useEvents.ts
│   ├── useGuests.ts
│   └── ...
├── services/
│   ├── api.ts
│   ├── auth.ts
│   └── upload.ts
├── styles/
├── public/
└── next.config.js
```

---

## 4. COMPOSANTS CLÉS

### 4.1 Formulaire d'événement avec onglets

```jsx
// components/EventForm/index.tsx
import { useState } from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import GeneralTab from './GeneralTab';
import BrandingTab from './BrandingTab';
import LocationsTab from './LocationsTab';
import ProgramTab from './ProgramTab';
import ModulesTab from './ModulesTab';
import ContactsTab from './ContactsTab';
import SettingsTab from './SettingsTab';

const EventForm = ({ event, onSave }) => {
  const [formData, setFormData] = useState(event || defaultEvent);

  const handleChange = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  return (
    <Tabs>
      <TabList>
        <Tab>Général</Tab>
        <Tab>Branding</Tab>
        <Tab>Lieux</Tab>
        <Tab>Programme</Tab>
        <Tab>Modules</Tab>
        <Tab>Contacts</Tab>
        <Tab>Paramètres</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <GeneralTab 
            data={formData.event} 
            onChange={(data) => handleChange('event', data)} 
          />
        </TabPanel>
        <TabPanel>
          <BrandingTab 
            data={formData.branding} 
            onChange={(data) => handleChange('branding', data)} 
          />
        </TabPanel>
        <TabPanel>
          <LocationsTab 
            data={formData.locations} 
            onChange={(data) => setFormData(prev => ({ ...prev, locations: data }))} 
          />
        </TabPanel>
        <TabPanel>
          <ProgramTab 
            data={formData.program}
            locations={formData.locations}
            onChange={(data) => setFormData(prev => ({ ...prev, program: data }))} 
          />
        </TabPanel>
        <TabPanel>
          <ModulesTab 
            data={formData.modules}
            pack={formData.pack}
            onChange={(data) => handleChange('modules', data)} 
          />
        </TabPanel>
        <TabPanel>
          <ContactsTab 
            data={formData.contacts} 
            onChange={(data) => handleChange('contacts', data)} 
          />
        </TabPanel>
        <TabPanel>
          <SettingsTab 
            data={formData.settings} 
            onChange={(data) => handleChange('settings', data)} 
          />
        </TabPanel>
      </TabPanels>

      <Button onClick={() => onSave(formData)} colorScheme="blue">
        Enregistrer
      </Button>
    </Tabs>
  );
};
```

---

### 4.2 Color Picker

```jsx
// components/ColorPicker.tsx
import { useState } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';

const ColorPicker = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="color-picker">
      <label>{label}</label>
      <div className="color-preview" onClick={() => setIsOpen(!isOpen)}>
        <div 
          className="color-swatch" 
          style={{ backgroundColor: value }} 
        />
        <span>{value}</span>
      </div>
      {isOpen && (
        <div className="color-popover">
          <HexColorPicker color={value} onChange={onChange} />
          <HexColorInput color={value} onChange={onChange} />
        </div>
      )}
    </div>
  );
};
```

---

### 4.3 Tableau des invités avec export

```jsx
// components/GuestsTable.tsx
import { useMemo } from 'react';
import { useTable, useFilters, useSortBy } from 'react-table';
import { exportToCSV, exportToExcel } from '../utils/export';

const GuestsTable = ({ guests, eventId }) => {
  const columns = useMemo(() => [
    { Header: 'Nom', accessor: 'name' },
    { Header: 'Email', accessor: 'email' },
    { Header: 'Statut', accessor: 'status' },
    { Header: '+1', accessor: 'plus_ones' },
    { Header: 'Menu', accessor: 'menu_choice' },
    { Header: 'Régime', accessor: 'dietary' },
    { Header: 'Date RSVP', accessor: 'rsvp_date' },
  ], []);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = 
    useTable({ columns, data: guests }, useFilters, useSortBy);

  const stats = useMemo(() => ({
    total: guests.length,
    confirmed: guests.filter(g => g.status === 'confirmed').length,
    declined: guests.filter(g => g.status === 'declined').length,
    pending: guests.filter(g => g.status === 'pending').length,
    totalWithPlusOnes: guests.reduce((sum, g) => sum + 1 + (g.plus_ones || 0), 0),
  }), [guests]);

  return (
    <div>
      <div className="stats">
        <span>Total: {stats.total}</span>
        <span>Confirmés: {stats.confirmed}</span>
        <span>Déclinés: {stats.declined}</span>
        <span>En attente: {stats.pending}</span>
        <span>Total avec +1: {stats.totalWithPlusOnes}</span>
      </div>

      <div className="actions">
        <button onClick={() => exportToCSV(guests, `guests_${eventId}`)}>
          Export CSV
        </button>
        <button onClick={() => exportToExcel(guests, `guests_${eventId}`)}>
          Export Excel
        </button>
      </div>

      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
```

---

### 4.4 Preview mobile

```jsx
// pages/events/[id]/preview.tsx
import { useRouter } from 'next/router';
import { useEvent } from '../../../hooks/useEvent';

const PreviewPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { event } = useEvent(id);

  const previewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/preview/${id}`;

  const sendPreviewToClient = async () => {
    // Générer un lien temporaire (expire dans 7 jours)
    const response = await fetch(`/api/events/${id}/preview-link`, {
      method: 'POST'
    });
    const { link } = await response.json();
    
    // Copier dans le presse-papier
    navigator.clipboard.writeText(link);
    alert('Lien copié !');
  };

  return (
    <div className="preview-page">
      <div className="preview-controls">
        <h1>Preview — {event?.event?.title}</h1>
        <button onClick={sendPreviewToClient}>
          Copier le lien de preview
        </button>
      </div>

      <div className="phone-frame">
        <iframe 
          src={previewUrl}
          width="375"
          height="812"
          title="App Preview"
        />
      </div>
    </div>
  );
};
```

---

## 5. AUTHENTIFICATION

Seuls les admins (nous) peuvent accéder au CMS. Exception : B2B wedding planners.

```jsx
// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Autoriser seulement les emails de notre équipe
      const allowedEmails = [
        'admin@tamarque.com',
        'dev@tamarque.com',
      ];
      return allowedEmails.includes(user.email);
    },
  },
});
```

---

## CHECKLIST DE VALIDATION

- [ ] Dashboard affiche la liste des événements
- [ ] Formulaire de création à onglets fonctionnel
- [ ] Upload d'assets (logo, icône, splash) vers Cloudinary
- [ ] Color picker avec preview
- [ ] Drag & drop pour réordonner le programme
- [ ] Toggle des modules avec sous-formulaires conditionnels
- [ ] Preview mobile en temps réel (iframe)
- [ ] Tableau des invités avec filtres et export CSV/Excel
- [ ] Stats RSVPs calculés correctement
- [ ] Modération galerie (suppression photos)
- [ ] Formulaire d'envoi de notification push
- [ ] Page de build avec statut en temps réel
- [ ] Authentification fonctionnelle (Google OAuth)

---

> **Étape suivante** : [06_notifications_push.md](06_notifications_push.md)
