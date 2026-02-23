# ÉTAPE 8 — Process Client & Livraison

> **Statut** : À implémenter
> **Prérequis** : Étape 7 (Build & Déploiement)
> **Livrable** : Workflow opérationnel complet + checklist de livraison

---

## 1. VUE D'ENSEMBLE DU PROCESS

```
Client contacte → Google Form → Paiement → Config CMS (30 min) → Preview → Validation → Build → Review Apple (48h) → Livraison → Jour J → Mode souvenir → Expiration
```

---

## 2. DÉTAIL PAS À PAS

### Jour 0 — Premier contact

Le client nous contacte (Instagram, site, bouche-à-oreille).

**On lui envoie :**
1. Le lien du Google Form (cahier des charges)
2. La grille tarifaire (3 packs)
3. Un message type

**Message type premier contact :**

```
Bonjour [prénom] !

Merci pour votre intérêt pour notre application événementielle.

Pour configurer votre app, merci de remplir ce formulaire :
👉 [LIEN GOOGLE FORM]

Vous y trouverez toutes les questions nécessaires (type d'événement, branding, modules souhaités, etc.).

Pensez également à nous envoyer :
📎 Votre logo en haute qualité (PNG ou SVG)
📎 Vos photos (WeTransfer ou Google Drive)

Voici nos formules :
• Essentiel — 490€
• Premium — 790€
• VIP — 1 200€

Détails : [LIEN GRILLE TARIFAIRE]

N'hésitez pas si vous avez des questions !
```

---

### Jour 1 — Réception du formulaire + paiement

- Vérifier que le formulaire est complet
- Si incomplet → relance unique avec les questions manquantes
- Encaisser le paiement (Stripe / virement)
- **Ne rien commencer avant le paiement**

---

### Jour 1-2 — Configuration CMS

- Créer l'événement dans le CMS
- Remplir tous les champs depuis les réponses du Google Form
- Uploader les assets (logo, photos)
- Activer les modules selon le pack choisi
- Vérifier la preview

---

### Jour 2 — Preview client

- Envoyer le lien de preview au client
- Attendre sa validation
- Appliquer les ajustements si nécessaires (max 2 allers-retours)

---

### Jour 2-3 — Build & soumission

```bash
./scripts/build.sh mariage-sarah-david
```

- Vérifier que le build passe
- Soumission automatique sur les stores
- **Android** : en ligne en quelques heures
- **iOS** : review en 24-48h

---

### Jour 3-4 — Livraison

**On envoie au client :**
1. Lien App Store
2. Lien Play Store
3. QR code (pour mettre sur les invitations papier)
4. Mini guide pour les invités

**Message type livraison :**

```
Votre application est en ligne ! 🎉

📱 iPhone : [LIEN APP STORE]
📱 Android : [LIEN PLAY STORE]

QR Code en pièce jointe — vous pouvez l'imprimer sur vos invitations.

Pour vos invités, vous pouvez leur envoyer ce message :
"Téléchargez l'app [NOM] pour toutes les infos de [l'événement] : [LIEN]"

Besoin de nous envoyer des notifications le jour J ? Envoyez-nous les messages et horaires souhaités la veille par WhatsApp.

Mazel tov ! 🥂
```

---

### Jour J — Événement

- Envoyer les notifications push programmées
- Surveiller que tout tourne (monitoring basique)

---

### J+1 — Post-événement

- L'app bascule automatiquement en mode souvenir
- Rien à faire manuellement

---

### J+365 — Expiration

- L'app expire
- Proposer un renouvellement (50-100€/an) si le client veut garder l'accès
- Si non renouvelé → retirer des stores + archiver les données

---

## 3. CHECKLIST DE LIVRAISON

Avant de livrer une app client, vérifier **CHAQUE** point :

### Contenu
- [ ] Titre de l'événement correct (orthographe, accents)
- [ ] Date et heure correctes (timezone vérifiée)
- [ ] Tous les lieux renseignés avec adresses complètes
- [ ] Programme complet et dans le bon ordre chronologique
- [ ] Contacts organisateur renseignés

### Branding
- [ ] Logo affiché correctement (pas coupé, bonne résolution)
- [ ] Icône de l'app 1024x1024 sans transparence
- [ ] Couleurs appliquées partout (vérifier les écrans sombres)
- [ ] Splash screen correctement affiché sur différentes tailles d'écran
- [ ] Nom de l'app correct sur l'écran d'accueil du téléphone

### Modules
- [ ] Seuls les modules du pack choisi sont activés
- [ ] RSVP fonctionne (tester une soumission complète)
- [ ] Galerie photo : upload + affichage fonctionnels
- [ ] Cagnotte : paiement test Stripe réussi
- [ ] Plan de table : recherche par nom fonctionne
- [ ] Notifications push : test d'envoi réussi
- [ ] Countdown affiche le bon nombre de jours

