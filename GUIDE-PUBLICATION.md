# Guide de publication — Site de Médéric Verzeri

Ce projet est prêt pour une publication **gratuite** sur Vercel (option B).
Tout est déjà configuré : le fichier `vercel.json` indique à Vercel comment
construire le site. Aucune modification technique n'est nécessaire.

---

## Étape 1 — Créer un compte GitHub (5 min, gratuit)

1. Allez sur **github.com** → « Sign up ».
2. E-mail + mot de passe + un pseudo (ex. `mverzeri`).

GitHub servira de « coffre-fort » : il garde une copie complète du site.

## Étape 2 — Mettre le site sur GitHub (5 min)

1. Une fois connecté : bouton **« New repository »** (ou le « + » en haut à droite).
2. Nom du dépôt : `site-mederic-verzeri` → visibilité **Public** → « Create repository ».
3. Sur la page du dépôt vide, cliquez **« uploading an existing file »**.
4. Glissez-déposez **tous les fichiers et dossiers du projet** (ceux fournis
   avec ce guide) : `src/`, `public/`, `index.html`, `package.json`,
   `vite.config.ts`, `tsconfig.json`, `vercel.json`, `.gitignore`.
5. Bouton vert **« Commit changes »**.

## Étape 3 — Publier sur Vercel (5 min, gratuit)

1. Allez sur **vercel.com** → « Sign Up » → choisissez **« Continue with GitHub »**
   (un seul compte à retenir !).
2. Cliquez **« Add New… → Project »**.
3. Votre dépôt `site-mederic-verzeri` apparaît → **« Import »**.
4. Vercel détecte automatiquement Vite. Ne changez rien → **« Deploy »**.
5. 1 à 2 minutes plus tard : 🎉 le site est en ligne.

## Étape 4 — Votre adresse personnalisée (2 min, gratuit)

1. Dans Vercel : votre projet → **Settings → Domains**.
2. L'adresse par défaut est modifiable : renommez le projet en
   `mederic-verzeri` (Settings → General → Project Name).
3. Votre site devient : **https://mederic-verzeri.vercel.app**
   — HTTPS inclus, gratuit à vie, sans publicité.

> 💡 Un domaine « .fr » ou « .com » coûte toujours ~7 €/an (aucune offre
> gratuite sérieuse n'existe). Alternative 100 % gratuite si vous voulez une
> adresse encore plus courte : **nic.eu.org** offre des sous-domaines gratuits
> type `verzeri.eu.org` (délai de validation : quelques jours à quelques
> semaines), à relier ensuite dans Vercel → Settings → Domains.

---

## Modifier le site au quotidien (sans toucher au code)

### Textes, photos, entreprises, questions → Espace admin
1. Ouvrez le site → lien **« Espace admin »** en bas de page (ou ajoutez `#admin`).
2. Code d'accès : `dechetlab60` (à changer dans Réglages).
3. Modifiez → **Enregistrer**.

### Pour que tout le monde voie vos modifications → JSONBin (une fois)
1. Compte gratuit sur **jsonbin.io**.
2. Admin → Réglages → « Télécharger la sauvegarde (JSON) ».
3. JSONBin → **Create Bin** → collez le contenu → visibilité **Public** → Save.
4. Copiez l'**ID du bin** (dans l'adresse après `/b/`) et la clé **X-Master-Key**
   (menu API Keys).
5. Admin → Réglages → « Publication en ligne » → collez les deux →
   **« Tester & publier maintenant »**.

Ensuite, chaque « Enregistrer » dans l'admin publie instantanément la
nouvelle version pour tous les visiteurs, depuis n'importe quel ordinateur.
Sur un nouveau poste : Réglages → mêmes ID + clé → « Récupérer la version
en ligne ».

⚠️ Gardez la X-Master-Key secrète. Notez-la en lieu sûr avec votre code admin.

### Et GitHub dans tout ça ?
Vous n'y retournez que pour les changements « de structure » (nouvelle
section, nouveau design…) : il suffit de remplacer les fichiers dans le
dépôt (« Add file → Upload files ») et Vercel republie automatiquement en
2 minutes. Pour le contenu courant, l'espace admin suffit.

---

## Récapitulatif de vos comptes (tous gratuits)

| Service   | Sert à                        | Identifiant à retenir |
|-----------|-------------------------------|------------------------|
| GitHub    | Stocker le site               | e-mail + mot de passe |
| Vercel    | L'afficher en ligne           | « Continue with GitHub » |
| JSONBin   | Synchroniser vos modifications | e-mail + X-Master-Key |
| Le site   | Espace admin                  | code `dechetlab60` → à changer |
