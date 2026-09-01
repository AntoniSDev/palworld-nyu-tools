(() => {
  const effect = (label, options = {}) => ({ label, ...options });
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
      { id: "combat", name: "Combat", eyebrow: "Guide de combat", copy: "Comprenez les forces élémentaires et trouvez les compétences et Pals utiles en combat." },
      { id: "farming", name: "Farming", eyebrow: "Guide de farming", copy: "Trouvez les compétences et Pals utiles pour l'abattage, l'extraction, le loot et les ressources spéciales." },
      { id: "fishing", name: "Pêche", eyebrow: "Guide de pêche", copy: "Améliorez vos parties de pêche, vos récompenses et vos chances de trouver des Pals talentueux." },
      { id: "capture", name: "Capture", eyebrow: "Guide de capture", copy: "Augmentez vos chances de capture, économisez vos sphères et recherchez plus facilement les passifs souhaités." },
      { id: "exploration", name: "Exploration", eyebrow: "Guide d'exploration", copy: "Retrouvez les Pals utiles pour vous déplacer, planer, détecter des ressources et explorer Palpagos." },
    ],
    elements,
    combat: {
      passives: combatPassives,
      partners: {
        fire: [partner("StuffedShark_Fire", [effect("Dégâts de Feu aux points faibles")], { nonCumulative: true })],
        grass: [partner("PinkRabbit_Grass", [effect("Dégâts de Herbe aux points faibles")], { nonCumulative: true })],
        ground: [partner("TentacleTurtle_Ground", [effect("Dégâts de Terre aux points faibles")], { nonCumulative: true })],
      },
    },
    farming: {
      tabs: [
        { id: "logging", name: "Abattage", icon: "assets/work-suitabilities/06.webp" },
        { id: "mining", name: "Extraction", icon: "assets/work-suitabilities/07.webp" },
        { id: "loot", name: "Loot", icon: "assets/partner-skills/T_icon_skill_pal_014.webp" },
        { id: "special", name: "Ressources spéciales", icon: "assets/guide-chromite.webp" },
      ],
      logging: {
        passives: ["TrainerLogging_up1"],
        partners: [
          partner("PlantSlime", [
            effect("Efficacité d’abattage"),
            effect("Réduction du poids des objets")
          ], { nonCumulative: true }),
          partner("Deer", [effect("Efficacité d’abattage")]),
        ],
      },
      mining: {
        passives: ["TrainerMining_up1"],
        partners: [
          partner("CuteMole", [
            effect("Efficacité d’extraction"),
            effect("Réduction du poids des objets")
          ], { nonCumulative: true }),
          partner("Boar", [effect("Efficacité d’extraction")]),
        ],
      },
      special: {
        partners: [partner("BlackPuppy", [effect("Rendement de collecte")], { nonCumulative: true, highlights: ["Chromite"] })],
      },
    },
    fishing: [
      {
        title: "Faciliter la pêche",
        partners: [
          partner("IceNarwhal", [effect("Progression initiale de pêche"), effect("Progression de la jauge de pêche")], { nonCumulative: true }),
          partner("IceNarwhal_Fire", [effect("Progression initiale de pêche"), effect("Progression de la jauge de pêche")], { nonCumulative: true }),
          partner("OctopusGirl", [effect("Réduction des échecs de pêche")], { nonCumulative: true }),
        ],
      },
      {
        title: "Loot de pêche",
        partners: [
          partner("JellyfishFairy", [effect("Objets supplémentaires obtenus en pêche"), effect("Butin supplémentaire sur les ennemis pêchés")], { nonCumulative: true }),
          partner("JellyfishGhost", [effect("Objets de récupération obtenus en pêche")], { nonCumulative: true }),
        ],
      },
      {
        title: "Pals talentueux",
        partners: [
          partner("KingSunfish", [effect("Chance d’obtenir un Pal talentueux en pêche")]),
          partner("KingSunfish_Thunder", [effect("Chance d’obtenir un Pal talentueux en pêche")]),
        ],
      },
    ],
    capture: [
      {
        title: "Augmenter les chances de capture",
        partners: [
          partner("DandelionGirl", [effect("Bonus de capture sur une cible entravée")], { nonCumulative: true }),
          partner("FluffyBird", [effect("Bonus de capture sur une cible gelée")], { nonCumulative: true }),
          partner("GhostBlackCat", [effect("Bonus de capture furtive")], { nonCumulative: true }),
        ],
      },
      {
        title: "Sphères",
        partners: [
          partner("CatMage", [effect("Récupération des Sphères")], { nonCumulative: true }),
          partner("Mutant", [effect("Capacité de charge")], { nonCumulative: true }),
        ],
      },
      {
        title: "Chasse aux passifs",
        partners: [partner("GuardianDog", [effect("Chance de rencontrer un Pal avec la même compétence passive")])],
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
        partner("Deer"),
        partner("KendoFrog", [effect("Attaque")]),
        partner("Mutant", [effect("Capacité de charge")], { nonCumulative: true }),
      ],
      gliders: [
        partner("Eagle"),
        partner("FlyingManta", [effect("Réduction des dégâts de chute")]),
        partner("FlyingManta_Thunder", [effect("Réduction des dégâts de chute")]),
        partner("NegativeOctopus"),
        partner("NegativeOctopus_Neutral"),
        partner("WindChimes"),
        partner("WindChimes_Ice"),
      ],
      detection: [
        partner("NightFox"),
        partner("CatBat"),
        partner("BlackPuppy", [effect("Rendement de collecte")], { nonCumulative: true, highlights: ["Chromite"] }),
      ],
      utilities: [
        partner("MimicDog"),
        partner("SifuDog"),
        partner("Mutant", [effect("Capacité de charge")], { nonCumulative: true }),
      ],
    },
  };
})();