### Technique
- [ ] Build iOS réussi sans erreur
- [ ] Build Android réussi sans erreur
- [ ] L'app fonctionne offline (contenu consultable)
- [ ] Liens GPS ouvrent Google Maps / Apple Maps
- [ ] Performance : l'app charge en moins de 3 secondes
- [ ] Pas de crash au lancement (tester sur 2-3 appareils)

### Stores
- [ ] Description du store personnalisée
- [ ] Screenshots uploadés (au moins 3 pour iPhone)
- [ ] Privacy Policy linkée
- [ ] Catégorie : "Lifestyle" ou "Social Networking"
- [ ] Age rating configuré

### Livrables au client
- [ ] Lien App Store
- [ ] Lien Play Store
- [ ] QR code généré
- [ ] Message type pour les invités
- [ ] Paiement encaissé

---

## 4. SÉCURITÉ & DONNÉES PERSONNELLES (RGPD)

### Obligations

On collecte des données personnelles (noms, emails, téléphones, photos).

| Obligation | Solution |
|------------|----------|
| Privacy Policy | Accessible dans l'app et sur les stores |
| Consentement | L'invité consent en soumettant le RSVP (mention légale sous le formulaire) |
| Droit de suppression | Permettre à un invité de demander la suppression de ses données |
| Durée de conservation | Supprimer les données X mois après l'expiration de l'app (12 mois par défaut) |
| Hébergement | Données hébergées en UE |

### Privacy Policy — Template

```
POLITIQUE DE CONFIDENTIALITÉ - [NOM DE L'APP]

1. RESPONSABLE DU TRAITEMENT
[NOM DE VOTRE ENTREPRISE]
[ADRESSE]
Contact : [EMAIL]

2. DONNÉES COLLECTÉES
- Nom et prénom (RSVP)
- Email (optionnel)
- Téléphone (optionnel)
- Photos uploadées dans la galerie
- Messages du livre d'or

3. FINALITÉS
- Gestion des confirmations de présence (RSVP)
- Partage de photos entre invités
- Envoi de notifications relatives à l'événement

4. DURÉE DE CONSERVATION
Les données sont conservées pendant 12 mois après la date de l'événement, puis supprimées.

5. VOS DROITS
Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. 
Contactez-nous à [EMAIL] pour exercer ces droits.

6. HÉBERGEMENT
Les données sont hébergées en Union Européenne (France).

Dernière mise à jour : [DATE]
```

### Données à NE PAS stocker dans Git

- Photos des clients
- Clés API (Stripe, Firebase, etc.) → variables d'environnement
- Données personnelles des invités

---

## 5. FAQ TECHNIQUE

**Q : Que faire si Apple rejette l'app ?**

R : Lire le motif de rejet dans App Store Connect. Les raisons les plus courantes :
- Metadata incomplète (description, screenshots)
- Privacy policy manquante
- Violation de la guideline 4.2.6 (template apps)

Corriger et resoumettre. Le re-review est généralement plus rapide.

---

**Q : Un client veut modifier quelque chose après la mise en ligne ?**

R : Modifier dans le CMS.
- **Contenu** (textes, programme, photos) → mise à jour en temps réel via l'API, pas besoin de rebuild
- **Branding** (couleurs, logo, icône) → rebuild + resoumission stores nécessaire

---

**Q : Comment gérer un client qui n'a pas de logo ?**

R : 
- Créer un logo simple avec Canva ou un outil IA (Midjourney, DALL-E)
- Utiliser les initiales du couple dans un cercle avec la police du thème
- Facturer en supplément (50-100€) ou inclure dans le pack VIP

---

**Q : Combien d'apps peut-on avoir sur un seul compte Apple Developer ?**

