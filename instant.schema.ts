import { i } from "@instantdb/react";

/**
 * Wild Dogs Hockey Club - InstantDB Schema
 *
 * This schema defines the complete data model for the hockey club management system.
 * It replaces the previous PostgreSQL/Drizzle ORM schema with InstantDB's graph-based approach.
 *
 * Key differences from SQL:
 * - No explicit foreign keys - uses link attributes instead
 * - No enums - uses string literals validated in permissions
 * - Timestamps as numbers (milliseconds since epoch)
 * - Monetary amounts as strings to avoid floating point precision issues
 */

const graph = i.graph(
  // ============================================
  // ENTITIES
  // ============================================
  {
    // --------------------------------------------
    // USERS & AUTHENTICATION
    // --------------------------------------------
    users: i.entity({
      email: i.string().unique().indexed(),
      firstName: i.string().optional(),
      lastName: i.string().optional(),
      profileImageUrl: i.string().optional(),
      // role: 'admin' | 'coach' | 'player' | 'guardian'
      role: i.string().indexed(),
      // status: 'pending' | 'approved' | 'rejected' | 'inactive'
      status: i.string().indexed(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    // --------------------------------------------
    // PLAYER PROFILES
    // --------------------------------------------
    playerProfiles: i.entity({
      // Personal info
      documentType: i.string().optional(),
      documentNumber: i.string().optional(),
      dateOfBirth: i.string().optional(), // ISO date string
      // gender: 'male' | 'female' | 'other'
      gender: i.string().optional(),
      phone: i.string().optional(),
      address: i.string().optional(),
      // category: 'sub8' | 'sub12' | 'sub14' | 'sub16' | 'sub18' | 'mayores'
      category: i.string().indexed(),
      // position: 'forward' | 'defense' | 'goalie'
      position: i.string().optional(),
      jerseyNumber: i.number().optional(),
      uniformSize: i.string().optional(),

      // Guardian info (for minors)
      guardianName: i.string().optional(),
      guardianRelationship: i.string().optional(),
      guardianDocument: i.string().optional(),
      guardianPhone: i.string().optional(),
      guardianEmail: i.string().optional(),

      // Medical info
      bloodType: i.string().optional(),
      allergies: i.string().optional(),
      medicalConditions: i.string().optional(),
      emergencyContact: i.string().optional(),
      emergencyPhone: i.string().optional(),

      // Stats
      gamesPlayed: i.number(),
      goals: i.number(),
      assists: i.number(),

      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    // --------------------------------------------
    // CATEGORIES
    // --------------------------------------------
    categories: i.entity({
      // Use category ID as the entity ID (sub8, sub12, etc.)
      name: i.string(),
      ageMin: i.number(),
      ageMax: i.number().optional(),
      description: i.string().optional(),
      trainingSchedule: i.string().optional(),
      objectives: i.string().optional(),
      imageUrl: i.string().optional(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    // --------------------------------------------
    // COACHES
    // --------------------------------------------
    coaches: i.entity({
      name: i.string(),
      // role: e.g., "Head Coach", "Assistant", "Physical Trainer"
      role: i.string(),
      photoUrl: i.string().optional(),
      bio: i.string().optional(),
      experience: i.string().optional(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    // --------------------------------------------
    // CATEGORY ACHIEVEMENTS
    // --------------------------------------------
    categoryAchievements: i.entity({
      title: i.string(),
      description: i.string().optional(),
      year: i.number(),
      imageUrl: i.string().optional(),
      createdAt: i.number(),
    }),

    // --------------------------------------------
    // NEWS & ANNOUNCEMENTS
    // --------------------------------------------
    newsPosts: i.entity({
      title: i.string(),
      content: i.string(),
      excerpt: i.string().optional(),
      imageUrl: i.string().optional(),
      // status: 'draft' | 'published'
      status: i.string().indexed(),
      publishedAt: i.number(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    // --------------------------------------------
    // GALLERY
    // --------------------------------------------
    galleryAlbums: i.entity({
      title: i.string(),
      description: i.string().optional(),
      coverImageUrl: i.string().optional(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    galleryImages: i.entity({
      imageUrl: i.string(),
      caption: i.string().optional(),
      createdAt: i.number(),
    }),

    // --------------------------------------------
    // TOURNAMENTS & MATCHES
    // --------------------------------------------
    tournaments: i.entity({
      name: i.string(),
      season: i.string().optional(),
      startDate: i.string().optional(), // ISO date string
      endDate: i.string().optional(), // ISO date string
      location: i.string().optional(),
      description: i.string().optional(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    matches: i.entity({
      date: i.number(), // timestamp
      opponent: i.string(),
      location: i.string().optional(),
      homeScore: i.number().optional(),
      awayScore: i.number().optional(),
      // result: 'win' | 'loss' | 'draw'
      result: i.string().optional(),
      notes: i.string().optional(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    standings: i.entity({
      teamName: i.string(),
      position: i.number(),
      played: i.number(),
      won: i.number(),
      drawn: i.number(),
      lost: i.number(),
      goalsFor: i.number(),
      goalsAgainst: i.number(),
      goalDifference: i.number(),
      points: i.number(),
      updatedAt: i.number(),
    }),

    // --------------------------------------------
    // PAYMENT SYSTEM
    // --------------------------------------------
    paymentConcepts: i.entity({
      name: i.string(),
      description: i.string().optional(),
      // Store as string to avoid floating point precision issues
      amount: i.string(),
      // frequency: 'once' | 'monthly' | 'quarterly' | 'annual'
      frequency: i.string(),
      // Array of category IDs as JSON
      applicableCategories: i.json(),
      isActive: i.boolean(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    accountsReceivable: i.entity({
      // Store as string to avoid floating point precision issues
      amount: i.string(),
      dueDate: i.string(), // ISO date string
      // status: 'pending' | 'paid' | 'overdue'
      status: i.string().indexed(),
      description: i.string().optional(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),

    payments: i.entity({
      // Store as string to avoid floating point precision issues
      amount: i.string(),
      paymentDate: i.string(), // ISO date string
      // paymentMethod: 'cash' | 'transfer' | 'card' | 'other'
      paymentMethod: i.string(),
      referenceNumber: i.string().optional(),
      notes: i.string().optional(),
      receiptNumber: i.string().unique(),
      createdAt: i.number(),
    }),

    // Junction table: links payments to accounts receivable
    paymentApplications: i.entity({
      // Store as string to avoid floating point precision issues
      amount: i.string(),
      createdAt: i.number(),
    }),

    // --------------------------------------------
    // DOCUMENTS
    // --------------------------------------------
    documents: i.entity({
      // type: 'id' | 'eps' | 'medical' | 'image_rights' | 'other'
      type: i.string(),
      fileUrl: i.string(),
      fileName: i.string(),
      // status: 'pending' | 'approved' | 'rejected'
      status: i.string().indexed(),
      notes: i.string().optional(),
      uploadedAt: i.number(),
      reviewedAt: i.number().optional(),
    }),

    // --------------------------------------------
    // CONTACT FORM SUBMISSIONS
    // --------------------------------------------
    contactSubmissions: i.entity({
      name: i.string(),
      email: i.string(),
      phone: i.string().optional(),
      subject: i.string(),
      message: i.string(),
      isRead: i.boolean(),
      createdAt: i.number(),
    }),
  },

  // ============================================
  // RELATIONSHIPS (Links)
  // ============================================
  {
    // --------------------------------------------
    // USER RELATIONSHIPS
    // --------------------------------------------

    // users <-> playerProfiles (one-to-one)
    userPlayerProfile: {
      forward: {
        on: "users",
        has: "one",
        label: "playerProfile",
      },
      reverse: {
        on: "playerProfiles",
        has: "one",
        label: "user",
      },
    },

    // --------------------------------------------
    // PLAYER PROFILE RELATIONSHIPS
    // --------------------------------------------

    // playerProfiles -> documents (one-to-many)
    playerDocuments: {
      forward: {
        on: "playerProfiles",
        has: "many",
        label: "documents",
      },
      reverse: {
        on: "documents",
        has: "one",
        label: "playerProfile",
      },
    },

    // playerProfiles -> accountsReceivable (one-to-many)
    playerAccounts: {
      forward: {
        on: "playerProfiles",
        has: "many",
        label: "accountsReceivable",
      },
      reverse: {
        on: "accountsReceivable",
        has: "one",
        label: "playerProfile",
      },
    },

    // playerProfiles -> payments (one-to-many)
    playerPayments: {
      forward: {
        on: "playerProfiles",
        has: "many",
        label: "payments",
      },
      reverse: {
        on: "payments",
        has: "one",
        label: "playerProfile",
      },
    },

    // --------------------------------------------
    // CATEGORY RELATIONSHIPS
    // --------------------------------------------

    // categories -> coaches (one-to-many)
    categoryCoaches: {
      forward: {
        on: "categories",
        has: "many",
        label: "coaches",
      },
      reverse: {
        on: "coaches",
        has: "one",
        label: "category",
      },
    },

    // categories -> achievements (one-to-many)
    categoryAchievements: {
      forward: {
        on: "categories",
        has: "many",
        label: "achievements",
      },
      reverse: {
        on: "categoryAchievements",
        has: "one",
        label: "category",
      },
    },

    // categories -> tournaments (one-to-many)
    categoryTournaments: {
      forward: {
        on: "categories",
        has: "many",
        label: "tournaments",
      },
      reverse: {
        on: "tournaments",
        has: "one",
        label: "category",
      },
    },

    // categories -> matches (one-to-many)
    categoryMatches: {
      forward: {
        on: "categories",
        has: "many",
        label: "matches",
      },
      reverse: {
        on: "matches",
        has: "one",
        label: "category",
      },
    },

    // categories -> galleryAlbums (one-to-many)
    categoryAlbums: {
      forward: {
        on: "categories",
        has: "many",
        label: "albums",
      },
      reverse: {
        on: "galleryAlbums",
        has: "one",
        label: "category",
      },
    },

    // --------------------------------------------
    // TOURNAMENT RELATIONSHIPS
    // --------------------------------------------

    // tournaments -> matches (one-to-many)
    tournamentMatches: {
      forward: {
        on: "tournaments",
        has: "many",
        label: "matches",
      },
      reverse: {
        on: "matches",
        has: "one",
        label: "tournament",
      },
    },

    // tournaments -> standings (one-to-many)
    tournamentStandings: {
      forward: {
        on: "tournaments",
        has: "many",
        label: "standings",
      },
      reverse: {
        on: "standings",
        has: "one",
        label: "tournament",
      },
    },

    // --------------------------------------------
    // GALLERY RELATIONSHIPS
    // --------------------------------------------

    // galleryAlbums -> galleryImages (one-to-many)
    albumImages: {
      forward: {
        on: "galleryAlbums",
        has: "many",
        label: "images",
      },
      reverse: {
        on: "galleryImages",
        has: "one",
        label: "album",
      },
    },

    // --------------------------------------------
    // PAYMENT SYSTEM RELATIONSHIPS
    // --------------------------------------------

    // paymentConcepts -> accountsReceivable (one-to-many)
    conceptAccounts: {
      forward: {
        on: "paymentConcepts",
        has: "many",
        label: "accounts",
      },
      reverse: {
        on: "accountsReceivable",
        has: "one",
        label: "concept",
      },
    },

    // paymentApplications -> payment (many-to-one)
    applicationPayment: {
      forward: {
        on: "paymentApplications",
        has: "one",
        label: "payment",
      },
      reverse: {
        on: "payments",
        has: "many",
        label: "applications",
      },
    },

    // paymentApplications -> accountReceivable (many-to-one)
    applicationAccount: {
      forward: {
        on: "paymentApplications",
        has: "one",
        label: "account",
      },
      reverse: {
        on: "accountsReceivable",
        has: "many",
        label: "paymentApplications",
      },
    },

    // --------------------------------------------
    // DOCUMENT RELATIONSHIPS
    // --------------------------------------------

    // documents -> reviewer (user who reviewed)
    documentReviewer: {
      forward: {
        on: "documents",
        has: "one",
        label: "reviewer",
      },
      reverse: {
        on: "users",
        has: "many",
        label: "reviewedDocuments",
      },
    },

    // payments -> creator (user who created payment)
    paymentCreator: {
      forward: {
        on: "payments",
        has: "one",
        label: "creator",
      },
      reverse: {
        on: "users",
        has: "many",
        label: "createdPayments",
      },
    },
  }
);

export default graph;
