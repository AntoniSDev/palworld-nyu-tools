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
      effects: [{ label: "Capacité de travail — Allumage de feu", description: "Dans la base, augmente le niveau de la capacité de travail Allumage de feu des autres Pals." }],
      nonCumulative: true,
    }],
    watering: [
      {
        pal: "ClioneTwins",
        effects: [{ label: "Capacité de travail — Arrosage", description: "Dans la base, augmente le niveau de la capacité de travail Arrosage des autres Pals." }],
        nonCumulative: true,
      },
      {
        pal: "JellyfishFairy",
        effects: [{ label: "Vitesse de travail", description: "Dans la base, augmente la vitesse de travail des Pals." }],
        note: "Nécessite Jelliette et Jellroy ensemble dans la base.",
        highlights: ["Jelliette", "Jellroy"],
      },
      {
        pal: "JellyfishGhost",
        effects: [{ label: "Vitesse de travail", description: "Dans la base, augmente la vitesse de travail des Pals." }],
        note: "Nécessite Jelliette et Jellroy ensemble dans la base.",
        highlights: ["Jelliette", "Jellroy"],
      },
    ],
    planting: [
      {
        pal: "FlowerDoll",
        effects: [{ label: "Capacité de travail — Semence", description: "Dans la base, augmente le niveau de la capacité de travail Semence des autres Pals." }],
        nonCumulative: true,
      },
      { pal: "LeafPrincess", effects: [{ label: "Vitesse de croissance des cultures", description: "Dans la base, accélère la croissance des cultures." }] },
    ],
    electricity: [{
      pal: "ElecPomeranian",
      effects: [{ label: "Capacité de travail — Génération d’énergie", description: "Dans la base, augmente le niveau de la capacité de travail Génération d’énergie des autres Pals." }],
      nonCumulative: true,
    }],
    handiwork: [
      {
        pal: "PinkRabbit",
        effects: [{ label: "Capacité de travail — Artisanat", description: "Dans la base, augmente le niveau de la capacité de travail Artisanat des autres Pals." }],
        nonCumulative: true,
      },
      {
        pal: "Sekhmet",
        effects: [
          { label: "Vitesse de travail des Anubis", description: "Dans la base, augmente la vitesse de travail des Anubis présents." },
          { label: "Efficacité personnelle de Sekhmet", description: "Augmente l’efficacité de travail de Sekhmet sur un établi ou dans une usine." },
        ],
        nonCumulative: true,
        highlights: ["Anubis", "Sekhmet"],
      },
      {
        pal: "PinkRabbit_Grass",
        effects: [{ label: "Vitesse de travail", description: "Augmente l’efficacité de travail de Ribbuny Botan sur un établi ou dans une usine d’armes." }],
        highlights: ["Ribbuny Botan"],
      },
    ],
    gathering: [
      {
        pal: "CloverFairy",
        effects: [{ label: "Capacité de travail — Collecte", description: "Dans la base, augmente le niveau de la capacité de travail Collecte des autres Pals." }],
        nonCumulative: true,
      },
      {
        pal: "BlueberryFairy",
        effects: [{ label: "Quantité récoltée", description: "Dans la base, les prières de Prunelia augmentent la quantité de récoltes." }],
        highlights: ["Prunelia"],
      },
    ],
    lumbering: [{
      pal: "Deer_Ground",
      effects: [{ label: "Capacité de travail — Abattage", description: "Dans la base, augmente le niveau de la capacité de travail Abattage des autres Pals." }],
      nonCumulative: true,
    }],
    mining: [{
      pal: "CubeTurtle",
      effects: [{ label: "Capacité de travail — Extraction", description: "Dans la base, augmente le niveau de la capacité de travail Extraction des autres Pals." }],
      nonCumulative: true,
    }],
    medicine: [{
      pal: "MushroomLady",
      effects: [{ label: "Capacité de travail — Pharmacie", description: "Dans la base, augmente le niveau de la capacité de travail Pharmacie des autres Pals." }],
      nonCumulative: true,
    }],
    cooling: [{
      pal: "BlackPuppy_Ice",
      effects: [{ label: "Capacité de travail — Réfrigération", description: "Dans la base, augmente le niveau de la capacité de travail Réfrigération des autres Pals." }],
      nonCumulative: true,
    }],
    transport: [{
      pal: "Yeti",
      effects: [{ label: "Capacité de travail — Transport", description: "Dans la base, augmente le niveau de la capacité de travail Transport des autres Pals." }],
      nonCumulative: true,
    }],
    farming: [{
      pal: "CuteButterfly",
      effects: [{ label: "Capacité de travail — Exploitation", description: "Dans la base, augmente le niveau de la capacité de travail Exploitation des autres Pals." }],
      nonCumulative: true,
    }],
    global: [
      {
        pal: "MushroomDragon_Dark",
        effects: [{ label: "Réduction de la perte de MEN", description: "Dans la base, les mystérieuses spores de Shroomer Noct ralentissent la diminution des points MEN des Pals.", magnitude: true }],
        highlights: ["Shroomer Noct"],
      },
      {
        pal: "SweetsSheep",
        effects: [{ label: "Ralentissement de la faim", sourceLabel: "Réduction de la faim", description: "Dans la base, Woolipop ralentit la diminution de la satiété des Pals.", magnitude: true }],
        nonCumulative: true,
        highlights: ["Woolipop"],
      },
      {
        pal: "SweetsSheep_Ground",
        effects: [{ label: "Ralentissement de la faim", sourceLabel: "Réduction de la faim", description: "Dans la base, Woolipop Terra ralentit la diminution de la satiété des Pals.", magnitude: true }],
        nonCumulative: true,
        highlights: ["Woolipop Terra"],
      },
    ],
    breeding: [
      { pal: "Plesiosaur", effects: [{ label: "Vitesse de reproduction à la base", description: "Dans la base, accélère la reproduction des Pals affectés à un Élevage." }], nonCumulative: true },
      { pal: "ThunderFluffyBird", effects: [{ label: "Vitesse d’éclosion des œufs", description: "Dans la base, accélère l’éclosion des œufs." }], nonCumulative: true },
    ],
  },
};