R : Pas de limite officielle. Apple n'a pas de restriction sur le nombre d'apps par compte. Cependant, si Apple détecte un pattern de "spam" (beaucoup d'apps quasi identiques), ils peuvent questionner. Nos apps sont suffisamment différentes (contenu unique) pour ne pas poser problème.

---

**Q : Comment gérer la cagnotte côté juridique ?**

R : On utilise Stripe Connect. L'argent va directement sur le compte Stripe du client (ou le nôtre avec transfert). On n'est pas un intermédiaire financier tant qu'on ne stocke pas les fonds. Vérifier la réglementation locale. Alternativement, on peut simplement fournir un lien vers une cagnotte externe (Leetchi, PayPal) sans gérer nous-mêmes les paiements.

---

**Q : Un invité peut-il utiliser l'app sans télécharger depuis le store ?**

R : Non, c'est une app native qui nécessite un téléchargement. On peut proposer en parallèle un lien web (version simplifiée) pour les invités qui ne veulent pas installer d'app, mais ce n'est pas prioritaire.

---

**Q : Comment gérer les mises à jour de l'app template ?**

R : Les apps déjà publiées continuent de fonctionner avec leur version. Si on ajoute un nouveau module au template, les anciens clients n'en bénéficient pas automatiquement. Il faudrait rebuild + resoumettre. C'est rarement nécessaire sauf si le client le demande (et paie pour).

---

**Q : Quel est le coût serveur mensuel estimé ?**

R : Pour les premiers clients, très faible :
- PostgreSQL managé : ~10-20€/mois
- API sur Railway/Render : ~10-20€/mois
- Cloudinary free tier pour les médias

**Total : ~30-50€/mois** pour gérer 10-20 événements simultanés. Ça scale facilement.

---

## 6. MESSAGES TYPES

### Relance formulaire incomplet

```
Bonjour [prénom],

J'ai bien reçu votre formulaire, mais il manque quelques informations :
- [ÉLÉMENT MANQUANT 1]
- [ÉLÉMENT MANQUANT 2]

Pourriez-vous me les envoyer pour que je puisse configurer votre app ?

Merci !
```

### Envoi du preview

```
Bonjour [prénom],

Votre application est prête en preview ! 🎉

Vous pouvez la tester ici : [LIEN PREVIEW]

Vérifiez bien tous les détails (textes, dates, couleurs) et dites-moi si vous souhaitez des modifications.

Une fois validé, je lance la mise en ligne sur les stores (comptez 24-48h pour Apple).
```

### Relance validation preview

```
Bonjour [prénom],

Avez-vous pu tester le preview de votre app ?

Si tout est bon, je peux lancer la mise en ligne dès aujourd'hui.

Merci de me confirmer !
```

### Message invités (à transmettre au client)

```
[PRÉNOM] & [PRÉNOM] ont le plaisir de vous annoncer leur [mariage/événement] !

Téléchargez l'application pour retrouver toutes les informations :
📱 iPhone : [LIEN APP STORE]
📱 Android : [LIEN PLAY STORE]

Ou scannez ce QR code : [IMAGE QR CODE]

Vous pourrez :
✓ Confirmer votre présence
✓ Consulter le programme
✓ Partager vos photos
✓ Et plus encore !

À très bientôt ! 🎉
```

---

## 7. STRUCTURE FINALE DU REPOSITORY

```
/
├── app/                          ← Code source de l'app mobile
│   ├── src/
│   ├── ios/
│   ├── android/
│   └── ...
│
├── api/                          ← Backend API
│   ├── events/
│   ├── guests/
│   ├── photos/
│   ├── donations/
│   ├── notifications/
│   └── ...
│
├── cms/                          ← Front-end du CMS (Next.js)
│   ├── pages/
│   ├── components/
│   └── ...
│
├── clients/                      ← Dossiers de config par client
│   ├── mariage-sarah-david/
│   ├── barmitzvah-nathan/
│   └── ...
│
├── scripts/
│   ├── build.sh
│   ├── generate_qr.sh
│   └── export_guests.sh
│
├── docs/
│   ├── 01_architecture_et_bdd.md
│   ├── 02_api_backend.md
│   ├── 03_app_mobile.md
│   ├── 04_config_et_assets.md
│   ├── 05_cms_backoffice.md
│   ├── 06_notifications_push.md
│   ├── 07_build_et_deploiement.md
│   └── 08_process_et_livraison.md
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

---

## CHECKLIST FINALE DU PROJET

### Infrastructure
- [ ] Docker Compose fonctionnel
- [ ] BDD PostgreSQL initialisée
- [ ] API déployée (staging + prod)
- [ ] CMS déployé (staging + prod)
- [ ] Cloudinary/S3 configuré

### App Mobile
- [ ] Template validé par Apple
- [ ] Build iOS fonctionnel
- [ ] Build Android fonctionnel
- [ ] Mode offline testé
- [ ] Mode souvenir testé

### Process
- [ ] Google Form cahier des charges créé
- [ ] Grille tarifaire finalisée
- [ ] Privacy Policy publiée
- [ ] Messages types rédigés
- [ ] Checklist de livraison imprimée

### Premiers clients
- [ ] 1er client test (gratuit, ami/famille)
- [ ] 1er client payant livré avec succès
- [ ] Feedback collecté et intégré

---

> **FIN DE LA DOCUMENTATION**
> 
> Ce document couvre l'intégralité du projet. Chaque étape est conçue pour être terminée avant de passer à la suivante.
> 
> **Conseil** : Avancer étape par étape, valider chaque checklist, et ne jamais revenir en arrière.
