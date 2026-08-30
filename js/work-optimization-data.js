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
    kindling: [{ pal: "CatMage_Fire", effect: "Capacité de travail — Allumage de feu", nonCumulative: true }],
    watering: [
      { pal: "ClioneTwins", effect: "Capacité de travail — Arrosage", nonCumulative: true },
      { pal: "JellyfishFairy", effect: "Vitesse de travail", note: "Nécessite Jelliette et Jellroy ensemble dans la base." },
      { pal: "JellyfishGhost", effect: "Vitesse de travail", note: "Nécessite Jelliette et Jellroy ensemble dans la base." },
    ],
    planting: [
      { pal: "FlowerDoll", effect: "Capacité de travail — Semence", nonCumulative: true },
      { pal: "LeafPrincess", effect: "Vitesse de croissance des cultures" },
    ],
    electricity: [{ pal: "ElecPomeranian", effect: "Capacité de travail — Génération d’énergie", nonCumulative: true }],
    handiwork: [
      { pal: "PinkRabbit", effect: "Capacité de travail — Artisanat", nonCumulative: true },
      { pal: "Sekhmet", effect: "Vitesse de travail", description: true },
      { pal: "PinkRabbit_Grass", effect: "Vitesse de travail", note: "Bonus personnel sur établi et usine d’armes." },
    ],
    gathering: [
      { pal: "CloverFairy", effect: "Capacité de travail — Collecte", nonCumulative: true },
      { pal: "BlueberryFairy", effect: "Quantité récoltée", note: "Augmente la quantité de récoltes grâce aux prières de Prunelia dans la base." },
    ],
    lumbering: [{ pal: "Deer_Ground", effect: "Capacité de travail — Abattage", nonCumulative: true }],
    mining: [{ pal: "CubeTurtle", effect: "Capacité de travail — Extraction", nonCumulative: true }],
    medicine: [{ pal: "MushroomLady", effect: "Capacité de travail — Pharmacie", nonCumulative: true }],
    cooling: [{ pal: "BlackPuppy_Ice", effect: "Capacité de travail — Réfrigération", nonCumulative: true }],
    transport: [{ pal: "Yeti", effect: "Capacité de travail — Transport", nonCumulative: true }],
    farming: [{ pal: "CuteButterfly", effect: "Capacité de travail — Exploitation", nonCumulative: true }],
    global: [
      { pal: "MushroomDragon_Dark", effect: "Réduction de la perte de MEN" },
      { pal: "SweetsSheep", effect: "Réduction de la faim" },
      { pal: "SweetsSheep_Ground", effect: "Réduction de la faim" },
    ],
    breeding: [
      { pal: "Plesiosaur", effect: "Vitesse de reproduction à la base" },
      { pal: "ThunderFluffyBird", effect: "Vitesse d’éclosion des œufs" },
    ],
  },
};
