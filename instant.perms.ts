/**
 * Wild Dogs Hockey Club - InstantDB Permissions
 *
 * This file defines role-based access control (RBAC) for all entities.
 *
 * User Roles:
 * - admin: Full system access
 * - coach: View category info, manage rosters and matches
 * - player: View own profile, payments, documents
 * - guardian: Same as player (for minors)
 *
 * Permission Rules Syntax:
 * - "true" = everyone
 * - "false" = no one
 * - "auth.id" = authenticated user ID
 * - "data.field" = field value being accessed
 * - "auth.id in data.user.id" = check relationship
 */

export default {
  // ============================================
  // USERS & AUTHENTICATION
  // ============================================
  users: {
    allow: {
      // Everyone can view basic user profiles (for displaying names, etc.)
      view: "true",
      // Users are created automatically via auth
      create: "false",
      // Users can only update their own profile, or admins can update anyone
      update:
        "auth.id == data.id || auth.id in data.role == 'admin'",
      // Only admins can delete users
      delete: "auth.id in data.role == 'admin'",
    },
    bind: ["role", "status"],
  },

  // ============================================
  // PLAYER PROFILES
  // ============================================
  playerProfiles: {
    allow: {
      // Everyone can view player profiles (public roster)
      view: "true",
      // Players can create their own profile, or admins can create for anyone
      create:
        "auth.id in data.user.id || auth.id in data.role == 'admin'",
      // Players can update their own profile, or admins can update anyone
      update:
        "auth.id in data.user.id || auth.id in data.role == 'admin'",
      // Only admins can delete profiles
      delete: "auth.id in data.role == 'admin'",
    },
    bind: ["category", "position", "jerseyNumber"],
  },

  // ============================================
  // CATEGORIES
  // ============================================
  categories: {
    allow: {
      // Everyone can view categories
      view: "true",
      // Only admins can create categories
      create: "auth.id in data.role == 'admin'",
      // Only admins can update categories
      update: "auth.id in data.role == 'admin'",
      // Only admins can delete categories
      delete: "auth.id in data.role == 'admin'",
    },
  },

  // ============================================
  // COACHES
  // ============================================
  coaches: {
    allow: {
      // Everyone can view coaches
      view: "true",
      // Only admins can add coaches
      create: "auth.id in data.role == 'admin'",
      // Only admins can update coaches
      update: "auth.id in data.role == 'admin'",
      // Only admins can delete coaches
      delete: "auth.id in data.role == 'admin'",
    },
  },

  // ============================================
  // CATEGORY ACHIEVEMENTS
  // ============================================
  categoryAchievements: {
    allow: {
      // Everyone can view achievements
      view: "true",
      // Only admins can add achievements
      create: "auth.id in data.role == 'admin'",
      // Only admins can update achievements
      update: "auth.id in data.role == 'admin'",
      // Only admins can delete achievements
      delete: "auth.id in data.role == 'admin'",
    },
  },

  // ============================================
  // NEWS & ANNOUNCEMENTS
  // ============================================
  newsPosts: {
    allow: {
      // Everyone can view published news, only admins see drafts
      view: "data.status == 'published' || auth.id in data.role == 'admin'",
      // Only admins can create news posts
      create: "auth.id in data.role == 'admin'",
      // Only admins can update news posts
      update: "auth.id in data.role == 'admin'",
      // Only admins can delete news posts
      delete: "auth.id in data.role == 'admin'",
    },
    bind: ["status"],
  },

  // ============================================
  // GALLERY
  // ============================================
  galleryAlbums: {
    allow: {
      // Everyone can view albums
      view: "true",
      // Only admins can create albums
      create: "auth.id in data.role == 'admin'",
      // Only admins can update albums
      update: "auth.id in data.role == 'admin'",
      // Only admins can delete albums
      delete: "auth.id in data.role == 'admin'",
    },
  },

  galleryImages: {
    allow: {
      // Everyone can view images
      view: "true",
      // Only admins can upload images
      create: "auth.id in data.role == 'admin'",
      // Only admins can update images
      update: "auth.id in data.role == 'admin'",
      // Only admins can delete images
      delete: "auth.id in data.role == 'admin'",
    },
  },

  // ============================================
  // TOURNAMENTS & MATCHES
  // ============================================
  tournaments: {
    allow: {
      // Everyone can view tournaments
      view: "true",
      // Only admins can create tournaments
      create: "auth.id in data.role == 'admin'",
      // Admins and coaches can update tournaments
      update:
        "auth.id in data.role == 'admin' || auth.id in data.role == 'coach'",
      // Only admins can delete tournaments
      delete: "auth.id in data.role == 'admin'",
    },
  },

  matches: {
    allow: {
      // Everyone can view matches
      view: "true",
      // Admins and coaches can create matches
      create:
        "auth.id in data.role == 'admin' || auth.id in data.role == 'coach'",
      // Admins and coaches can update matches (scores, etc.)
      update:
        "auth.id in data.role == 'admin' || auth.id in data.role == 'coach'",
      // Only admins can delete matches
      delete: "auth.id in data.role == 'admin'",
    },
    bind: ["homeScore", "awayScore", "result"],
  },

  standings: {
    allow: {
      // Everyone can view standings
      view: "true",
      // Only admins can create standings
      create: "auth.id in data.role == 'admin'",
      // Admins and coaches can update standings
      update:
        "auth.id in data.role == 'admin' || auth.id in data.role == 'coach'",
      // Only admins can delete standings
      delete: "auth.id in data.role == 'admin'",
    },
    bind: [
      "position",
      "played",
      "won",
      "drawn",
      "lost",
      "goalsFor",
      "goalsAgainst",
      "goalDifference",
      "points",
    ],
  },

  // ============================================
  // PAYMENT SYSTEM
  // ============================================
  paymentConcepts: {
    allow: {
      // Only admins can view payment concepts
      view: "auth.id in data.role == 'admin'",
      // Only admins can create payment concepts
      create: "auth.id in data.role == 'admin'",
      // Only admins can update payment concepts
      update: "auth.id in data.role == 'admin'",
      // Only admins can delete payment concepts
      delete: "auth.id in data.role == 'admin'",
    },
  },

  accountsReceivable: {
    allow: {
      // Players can see their own accounts, admins see all
      view:
        "auth.id in data.playerProfile.user.id || auth.id in data.role == 'admin'",
      // Only admins can create accounts receivable
      create: "auth.id in data.role == 'admin'",
      // Only admins can update accounts receivable
      update: "auth.id in data.role == 'admin'",
      // Only admins can delete accounts receivable
      delete: "auth.id in data.role == 'admin'",
    },
    bind: ["status"],
  },

  payments: {
    allow: {
      // Players can see their own payments, admins see all
      view:
        "auth.id in data.playerProfile.user.id || auth.id in data.role == 'admin'",
      // Only admins can record payments
      create: "auth.id in data.role == 'admin'",
      // Only admins can update payments
      update: "auth.id in data.role == 'admin'",
      // Only admins can delete payments
      delete: "auth.id in data.role == 'admin'",
    },
  },

  paymentApplications: {
    allow: {
      // Players can see applications for their payments, admins see all
      view:
        "auth.id in data.payment.playerProfile.user.id || auth.id in data.role == 'admin'",
      // Only admins can create payment applications
      create: "auth.id in data.role == 'admin'",
      // Only admins can update payment applications
      update: "auth.id in data.role == 'admin'",
      // Only admins can delete payment applications
      delete: "auth.id in data.role == 'admin'",
    },
  },

  // ============================================
  // DOCUMENTS
  // ============================================
  documents: {
    allow: {
      // Players can see their own documents, admins see all
      view:
        "auth.id in data.playerProfile.user.id || auth.id in data.role == 'admin'",
      // Players can upload their own documents, admins can upload for anyone
      create:
        "auth.id in data.playerProfile.user.id || auth.id in data.role == 'admin'",
      // Only admins can update documents (approve/reject)
      update: "auth.id in data.role == 'admin'",
      // Players can delete their own documents, admins can delete any
      delete:
        "auth.id in data.playerProfile.user.id || auth.id in data.role == 'admin'",
    },
    bind: ["status", "reviewedAt"],
  },

  // ============================================
  // CONTACT FORM SUBMISSIONS
  // ============================================
  contactSubmissions: {
    allow: {
      // Only admins can view contact submissions
      view: "auth.id in data.role == 'admin'",
      // Anyone can submit a contact form (even anonymous)
      create: "true",
      // Only admins can update (mark as read)
      update: "auth.id in data.role == 'admin'",
      // Only admins can delete submissions
      delete: "auth.id in data.role == 'admin'",
    },
    bind: ["isRead"],
  },
};
