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
      create: "false",
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
      create: "isOwner",
      update: "isOwner",
      delete: "false",
    },
    bind: ["isOwner", "auth.id in data.ref('users.id')"],
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
      create: "false",
      update: "false",
      delete: "false",
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
      view: "false",
      create: "false",
      update: "false",
      delete: "false",
    },
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
};
