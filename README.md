# Projet ANA — Landing page + questionnaire + Google Sheets

Le dépôt contient un site statique à héberger sur GitHub Pages :
- `index.html` : landing page expliquant le concept ANA Mentorat Informatique avec appels à l'action ;
- `formulaire.html` : questionnaire d'enquête ;
- `style.css` : styles du site et du questionnaire ;
- `script.js` : navigation, validation et envoi des réponses ;
- `Code.gs` : récepteur Google Apps Script à coller dans script.google.com.

## Configuration de Google Sheets

1. Créez une feuille Google Sheets privée.
2. Copiez l'ID dans son URL, entre `/d/` et `/edit`.
3. Dans `Code.gs`, remplacez `COLLEZ_ICI_ID_DU_GOOGLE_SHEET`.
4. Ouvrez https://script.google.com/, créez un projet et collez `Code.gs`.
5. Déployez comme **Application Web**, en choisissant l'exécution en tant que vous-même et un accès public si vous voulez recevoir des réponses sans connexion Google.
6. Copiez l'URL `/exec` obtenue et remplacez `COLLEZ_ICI_URL_APPLICATION_WEB_APPS_SCRIPT` dans `script.js`.
7. Si vous modifiez le code Apps Script après déploiement, publiez une nouvelle version dans **Déployer → Gérer les déploiements**.

## Publication GitHub Pages

Mettez à la racine du dépôt `index.html`, `formulaire.html`, `style.css` et `script.js`. Le fichier `Code.gs` est à copier dans Google Apps Script, il ne s'exécute pas sur GitHub Pages. Activez Pages dans **Settings → Pages → Deploy from a branch → main → /(root)**.

La landing page est la page d'accueil (`index.html`). Les boutons CTA ouvrent `formulaire.html`.

## Numéro WhatsApp et confidentialité

Le numéro WhatsApp du répondant est demandé comme champ obligatoire, avec un consentement explicite à sa collecte. N'utilisez ces données que pour la finalité annoncée et limitez l'accès au Google Sheet aux personnes autorisées. Évitez de collecter des données inutiles.

## Sécurité — limites à comprendre

- GitHub Pages est un hébergement statique : aucune donnée privée ou clé secrète ne doit être placée dans les fichiers JavaScript.
- L'URL de l'application Web Apps Script est visible dans le navigateur. Ce point d'entrée est public et peut être appelé par des scripts malveillants ; le champ leurre anti-spam et la validation Apps Script ne bloquent pas toutes les attaques.
- La page utilise `fetch` en mode `no-cors`. Le navigateur ne peut pas lire la confirmation du serveur ; après le test, vérifiez dans Google Sheets qu'une ligne a bien été ajoutée.
- Gardez la feuille privée, activez la validation en deux étapes sur le compte Google et ne donnez pas l'accès éditeur à tout le monde.
- Si le formulaire doit être diffusé à grande échelle ou contenir des données plus sensibles, privilégiez Google Forms natif ou ajoutez une protection serveur plus robuste (limitation de débit, CAPTCHA vérifié côté serveur, contrôle anti-abus).
- Le champ WhatsApp est une donnée personnelle. Affichez une notice claire, demandez le consentement, indiquez une durée de conservation et supprimez les données lorsqu'elles ne sont plus nécessaires.
