import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// ENUMS
// ============================================

export const userRoleEnum = pgEnum('user_role', ['admin', 'coach', 'player', 'guardian']);
export const userStatusEnum = pgEnum('user_status', ['pending', 'approved', 'rejected', 'inactive']);
export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);
export const positionEnum = pgEnum('position', ['forward', 'defense', 'goalie']);
export const categoryEnum = pgEnum('category', ['sub8', 'sub12', 'sub14', 'sub16', 'sub18', 'mayores']);
export const documentTypeEnum = pgEnum('document_type', ['id', 'eps', 'medical', 'image_rights', 'other']);
export const documentStatusEnum = pgEnum('document_status', ['pending', 'approved', 'rejected']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'transfer', 'card', 'other']);
export const accountStatusEnum = pgEnum('account_status', ['pending', 'paid', 'overdue']);
export const frequencyEnum = pgEnum('frequency', ['once', 'monthly', 'quarterly', 'annual']);
export const matchResultEnum = pgEnum('match_result', ['win', 'loss', 'draw']);
export const newsStatusEnum = pgEnum('news_status', ['draft', 'published']);

// ============================================
// SESSION & AUTH TABLES (Required for Replit Auth)
// ============================================

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default('player').notNull(),
  status: userStatusEnum("status").default('pending').notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// ============================================
// PLAYER PROFILES
// ============================================

export const playerProfiles = pgTable("player_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  documentType: varchar("document_type", { length: 50 }),
  documentNumber: varchar("document_number", { length: 50 }),
  dateOfBirth: date("date_of_birth"),
  gender: genderEnum("gender"),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  category: categoryEnum("category").notNull(),
  position: positionEnum("position"),
  jerseyNumber: integer("jersey_number"),
  uniformSize: varchar("uniform_size", { length: 10 }),
  
  // Guardian info (for minors)
  guardianName: varchar("guardian_name", { length: 255 }),
  guardianRelationship: varchar("guardian_relationship", { length: 100 }),
  guardianDocument: varchar("guardian_document", { length: 50 }),
  guardianPhone: varchar("guardian_phone", { length: 50 }),
  guardianEmail: varchar("guardian_email", { length: 255 }),
  
  // Medical info
  bloodType: varchar("blood_type", { length: 10 }),
  allergies: text("allergies"),
  medicalConditions: text("medical_conditions"),
  emergencyContact: varchar("emergency_contact", { length: 255 }),
  emergencyPhone: varchar("emergency_phone", { length: 50 }),
  
  // Stats
  gamesPlayed: integer("games_played").default(0),
  goals: integer("goals").default(0),
  assists: integer("assists").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const playerProfileRelations = relations(playerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [playerProfiles.userId],
    references: [users.id],
  }),
  documents: many(documents),
  accountsReceivable: many(accountsReceivable),
}));

export const insertPlayerProfileSchema = createInsertSchema(playerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPlayerProfile = z.infer<typeof insertPlayerProfileSchema>;
export type PlayerProfile = typeof playerProfiles.$inferSelect;

// ============================================
// CATEGORIES
// ============================================

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  ageMin: integer("age_min").notNull(),
  ageMax: integer("age_max"),
  description: text("description"),
  trainingSchedule: text("training_schedule"),
  objectives: text("objectives"),
  imageUrl: varchar("image_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categoryRelations = relations(categories, ({ many }) => ({
  coaches: many(coaches),
  achievements: many(categoryAchievements),
}));

export const insertCategorySchema = createInsertSchema(categories).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// ============================================
// COACHES
// ============================================

