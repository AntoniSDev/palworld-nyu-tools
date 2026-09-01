window.WORK_OPTIMIZATION = {
  passiveProfiles: {
    standard: [
      "WorldTree_CraftSpeed", "WorldTree_Sanity", "WorldTree_FullStomach", "CraftSpeed_up3", "Rare",
      "Vampire", "PAL_Sanity_Down_3", "PAL_FullStomach_Down_3", "CraftSpeed_up2", "PAL_Sanity_Down_2",
      "PAL_FullStomach_Down_2", "Nocturnal", "PAL_CorporateSlave", "CraftSpeed_up1", "PAL_Sanity_Down_1",
      "PAL_FullStomach_Down_1", "PAL_conceited",
    ],
    transport: [
      "WorldTree_MoveSpeed", "WorldTree_Sanity", "WorldTree_FullStomach", "MoveSpeed_up_3", "Legend", "Vampire",
      "PAL_Sanity_Down_3", "PAL_FullStomach_Down_3", "PAL_Sanity_Down_2", "PAL_FullStomach_Down_2",
      "MoveSpeed_up_2", "Nocturnal", "PAL_Sanity_Down_1", "PAL_FullStomach_Down_1", "MoveSpeed_up_1",
    ],
    farming: ["WorkSuitabilityAddRank_MonsterFarm_2", "WorkSuitabilityAddRank_MonsterFarm_1"],
  },
  passiveJobProfiles: {
    kindling: "standard", watering: "standard", planting: "standard", electricity: "standard",
    handiwork: "standard", gathering: "standard", lumbering: "standard", mining: "standard",
    medicine: "standard", cooling: "standard", transport: "transport", farming: "farming",
  },
  partnerActivities: {
    kindling: [{
      pal: "CatMage_Fire",
      effects: [{ label: "Capacité de travail — Allumage de feu" }],
      nonCumulative: true,
    }],
    watering: [
      {
        pal: "ClioneTwins",
        effects: [{ label: "Capacité de travail — Arrosage" }],
        nonCumulative: true,
      },
      {
        pal: "JellyfishFairy",
        effects: [{
          label: "Vitesse d’arrosage de Jelliette",
          sourceLabel: "Vitesse de travail",
        }],
        note: "Nécessite Jelliette et Jellroy ensemble dans la base.",
        nonCumulative: true,
        highlights: ["Jelliette", "Jellroy"],
      },
      {
        pal: "JellyfishGhost",
        effects: [{
          label: "Vitesse d’arrosage de Jellroy",
          sourceLabel: "Vitesse de travail",
        }],
        note: "Nécessite Jelliette et Jellroy ensemble dans la base.",
        nonCumulative: true,
        highlights: ["Jelliette", "Jellroy"],
      },
    ],
    planting: [
      {
        pal: "FlowerDoll",
        effects: [{ label: "Capacité de travail — Semence" }],
        nonCumulative: true,
      },
      { pal: "LeafPrincess", effects: [{ label: "Vitesse de croissance des cultures" }] },
    ],
    electricity: [{
      pal: "ElecPomeranian",
      effects: [{ label: "Capacité de travail — Génération d’énergie" }],
      nonCumulative: true,
    }],
    handiwork: [
      {
        pal: "PinkRabbit",
        effects: [{ label: "Capacité de travail — Artisanat" }],
        nonCumulative: true,
      },
      {
        pal: "Sekhmet",
        effects: [
          { label: "Vitesse de travail des Anubis" },
          { label: "Efficacité personnelle de Sekhmet" },
        ],
        nonCumulative: true,
        highlights: ["Anubis", "Sekhmet"],
      },
      {
        pal: "PinkRabbit_Grass",
        effects: [{ label: "Vitesse de travail" }],
        highlights: ["Ribbuny Botan"],
      },
    ],
    gathering: [
      {
        pal: "CloverFairy",
        effects: [{ label: "Capacité de travail — Collecte" }],
        nonCumulative: true,
      },
      {
        pal: "BlueberryFairy",
        effects: [{ label: "Quantité récoltée" }],
        highlights: ["Prunelia"],
      },
    ],
    lumbering: [{
      pal: "Deer_Ground",
      effects: [{ label: "Capacité de travail — Abattage" }],
      nonCumulative: true,
    }],
    mining: [{
      pal: "CubeTurtle",
      effects: [{ label: "Capacité de travail — Extraction" }],
      nonCumulative: true,
    }],
    medicine: [{
      pal: "MushroomLady",
      effects: [{ label: "Capacité de travail — Pharmacie" }],
      nonCumulative: true,
    }],
    cooling: [{
      pal: "BlackPuppy_Ice",
      effects: [{ label: "Capacité de travail — Réfrigération" }],
      nonCumulative: true,
    }],
    transport: [{
      pal: "Yeti",
      effects: [{ label: "Capacité de travail — Transport" }],
      nonCumulative: true,
    }],
    farming: [{
      pal: "CuteButterfly",
      effects: [{ label: "Capacité de travail — Exploitation" }],
      nonCumulative: true,
    }],
    global: [
      {
        pal: "MushroomDragon_Dark",
        effects: [{ label: "Réduction de la perte de MEN", magnitude: true }],
        highlights: ["Shroomer Noct"],
      },
      {
        pal: "SweetsSheep",
        effects: [{ label: "Ralentissement de la faim", sourceLabel: "Réduction de la faim", magnitude: true }],
        nonCumulative: true,
        highlights: ["Woolipop"],
      },
      {
        pal: "SweetsSheep_Ground",
        effects: [{ label: "Ralentissement de la faim", sourceLabel: "Réduction de la faim", magnitude: true }],
        nonCumulative: true,
        highlights: ["Woolipop Terra"],
      },
    ],
    breeding: [
      {
        pal: "Plesiosaur",
        effects: [{
          label: "Vitesse de production des œufs",
          sourceLabel: "Vitesse de reproduction à la base",
        }],
        nonCumulative: true,
      },
      { pal: "ThunderFluffyBird", effects: [{ label: "Vitesse d’éclosion des œufs" }], nonCumulative: true },
    ],
  },
};
