(() => {
  const effect = (label, description, options = {}) => ({ label, description, ...options });
  const partner = (pal, effects = [], options = {}) => ({ pal, effects, ...options });

  const elements = [
    { id: "neutral", name: "Non élém.", icon: "assets/elements/neutral.webp", strong: [], weak: ["dark"] },
    { id: "fire", name: "Feu", icon: "assets/elements/fire.png", strong: ["grass", "ice"], weak: ["water"] },
    { id: "water", name: "Eau", icon: "assets/elements/water.png", strong: ["fire"], weak: ["electric"] },
    { id: "grass", name: "Herbe", icon: "assets/elements/grass.png", strong: ["ground"], weak: ["fire"] },
    { id: "electric", name: "Électricité", icon: "assets/elements/electric.png", strong: ["water"], weak: ["ground"] },
    { id: "ice", name: "Glace", icon: "assets/elements/ice.png", strong: ["dragon"], weak: ["fire"] },
    { id: "ground", name: "Terre", icon: "assets/elements/ground.png", strong: ["electric"], weak: ["grass"] },
    { id: "dark", name: "Ténèbres", icon: "assets/elements/dark.png", strong: ["neutral"], weak: ["dragon"] },
    { id: "dragon", name: "Dragon", icon: "assets/elements/dragon.png", strong: ["dark"], weak: ["ice"] },
  ];

  const combatPassives = {
    general: ["TrainerATK_UP_1", "TrainerDEF_UP_1", "ReloadSpeedUp_Passive", "AutoHPRegeneRate_Passive", "CoolTimeReduction_Up_1"],
    neutral: ["ElementBoost_Normal_2_PAL", "ElementBoost_Normal_1_PAL", "ElementResist_Normal_1_PAL"],
    fire: ["ElementBoost_Fire_2_PAL", "ElementBoost_Fire_1_PAL", "ElementResist_Fire_1_PAL"],
    water: ["ElementBoost_Aqua_2_PAL", "ElementBoost_Aqua_1_PAL", "ElementResist_Aqua_1_PAL"],
    grass: ["ElementBoost_Leaf_2_PAL", "ElementBoost_Leaf_1_PAL", "ElementResist_Leaf_1_PAL"],
    electric: ["ElementBoost_Thunder_2_PAL", "ElementBoost_Thunder_1_PAL", "ElementResist_Thunder_1_PAL"],
    ice: ["ElementBoost_Ice_2_PAL", "ElementBoost_Ice_1_PAL", "ElementResist_Ice_1_PAL"],
    ground: ["ElementBoost_Earth_2_PAL", "ElementBoost_Earth_1_PAL", "ElementResist_Earth_1_PAL"],
    dark: ["ElementBoost_Dark_2_PAL", "ElementBoost_Dark_1_PAL", "ElementResist_Dark_1_PAL"],
    dragon: ["ElementBoost_Dragon_2_PAL", "ElementBoost_Dragon_1_PAL", "ElementResist_Dragon_1_PAL"],
  };

  window.GUIDE_DATA = {
    categories: [
      { id: "combat", name: "Combat" },
      { id: "farming", name: "Farming" },
      { id: "fishing", name: "Pêche" },
      { id: "capture", name: "Capture" },
      { id: "exploration", name: "Exploration" },
    ],
    elements,
    combat: {
      passives: combatPassives,
      partners: {
        fire: [partner("StuffedShark_Fire", [effect("Dégâts de Feu aux points faibles", "Augmente les dégâts de Feu infligés aux points faibles.")], { nonCumulative: true })],
        grass: [partner("PinkRabbit_Grass", [effect("Dégâts de Herbe aux points faibles", "Augmente les dégâts de Herbe infligés aux points faibles.")], { nonCumulative: true })],
        ground: [partner("TentacleTurtle_Ground", [effect("Dégâts de Terre aux points faibles", "Augmente les dégâts de Terre infligés aux points faibles.")], { nonCumulative: true })],
      },
    },
    farming: {
      tabs: [
        { id: "logging", name: "Abattage" },
        { id: "mining", name: "Extraction" },
        { id: "loot", name: "Loot" },
        { id: "special", name: "Ressources spéciales" },
      ],
      logging: {
        passives: ["TrainerLogging_up1"],
        partners: [
          partner("PlantSlime", [
            effect("Efficacité d’abattage", "Augmente les dégâts du joueur lors de l’abattage."),
            effect("Réduction du poids des objets", "Réduit le poids des différents types de bois.")
          ], { nonCumulative: true }),
          partner("Deer", [effect("Efficacité d’abattage", "Augmente l’efficacité contre les arbres lorsque le Pal est monté.")]),
        ],
      },
      mining: {
        passives: ["TrainerMining_up1"],
        partners: [
          partner("CuteMole", [
            effect("Efficacité d’extraction", "Augmente les dégâts d’extraction du joueur."),
            effect("Réduction du poids des objets", "Réduit le poids de la Pierre.")
          ], { nonCumulative: true }),
          partner("Boar", [effect("Efficacité d’extraction", "Augmente l’efficacité contre les rochers lorsque le Pal est monté.")]),
        ],
      },
      special: {
        partners: [partner("BlackPuppy", [effect("Rendement de collecte", "Détecte le Chromite et augmente la quantité obtenue.")], { nonCumulative: true, highlights: ["Chromite"] })],
      },
    },
    fishing: [
      {
        title: "Faciliter la pêche",
        partners: [
          partner("IceNarwhal", [effect("Progression initiale de pêche", "Remplit davantage la jauge au début du mini-jeu."), effect("Progression de la jauge de pêche", "Accélère la jauge lorsque les barres sont superposées.")], { nonCumulative: true }),
          partner("IceNarwhal_Fire", [effect("Progression initiale de pêche", "Remplit davantage la jauge au début du mini-jeu."), effect("Progression de la jauge de pêche", "Accélère la jauge lorsque les barres sont superposées.")], { nonCumulative: true }),
          partner("OctopusGirl", [effect("Réduction des échecs de pêche", "Réduit la perte de jauge lorsque les barres ne sont pas superposées.")], { nonCumulative: true }),
        ],
      },
      {
        title: "Loot de pêche",
        partners: [
          partner("JellyfishFairy", [effect("Objets supplémentaires obtenus en pêche", "Augmente les objets obtenus à la pêche."), effect("Butin supplémentaire sur les ennemis pêchés", "Augmente le butin des ennemis pêchés.")], { nonCumulative: true }),
          partner("JellyfishGhost", [effect("Objets de récupération obtenus en pêche", "Augmente les objets obtenus par récupération.")], { nonCumulative: true }),
        ],
      },
      {
        title: "Pals talentueux",
        partners: [
          partner("KingSunfish", [effect("Chance d’obtenir un Pal talentueux en pêche", "Augmente les chances de pêcher un Pal talentueux.")]),
          partner("KingSunfish_Thunder", [effect("Chance d’obtenir un Pal talentueux en pêche", "Augmente les chances de pêcher un Pal talentueux.")]),
        ],
      },
    ],
    capture: [
      {
        title: "Augmenter les chances de capture",
        partners: [
          partner("DandelionGirl", [effect("Bonus de capture sur une cible entravée", "Augmente les chances de capture d’une cible sous Entrave.")], { nonCumulative: true }),
          partner("FluffyBird", [effect("Bonus de capture sur une cible gelée", "Augmente les chances de capture d’une cible sous Gel.")], { nonCumulative: true }),
          partner("GhostBlackCat", [effect("Bonus de capture furtive", "Augmente le bonus de capture lors d’une attaque par derrière.")], { nonCumulative: true }),
        ],
      },
      {
        title: "Sphères",
        partners: [
          partner("CatMage", [effect("Récupération des Sphères", "Donne une chance que la sphère lancée ne soit pas consommée.")], { nonCumulative: true }),
          partner("Mutant", [effect("Capacité de charge", "Rend les sphères téléguidées et augmente la capacité de charge.")], { nonCumulative: true }),
        ],
      },
      {
        title: "Chasse aux passifs",
        partners: [partner("GuardianDog", [effect("Chance de rencontrer un Pal avec la même compétence passive", "Augmente les chances de rencontrer des Pals avec la même compétence passive.")])],
      },
    ],
    exploration: {
      tabs: [
        { id: "movement", name: "Déplacement" },
        { id: "gliders", name: "Planeurs" },
        { id: "detection", name: "Détection" },
        { id: "utilities", name: "Utilitaires" },
      ],
      movement: [
        partner("Deer", [], { description: "Monture dotée d’un double saut et spécialisée dans l’abattage." }),
        partner("KendoFrog", [effect("Attaque", "Propulse le joueur en hauteur et augmente son attaque jusqu’à l’atterrissage.")]),
        partner("Mutant", [effect("Capacité de charge", "Augmente la limite de poids portée par le joueur.")], { nonCumulative: true }),
      ],
      gliders: [
        partner("Eagle", [], { description: "Plane rapidement et permet de tirer avec l’arme tenue en main droite." }),
        partner("FlyingManta", [effect("Réduction des dégâts de chute", "Plane rapidement pendant une longue durée et annule les dégâts de chute.")]),
        partner("FlyingManta_Thunder", [effect("Réduction des dégâts de chute", "Plane rapidement pendant une longue durée et annule les dégâts de chute.")]),
        partner("NegativeOctopus", [], { description: "Permet de flotter doucement pendant une longue durée." }),
        partner("NegativeOctopus_Neutral", [], { description: "Permet de flotter doucement pendant une longue durée." }),
        partner("WindChimes", [], { description: "Permet de s’élever lentement pendant le vol plané." }),
        partner("WindChimes_Ice", [], { description: "Permet de s’élever lentement pendant le vol plané." }),
      ],
      detection: [
        partner("NightFox", [], { description: "Détecte les statues de Pal à proximité." }),
        partner("CatBat", [], { description: "Détecte les donjons, coffres et débris à proximité." }),
        partner("BlackPuppy", [effect("Rendement de collecte", "Détecte le Chromite et augmente la quantité obtenue.")], { nonCumulative: true, highlights: ["Chromite"] }),
      ],
      utilities: [
        partner("MimicDog", [], { description: "Ouvre les coffres sans utiliser de clé." }),
        partner("SifuDog", [], { description: "Permet de se téléporter vers la base la plus proche hors des donjons." }),
        partner("Mutant", [effect("Capacité de charge", "Augmente la limite de poids portée et rend les sphères téléguidées.")], { nonCumulative: true }),
      ],
    },
  };
})();