export const coaches = pgTable("coaches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").references(() => categories.id, { onDelete: 'cascade' }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(), // e.g., "Head Coach", "Assistant", "Physical Trainer"
  photoUrl: varchar("photo_url", { length: 500 }),
  bio: text("bio"),
  experience: text("experience"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coachRelations = relations(coaches, ({ one }) => ({
  category: one(categories, {
    fields: [coaches.categoryId],
    references: [categories.id],
  }),
}));

export const insertCoachSchema = createInsertSchema(coaches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCoach = z.infer<typeof insertCoachSchema>;
export type Coach = typeof coaches.$inferSelect;

// ============================================
// CATEGORY ACHIEVEMENTS
// ============================================

export const categoryAchievements = pgTable("category_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").references(() => categories.id, { onDelete: 'cascade' }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  year: integer("year").notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categoryAchievementRelations = relations(categoryAchievements, ({ one }) => ({
  category: one(categories, {
    fields: [categoryAchievements.categoryId],
    references: [categories.id],
  }),
}));

export const insertCategoryAchievementSchema = createInsertSchema(categoryAchievements).omit({
  id: true,
  createdAt: true,
});

export type InsertCategoryAchievement = z.infer<typeof insertCategoryAchievementSchema>;
export type CategoryAchievement = typeof categoryAchievements.$inferSelect;

// ============================================
// NEWS & ANNOUNCEMENTS
// ============================================

export const newsPosts = pgTable("news_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  imageUrl: varchar("image_url", { length: 500 }),
  status: newsStatusEnum("status").default('published').notNull(),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNewsPostSchema = createInsertSchema(newsPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNewsPost = z.infer<typeof insertNewsPostSchema>;
export type NewsPost = typeof newsPosts.$inferSelect;

// ============================================
// GALLERY
// ============================================

export const galleryAlbums = pgTable("gallery_albums", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  categoryId: varchar("category_id").references(() => categories.id, { onDelete: 'set null' }),
  coverImageUrl: varchar("cover_image_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const galleryAlbumRelations = relations(galleryAlbums, ({ many, one }) => ({
  images: many(galleryImages),
  category: one(categories, {
    fields: [galleryAlbums.categoryId],
    references: [categories.id],
  }),
}));

export const galleryImages = pgTable("gallery_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  albumId: varchar("album_id").references(() => galleryAlbums.id, { onDelete: 'cascade' }).notNull(),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const galleryImageRelations = relations(galleryImages, ({ one }) => ({
  album: one(galleryAlbums, {
    fields: [galleryImages.albumId],
    references: [galleryAlbums.id],
  }),
}));

export const insertGalleryAlbumSchema = createInsertSchema(galleryAlbums).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGalleryImageSchema = createInsertSchema(galleryImages).omit({
  id: true,
  createdAt: true,
});

export type InsertGalleryAlbum = z.infer<typeof insertGalleryAlbumSchema>;
export type GalleryAlbum = typeof galleryAlbums.$inferSelect;
export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;
export type GalleryImage = typeof galleryImages.$inferSelect;

// ============================================
// TOURNAMENTS & MATCHES
// ============================================

export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  categoryId: varchar("category_id").references(() => categories.id, { onDelete: 'set null' }),
  season: varchar("season", { length: 100 }),
  startDate: date("start_date"),
  endDate: date("end_date"),
  location: varchar("location", { length: 255 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tournamentRelations = relations(tournaments, ({ many, one }) => ({
  matches: many(matches),
  standings: many(standings),
  category: one(categories, {
    fields: [tournaments.categoryId],
    references: [categories.id],
  }),
}));

export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").references(() => tournaments.id, { onDelete: 'cascade' }),
  categoryId: varchar("category_id").references(() => categories.id, { onDelete: 'set null' }),
  date: timestamp("date").notNull(),
  opponent: varchar("opponent", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  result: matchResultEnum("result"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const matchRelations = relations(matches, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [matches.tournamentId],
    references: [tournaments.id],
  }),
  category: one(categories, {
    fields: [matches.categoryId],
    references: [categories.id],
  }),
}));

export const standings = pgTable("standings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").references(() => tournaments.id, { onDelete: 'cascade' }).notNull(),
  teamName: varchar("team_name", { length: 255 }).notNull(),
  position: integer("position").notNull(),
  played: integer("played").default(0).notNull(),
  won: integer("won").default(0).notNull(),
  drawn: integer("drawn").default(0).notNull(),
  lost: integer("lost").default(0).notNull(),
  goalsFor: integer("goals_for").default(0).notNull(),
  goalsAgainst: integer("goals_against").default(0).notNull(),
  goalDifference: integer("goal_difference").default(0).notNull(),
  points: integer("points").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const standingRelations = relations(standings, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [standings.tournamentId],
    references: [tournaments.id],
  }),
}));

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStandingSchema = createInsertSchema(standings).omit({
  id: true,
  updatedAt: true,
});

