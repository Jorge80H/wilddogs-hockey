import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import {
  type User,
  type UpsertUser,
  type InsertUser,
  type PlayerProfile,
  type InsertPlayerProfile,
  type Coach,
  type InsertCoach,
  type NewsPost,
  type InsertNewsPost,
  type GalleryAlbum,
  type InsertGalleryAlbum,
  type GalleryImage,
  type InsertGalleryImage,
  type Tournament,
  type InsertTournament,
  type Match,
  type InsertMatch,
  type Standing,
  type InsertStanding,
  type PaymentConcept,
  type InsertPaymentConcept,
  type AccountReceivable,
  type InsertAccountReceivable,
  type Payment,
  type InsertPayment,
  type Document,
  type InsertDocument,
  type ContactSubmission,
  type InsertContactSubmission,
  type CategoryAchievement,
  type InsertCategoryAchievement,
  users,
  playerProfiles,
  coaches,
  newsPosts,
  galleryAlbums,
  galleryImages,
  tournaments,
  matches,
  standings,
  paymentConcepts,
  accountsReceivable,
  payments,
  documents,
  contactSubmissions,
  categoryAchievements,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Player Profiles
  getPlayerProfile(userId: string): Promise<PlayerProfile | undefined>;
  getPlayersByCategory(category: string): Promise<PlayerProfile[]>;
  createPlayerProfile(profile: InsertPlayerProfile): Promise<PlayerProfile>;
  updatePlayerProfile(userId: string, profile: Partial<InsertPlayerProfile>): Promise<PlayerProfile | undefined>;

  // Coaches
  getCoachesByCategory(category: string | null): Promise<Coach[]>;
  createCoach(coach: InsertCoach): Promise<Coach>;
  updateCoach(id: number, coach: Partial<InsertCoach>): Promise<Coach | undefined>;

  // News
  getNewsPosts(limit?: number): Promise<NewsPost[]>;
  createNewsPost(post: InsertNewsPost): Promise<NewsPost>;
  updateNewsPost(id: number, post: Partial<InsertNewsPost>): Promise<NewsPost | undefined>;
  deleteNewsPost(id: number): Promise<boolean>;

  // Galleries
  getGalleryAlbums(): Promise<GalleryAlbum[]>;
  getGalleryImages(albumId: number): Promise<GalleryImage[]>;
  createGalleryAlbum(album: InsertGalleryAlbum): Promise<GalleryAlbum>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;

  // Tournaments
  getTournaments(): Promise<Tournament[]>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;

  // Matches
  getUpcomingMatches(): Promise<Match[]>;
  getPastMatches(): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: number, match: Partial<InsertMatch>): Promise<Match | undefined>;

  // Standings
  getStandings(tournamentId?: number): Promise<Standing[]>;
  createStanding(standing: InsertStanding): Promise<Standing>;
  updateStanding(id: number, standing: Partial<InsertStanding>): Promise<Standing | undefined>;

  // Payment Concepts
  getPaymentConcepts(active?: boolean): Promise<PaymentConcept[]>;
  createPaymentConcept(concept: InsertPaymentConcept): Promise<PaymentConcept>;
  updatePaymentConcept(id: number, concept: Partial<InsertPaymentConcept>): Promise<PaymentConcept | undefined>;

  // Accounts Receivable
  getAccountsByUser(userId: string): Promise<AccountReceivable[]>;
  getAllAccounts(status?: string): Promise<AccountReceivable[]>;
  createAccountReceivable(account: InsertAccountReceivable): Promise<AccountReceivable>;
  updateAccountReceivable(id: number, account: Partial<InsertAccountReceivable>): Promise<AccountReceivable | undefined>;

  // Payments
  recordPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByUser(userId: string): Promise<Payment[]>;

  // Documents
  getDocumentsByUser(userId: string): Promise<Document[]>;
  getPendingDocuments(): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;

  // Contact Submissions
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;

  // Category Achievements
  getAchievementsByCategory(categoryId: string): Promise<CategoryAchievement[]>;
  createAchievement(achievement: InsertCategoryAchievement): Promise<CategoryAchievement>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Player Profiles
  async getPlayerProfile(userId: string): Promise<PlayerProfile | undefined> {
    const [profile] = await db.select().from(playerProfiles).where(eq(playerProfiles.userId, userId));
    return profile;
  }

  async getPlayersByCategory(category: string): Promise<PlayerProfile[]> {
    return await db.select().from(playerProfiles).where(eq(playerProfiles.category, category));
  }

  async createPlayerProfile(profile: InsertPlayerProfile): Promise<PlayerProfile> {
    const [newProfile] = await db.insert(playerProfiles).values(profile).returning();
    return newProfile;
  }

  async updatePlayerProfile(userId: string, updateData: Partial<InsertPlayerProfile>): Promise<PlayerProfile | undefined> {
    const [profile] = await db.update(playerProfiles).set(updateData).where(eq(playerProfiles.userId, userId)).returning();
    return profile;
  }

  // Coaches
  async getCoachesByCategory(category: string | null): Promise<Coach[]> {
    if (category === null) {
      return await db.select().from(coaches).orderBy(desc(coaches.id));
    }
    return await db.select().from(coaches).where(eq(coaches.categoryId, category));
  }

  async createCoach(coach: InsertCoach): Promise<Coach> {
    const [newCoach] = await db.insert(coaches).values(coach).returning();
    return newCoach;
  }

  async updateCoach(id: number, updateData: Partial<InsertCoach>): Promise<Coach | undefined> {
    const [coach] = await db.update(coaches).set(updateData).where(eq(coaches.id, id)).returning();
    return coach;
  }

  // News
  async getNewsPosts(limit: number = 10): Promise<NewsPost[]> {
    return await db.select().from(newsPosts).where(eq(newsPosts.published, true)).orderBy(desc(newsPosts.publishedDate)).limit(limit);
  }

  async createNewsPost(post: InsertNewsPost): Promise<NewsPost> {
    const [newPost] = await db.insert(newsPosts).values(post).returning();
    return newPost;
  }

  async updateNewsPost(id: number, updateData: Partial<InsertNewsPost>): Promise<NewsPost | undefined> {
    const [post] = await db.update(newsPosts).set(updateData).where(eq(newsPosts.id, id)).returning();
    return post;
  }

  async deleteNewsPost(id: number): Promise<boolean> {
    const result = await db.delete(newsPosts).where(eq(newsPosts.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Galleries
  async getGalleryAlbums(): Promise<GalleryAlbum[]> {
    return await db.select().from(galleryAlbums).orderBy(desc(galleryAlbums.createdDate));
  }

  async getGalleryImages(albumId: number): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages).where(eq(galleryImages.albumId, albumId)).orderBy(desc(galleryImages.id));
  }

  async createGalleryAlbum(album: InsertGalleryAlbum): Promise<GalleryAlbum> {
    const [newAlbum] = await db.insert(galleryAlbums).values(album).returning();
    return newAlbum;
  }

  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const [newImage] = await db.insert(galleryImages).values(image).returning();
    return newImage;
  }

  // Tournaments
  async getTournaments(): Promise<Tournament[]> {
    return await db.select().from(tournaments).orderBy(desc(tournaments.startDate));
  }

  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const [newTournament] = await db.insert(tournaments).values(tournament).returning();
    return newTournament;
  }

  // Matches
  async getUpcomingMatches(): Promise<Match[]> {
    const now = new Date().toISOString();
    return await db.select().from(matches).where(gte(matches.date, now)).orderBy(matches.date).limit(10);
  }

  async getPastMatches(): Promise<Match[]> {
    const now = new Date().toISOString();
    return await db.select().from(matches).where(lte(matches.date, now)).orderBy(desc(matches.date)).limit(10);
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const [newMatch] = await db.insert(matches).values(match).returning();
    return newMatch;
  }

  async updateMatch(id: number, updateData: Partial<InsertMatch>): Promise<Match | undefined> {
    const [match] = await db.update(matches).set(updateData).where(eq(matches.id, id)).returning();
    return match;
  }

  // Standings
  async getStandings(tournamentId?: number): Promise<Standing[]> {
    if (tournamentId) {
      return await db.select().from(standings).where(eq(standings.tournamentId, tournamentId)).orderBy(standings.position);
    }
    return await db.select().from(standings).orderBy(standings.position);
  }

  async createStanding(standing: InsertStanding): Promise<Standing> {
    const [newStanding] = await db.insert(standings).values(standing).returning();
    return newStanding;
  }

  async updateStanding(id: number, updateData: Partial<InsertStanding>): Promise<Standing | undefined> {
    const [standing] = await db.update(standings).set(updateData).where(eq(standings.id, id)).returning();
    return standing;
  }

  // Payment Concepts
  async getPaymentConcepts(active?: boolean): Promise<PaymentConcept[]> {
    if (active !== undefined) {
      return await db.select().from(paymentConcepts).where(eq(paymentConcepts.isActive, active));
    }
    return await db.select().from(paymentConcepts);
  }

  async createPaymentConcept(concept: InsertPaymentConcept): Promise<PaymentConcept> {
    const [newConcept] = await db.insert(paymentConcepts).values(concept).returning();
    return newConcept;
  }

  async updatePaymentConcept(id: number, updateData: Partial<InsertPaymentConcept>): Promise<PaymentConcept | undefined> {
    const [concept] = await db.update(paymentConcepts).set(updateData).where(eq(paymentConcepts.id, id)).returning();
    return concept;
  }

  // Accounts Receivable
  async getAccountsByUser(userId: string): Promise<AccountReceivable[]> {
    return await db.select().from(accountsReceivable).where(eq(accountsReceivable.userId, userId)).orderBy(accountsReceivable.dueDate);
  }

  async getAllAccounts(status?: string): Promise<AccountReceivable[]> {
    if (status) {
      return await db.select().from(accountsReceivable).where(eq(accountsReceivable.status, status)).orderBy(accountsReceivable.dueDate);
    }
    return await db.select().from(accountsReceivable).orderBy(accountsReceivable.dueDate);
  }

  async createAccountReceivable(account: InsertAccountReceivable): Promise<AccountReceivable> {
    const [newAccount] = await db.insert(accountsReceivable).values(account).returning();
    return newAccount;
  }

  async updateAccountReceivable(id: number, updateData: Partial<InsertAccountReceivable>): Promise<AccountReceivable | undefined> {
    const [account] = await db.update(accountsReceivable).set(updateData).where(eq(accountsReceivable.id, id)).returning();
    return account;
  }

  // Payments
  async recordPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.paymentDate));
  }

  // Documents
  async getDocumentsByUser(userId: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.uploadedDate));
  }

  async getPendingDocuments(): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.status, "pending")).orderBy(desc(documents.uploadedDate));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async updateDocument(id: number, updateData: Partial<InsertDocument>): Promise<Document | undefined> {
    const [document] = await db.update(documents).set(updateData).where(eq(documents.id, id)).returning();
    return document;
  }

  // Contact Submissions
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [newSubmission] = await db.insert(contactSubmissions).values(submission).returning();
    return newSubmission;
  }

  // Category Achievements
  async getAchievementsByCategory(categoryId: string): Promise<CategoryAchievement[]> {
    return await db.select().from(categoryAchievements).where(eq(categoryAchievements.categoryId, categoryId)).orderBy(desc(categoryAchievements.year));
  }

  async createAchievement(achievement: InsertCategoryAchievement): Promise<CategoryAchievement> {
    const [newAchievement] = await db.insert(categoryAchievements).values(achievement).returning();
    return newAchievement;
  }
}

export const storage = new DatabaseStorage();
