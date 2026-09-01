# Palworld Nyu Tools

Petite application statique HTML/CSS/JavaScript pour consulter des données et
préparer des actions dans Palworld. Le Cumoir peut lire une sauvegarde Steam
Palworld 1.0 directement dans le navigateur : les fichiers restent sur
l’appareil de l’utilisateur et ne sont envoyés à aucun serveur.

## Données privées

Les fichiers `*.sav` ne doivent jamais être ajoutés au dépôt. L’application ne
conserve que le roster normalisé dans IndexedDB pour restaurer la session locale.

## Licence

Ce projet est distribué sous **GNU GPL v3.0**. Consultez [LICENSE](LICENSE) et
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) pour les composants et données
tiers, notamment `ooz-wasm` (GPL-3.0-or-later).

Petite application statique en français regroupant des outils pratiques pour Palworld.

## Version 1.0

- Les 12 aptitudes de travail.
- Les niveaux 1 à 10.
- Vue détaillée par aptitude.
- Passifs utiles par capacité de travail.
- Informations pratiques sur la condensation des Pals.
- Compétences partenaire utilitaires, classées par activité.
- Mémo personnel sauvegardé dans le navigateur.
- Cumoir : croisements directs et routes d’élevage minimales.
- Accès direct aux rubriques depuis la navigation principale.
- Aperçu de la future rubrique des Compétences partenaire de combat.
- Identité visuelle fantasy-tech inspirée de l’univers de Palworld.
- Mise en page adaptée au téléphone et au PC.

## Publication

Le contenu de ce dossier peut être publié directement avec GitHub Pages, sans compilation ni serveur.

Les données de cette version correspondent à Palworld 1.0.3.

## Planificateur du Cumoir

Le Cumoir construit ses routes uniquement depuis les individus de la sauvegarde
chargée localement. Les passifs choisis sont encodés dans un bitmask de quatre
bits au maximum. Le moteur manipule ensuite des carriers compacts définis par
leur espèce, leur sexe et ce masque de passifs.

Chaque croisement valide fusionne les passifs recherchés de ses deux parents.
Une recherche exacte conserve le meilleur plan connu pour chaque carrier et
minimise d’abord le nombre total d’étapes d’élevage, puis la profondeur de
l’arbre. Les dépendances mémorisées permettent de reconstruire les feuilles
réellement possédées et les intermédiaires à produire.

Le calcul s’exécute dans un Web Worker. La sauvegarde et son roster ne sont
jamais envoyés à un serveur. Cette expérience de planification pratique suit
les usages des outils communautaires modernes, sans reprendre leur code.
