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
      // Cada quien edita su cuenta; el admin edita cualquiera (incluido el rol).
      update: "auth.id == data.id || isAdmin",
      delete: "false",
    },
    bind: ["isAdmin", "auth.ref('$user.profile.role') == 'admin'"],
  },

  // ============================================
  // PLAYER PROFILES
  // ============================================
  playerProfiles: {
    allow: {
      view: "true",
      create: "auth.id != ''",
      // El titular edita los suyos pero NO cambia status; staff sí.
      update: "isTitular || isStaff",
      delete: "isStaff",
    },
    bind: [
      "isTitular", "auth.id in data.ref('titular.id')",
      "isStaff", "auth.ref('$user.profile.role') in ['admin', 'coach']",
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
      view: "false",
      create: "false",
      update: "false",
      delete: "false",
    },
  },

  accountsReceivable: {
    allow: {
      view: "false",
      create: "false",
      update: "false",
      delete: "false",
    },
  },

  payments: {
    allow: {
      view: "false",
      create: "false",
      update: "false",
      delete: "false",
    },
  },

  paymentApplications: {
    allow: {
      view: "false",
      create: "false",
      update: "false",
      delete: "false",
    },
  },

  // ============================================
  // DOCUMENTS
  // ============================================
  documents: {
    allow: {
      view: "isFamily || isStaff",
      create: "auth.id != ''",
      update: "isStaff",
      delete: "isFamily || isStaff",
    },
    bind: [
      "isFamily", "auth.id in data.ref('playerProfile.titular.id')",
      "isStaff", "auth.ref('$user.profile.role') in ['admin', 'coach']",
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
};
