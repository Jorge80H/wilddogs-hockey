/**
 * Wild Dogs Hockey Club - InstantDB Permissions
 *
 * Simplified permissions that work with InstantDB CEL syntax.
 * Public-facing data (matches, standings, categories, etc.) is readable by all.
 * Write operations require authentication.
 */

export default {
  // ============================================
  // USERS & AUTHENTICATION
  // ============================================
  users: {
    allow: {
      view: "true",
      create: "auth.id != ''",
      update: "auth.id == data.id",
      delete: "false",
    },
  },

  // ============================================
  // PLAYER PROFILES
  // ============================================
  playerProfiles: {
    allow: {
      view: "true",
      create: "auth.id != ''",
      // El titular edita los suyos; staff usa el mismo flag genérico (rol se refuerza en la UI).
      update: "isTitular || auth.id != ''",
      delete: "auth.id != ''",
    },
    bind: [
      "isTitular", "auth.id in data.ref('titular.id')",
    ],
  },

  // ============================================
  // CATEGORIES
  // ============================================
  categories: {
    allow: {
      view: "true",
      create: "false",
      update: "false",
      delete: "false",
    },
  },

  // ============================================
  // COACHES
  // ============================================
  coaches: {
    allow: {
      view: "true",
      create: "false",
      update: "false",
      delete: "false",
    },
  },

  // ============================================
  // CATEGORY ACHIEVEMENTS
  // ============================================
  categoryAchievements: {
    allow: {
      view: "true",
      create: "false",
      update: "false",
      delete: "false",
    },
  },

  // ============================================
  // NEWS & ANNOUNCEMENTS
  // ============================================
  newsPosts: {
    allow: {
      view: "true",
      create: "auth.id != ''",
      update: "auth.id != ''",
      delete: "auth.id != ''",
    },
  },

  // ============================================
  // GALLERY
  // ============================================
  galleryAlbums: {
    allow: {
      view: "true",
      create: "false",
      update: "false",
      delete: "false",
    },
  },

  galleryImages: {
    allow: {
      view: "true",
      create: "false",
      update: "false",
      delete: "false",
    },
  },

  // ============================================
  // TOURNAMENTS & MATCHES
  // ============================================
  tournaments: {
    allow: {
      view: "true",
      create: "false",
      update: "false",
      delete: "false",
    },
  },

  matches: {
    allow: {
      view: "true",
      create: "false",
      update: "false",
      delete: "false",
    },
  },

  standings: {
    allow: {
      view: "true",
      create: "false",
      update: "false",
      delete: "false",
    },
  },

  // ============================================
  // PAYMENT SYSTEM
  // ============================================
  paymentConcepts: {
    allow: {
      view: "true",
      create: "auth.id != ''",
      update: "auth.id != ''",
      delete: "auth.id != ''",
    },
  },

  accountsReceivable: {
    allow: {
      view: "isFamily || auth.id != ''",
      create: "auth.id != ''",
      update: "auth.id != ''",
      delete: "auth.id != ''",
    },
    bind: [
      "isFamily", "auth.id in data.ref('player.titular.id')",
    ],
  },

  payments: {
    allow: {
      view: "isFamily || auth.id != ''",
      create: "auth.id != ''",
      update: "auth.id != ''",
      delete: "auth.id != ''",
    },
    bind: [
      "isFamily", "auth.id in data.ref('player.titular.id')",
    ],
  },

  paymentApplications: {
    allow: {
      view: "true",
      create: "auth.id != ''",
      update: "auth.id != ''",
      delete: "auth.id != ''",
    },
  },

  // ============================================
  // DOCUMENTS
  // ============================================
  documents: {
    allow: {
      view: "isFamily || auth.id != ''",
      create: "auth.id != ''",
      update: "auth.id != ''",
      delete: "isFamily || auth.id != ''",
    },
    bind: [
      "isFamily", "auth.id in data.ref('playerProfile.titular.id')",
    ],
  },

  // ============================================
  // CONTACT FORM SUBMISSIONS
  // ============================================
  contactSubmissions: {
    allow: {
      view: "false",
      create: "true",
      update: "false",
      delete: "false",
    },
  },

  // ============================================
  // PLAYER FEEDBACK
  // ============================================
  playerFeedback: {
    allow: {
      view: "true",
      create: "true",
      update: "false",
      delete: "false",
    },
  },

  // ============================================
  // TRAINING MATERIALS
  // ============================================
  trainingMaterials: {
    allow: {
      view: "true",
      create: "auth.id != ''",
      update: "auth.id != ''",
      delete: "auth.id != ''",
    },
  },

  // ============================================
  // BLOQUE B — QUIZZES, RUTA, PROGRESO, INSIGNIAS
  // ============================================
  pathSteps: {
    allow: {
      view: "true",
      create: "auth.id != ''",
      update: "auth.id != ''",
      delete: "auth.id != ''",
    },
  },

  quizQuestions: {
    allow: {
      // Riesgo anti-trampa aceptado: correctIndex es visible en cliente (deuda técnica documentada).
      view: "true",
      create: "auth.id != ''",
      update: "auth.id != ''",
      delete: "auth.id != ''",
    },
  },

  materialProgress: {
    allow: {
      view: "isFamily || auth.id != ''",
      create: "auth.id != ''",
      update: "auth.id != ''",
      delete: "auth.id != ''",
    },
    bind: [
      "isFamily", "auth.id in data.ref('player.titular.id')",
    ],
  },

  playerBadges: {
    allow: {
      view: "isFamily || auth.id != ''",
      create: "auth.id != ''",
      update: "false",
      delete: "auth.id != ''",
    },
    bind: [
      "isFamily", "auth.id in data.ref('player.titular.id')",
    ],
  },

  // ============================================
  // BLOQUE D — ENTRENAMIENTOS, ASISTENCIA Y ESTADÍSTICAS
  // ============================================
  trainingSessions: {
    allow: {
      view: "true",
      create: "auth.id != ''",
      update: "auth.id != ''",
      delete: "auth.id != ''",
    },
  },

  attendance: {
    allow: {
      view: "isFamily || auth.id != ''",
      create: "auth.id != ''",
      update: "auth.id != ''",
      delete: "auth.id != ''",
    },
    bind: [
      "isFamily", "auth.id in data.ref('player.titular.id')",
    ],
  },

  playerMatchStats: {
    allow: {
      view: "isFamily || auth.id != ''",
      create: "auth.id != ''",
      update: "auth.id != ''",
      delete: "auth.id != ''",
    },
    bind: [
      "isFamily", "auth.id in data.ref('player.titular.id')",
    ],
  },
};
