# Données d’élevage v0.8

Le fichier public `js/breeding-data.js` est généré à partir du jeu de résultats
Palweave 1.0.0, vérifié compatible avec Palworld 1.0.1 le 17 juillet 2026
(SHA-256 : `9f558802ed3fa14b52c352d18a05cd40b295e636ccca249376293e80dc1643c4`).
Les notes officielles des correctifs 1.0.2 et 1.0.3 ne signalent aucune
modification des combinaisons d’élevage ; cet instantané reste donc celui utilisé
pour la version publique 1.0.3 du site.
Les identifiants et l’ordre des Pals sont recoupés avec les tables extraites par
[`ICSharperNow/palworld-breeding-calculator`](https://github.com/ICSharperNow/palworld-breeding-calculator),
révision `2d622d64140fc90b1ac913c139d91dfd150d15dd` (licence MIT).

La mécanique et les cas sexués Katress/Wixen ont aussi été recoupés avec la page
[`Breeding` de Palworld Wiki](https://palworld.wiki.gg/wiki/Breeding).

Pour régénérer les données, fournir au script les fichiers `pals.json` et
`combos.json` de la révision indiquée :

```text
python scripts/generate-breeding-data.py --pals <pals.json> --combos <combos.json> --outcomes <palworld-breeding-data.json>
```

Le générateur compresse les 41 329 résultats utiles dans une matrice triangulaire,
fusionne les identifiants internes avec les noms français et les
portraits déjà présents dans `js/condensation-data.js`. Il exclut les quatre
entrées techniques/non publiées de la source et les onze créatures crossover
Terraria, pour conserver les 287 Pals publiés de Palworld 1.0.
