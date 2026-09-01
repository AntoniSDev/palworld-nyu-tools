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
    general: ["PAL_ALLAttack_up3", "Legend", "PAL_ALLAttack_up2", "Deffence_up3", "MutationPal_Immortal", "Vampire", "CoolTimeReduction_Up_1", "TrainerATK_UP_1", "TrainerDEF_UP_1", "ReloadSpeedUp_Passive", "AutoHPRegeneRate_Passive"],
    neutral: ["Salvation", "ElementBoost_Normal_2_PAL", "ElementBoost_Normal_1_PAL", "ElementResist_Normal_1_PAL"],
    fire: ["EternalFlame", "ElementBoost_Fire_2_PAL", "ElementBoost_Fire_1_PAL", "ElementResist_Fire_1_PAL"],
    water: ["Nushi", "ElementBoost_Aqua_2_PAL", "ElementBoost_Aqua_1_PAL", "ElementResist_Aqua_1_PAL"],
    grass: ["Salvation", "ElementBoost_Leaf_2_PAL", "ElementBoost_Leaf_1_PAL", "ElementResist_Leaf_1_PAL"],
    electric: ["EternalFlame", "ElementBoost_Thunder_2_PAL", "ElementBoost_Thunder_1_PAL", "ElementResist_Thunder_1_PAL"],
    ice: ["Witch", "Nushi", "ElementBoost_Ice_2_PAL", "ElementBoost_Ice_1_PAL", "ElementResist_Ice_1_PAL"],
    ground: ["ElementBoost_Earth_2_PAL", "ElementBoost_Earth_1_PAL", "ElementResist_Earth_1_PAL"],
    dark: ["Invader", "Witch", "ElementBoost_Dark_2_PAL", "ElementBoost_Dark_1_PAL", "ElementResist_Dark_1_PAL"],
    dragon: ["Invader", "ElementBoost_Dragon_2_PAL", "ElementBoost_Dragon_1_PAL", "ElementResist_Dragon_1_PAL"],
  };

  const movementPassives = [
    "MoveSpeed_up_1", "MoveSpeed_up_2", "MoveSpeed_up_3", "Legend", "WorldTree_MoveSpeed",
    "SwimSpeed_up_1", "SwimSpeed_up_2", "SwimSpeed_up_3",
    "Stamina_Up_2", "Stamina_Up_1", "Stamina_Up_3",
    "RideJumpCount_Increase1", "RideJumpCount_Increase2",
  ];

  window.GUIDE_DATA = {
    categories: [
      { id: "combat", name: "Combat", eyebrow: "Guide de combat", copy: "Regroupe les compétences passives et partenaires utiles au combat." },
      { id: "farming", name: "Farming", eyebrow: "Guide de farming", copy: "Présente les passifs, compétences partenaires et bonus de loot utiles au farming." },
      { id: "fishing", name: "Pêche", eyebrow: "Guide de pêche", copy: "Regroupe les compétences partenaires liées à la pêche, à son loot et aux Pals talentueux." },
      { id: "capture", name: "Capture", eyebrow: "Guide de capture", copy: "Regroupe les compétences partenaires liées aux chances de capture, aux Sphères et à la recherche de passifs." },
      { id: "exploration", name: "Exploration", eyebrow: "Guide d'exploration", copy: "Présente les passifs et compétences partenaires utiles à l’exploration de Palpagos." },
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
      ],
      logging: {
        passives: ["TrainerLogging_up1"],
        partners: [
          partner("PlantSlime", [
            effect("Efficacité d’abattage"),
            effect("Réduction du poids des objets")
          ], { nonCumulative: true }),
          partner("Deer", [effect("Efficacité d’abattage")]),
          partner("GrassMammoth", [effect("Efficacité d’abattage"), effect("Efficacité d’extraction")]),
          partner("GrassMammoth_Ice", [effect("Efficacité d’abattage"), effect("Efficacité d’extraction")]),
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
          partner("DrillGame", [effect("Efficacité d’extraction")]),
          partner("GrassMammoth", [effect("Efficacité d’extraction")]),
          partner("GrassMammoth_Ice", [effect("Efficacité d’extraction")]),
          partner("BlackMetalDragon", [effect("Efficacité d’extraction"), effect("Rendement de collecte")]),
          partner("TentacleTurtle", [effect("Réduction du poids des objets")], { nonCumulative: true }),
          partner("TentacleTurtle_Ground", [effect("Réduction du poids des objets")], { nonCumulative: true }),
          partner("VolcanicMonster", [effect("Réduction du poids des objets")], { nonCumulative: true }),
          partner("VolcanicMonster_Ice", [effect("Réduction du poids des objets")], { nonCumulative: true }),
          partner("BlackPuppy", [effect("Rendement de collecte")], { nonCumulative: true, highlights: ["Chromite"] }),
        ],
      },
      loot: {
        specific: [partner("GhostRabbit", [effect("Objets supplémentaires obtenus")], { nonCumulative: true })],
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
      movement: {
        passives: movementPassives,
        partners: [
          partner("Deer"),
          partner("KendoFrog", [effect("Attaque")]),
          partner("Mutant", [effect("Capacité de charge")], { nonCumulative: true }),
          partner("FengyunDeeper", [effect("Vitesse de déplacement")]),
          partner("Garm", [effect("Vitesse de déplacement")]),
          partner("BlueThunderHorse"),
          partner("LongCat"),
        ],
      },
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
        partner("DarkCrow"),
      ],
      utilities: [
        { title: "Outils d’exploration", partners: [partner("MimicDog"), partner("SifuDog")] },
        { title: "Ramassage & inventaire", partners: [
          partner("FlowerRabbit"),
          partner("IceCrocodile", [effect("Réduction du poids des objets"), effect("Vitesse de détérioration des objets")], { nonCumulative: true }),
          partner("Mutant", [effect("Capacité de charge")], { nonCumulative: true }),
        ] },
        { title: "Survie", partners: [partner("LavaGirl", [effect("Régénération des PV")], { nonCumulative: true })] },
        { title: "Progression", partners: [partner("MysteryMask", [effect("EXP obtenue par les Pals")], { nonCumulative: true })] },
        { title: "Œufs", partners: [
          partner("SakuraSaurus", [effect("Chance d’obtenir un Pal Alpha dans un œuf")], { nonCumulative: true }),
          partner("SakuraSaurus_Water", [effect("Chance d’obtenir un Pal Alpha dans un œuf")], { nonCumulative: true }),
        ] },
      ],
    },
  };
})();