export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournaments.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertStanding = z.infer<typeof insertStandingSchema>;
export type Standing = typeof standings.$inferSelect;

// ============================================
// PAYMENT SYSTEM
// ============================================

export const paymentConcepts = pgTable("payment_concepts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  frequency: frequencyEnum("frequency").notNull(),
  applicableCategories: text("applicable_categories").array(), // Array of category IDs
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const paymentConceptRelations = relations(paymentConcepts, ({ many }) => ({
  accountsReceivable: many(accountsReceivable),
  payments: many(payments),
}));

export const accountsReceivable = pgTable("accounts_receivable", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerProfileId: varchar("player_profile_id").references(() => playerProfiles.id, { onDelete: 'cascade' }).notNull(),
  conceptId: varchar("concept_id").references(() => paymentConcepts.id, { onDelete: 'set null' }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  status: accountStatusEnum("status").default('pending').notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const accountReceivableRelations = relations(accountsReceivable, ({ one, many }) => ({
  playerProfile: one(playerProfiles, {
    fields: [accountsReceivable.playerProfileId],
    references: [playerProfiles.id],
  }),
  concept: one(paymentConcepts, {
    fields: [accountsReceivable.conceptId],
    references: [paymentConcepts.id],
  }),
  payments: many(paymentApplications),
}));

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerProfileId: varchar("player_profile_id").references(() => playerProfiles.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  notes: text("notes"),
  receiptNumber: varchar("receipt_number", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

export const paymentRelations = relations(payments, ({ one, many }) => ({
  playerProfile: one(playerProfiles, {
    fields: [payments.playerProfileId],
    references: [playerProfiles.id],
  }),
  applications: many(paymentApplications),
  creator: one(users, {
    fields: [payments.createdBy],
    references: [users.id],
  }),
}));

// Junction table to track which accounts a payment was applied to
export const paymentApplications = pgTable("payment_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paymentId: varchar("payment_id").references(() => payments.id, { onDelete: 'cascade' }).notNull(),
  accountId: varchar("account_id").references(() => accountsReceivable.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentApplicationRelations = relations(paymentApplications, ({ one }) => ({
  payment: one(payments, {
    fields: [paymentApplications.paymentId],
    references: [payments.id],
  }),
  account: one(accountsReceivable, {
    fields: [paymentApplications.accountId],
    references: [accountsReceivable.id],
  }),
}));

export const insertPaymentConceptSchema = createInsertSchema(paymentConcepts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAccountReceivableSchema = createInsertSchema(accountsReceivable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentApplicationSchema = createInsertSchema(paymentApplications).omit({
  id: true,
  createdAt: true,
});

export type InsertPaymentConcept = z.infer<typeof insertPaymentConceptSchema>;
export type PaymentConcept = typeof paymentConcepts.$inferSelect;
export type InsertAccountReceivable = z.infer<typeof insertAccountReceivableSchema>;
export type AccountReceivable = typeof accountsReceivable.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPaymentApplication = z.infer<typeof insertPaymentApplicationSchema>;
export type PaymentApplication = typeof paymentApplications.$inferSelect;

// ============================================
// DOCUMENTS
// ============================================

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerProfileId: varchar("player_profile_id").references(() => playerProfiles.id, { onDelete: 'cascade' }).notNull(),
  type: documentTypeEnum("type").notNull(),
  fileUrl: varchar("file_url", { length: 500 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  status: documentStatusEnum("status").default('pending').notNull(),
  notes: text("notes"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
});

export const documentRelations = relations(documents, ({ one }) => ({
  playerProfile: one(playerProfiles, {
    fields: [documents.playerProfileId],
    references: [playerProfiles.id],
  }),
  reviewer: one(users, {
    fields: [documents.reviewedBy],
    references: [users.id],
  }),
}));

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// ============================================
// CONTACT FORM SUBMISSIONS
// ============================================

export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
