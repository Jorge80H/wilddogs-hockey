import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { setupAuth, isAuthenticated as authMiddleware } from "./replitAuth";
import {
  insertPlayerProfileSchema,
  insertCoachSchema,
  insertNewsPostSchema,
  insertGalleryAlbumSchema,
  insertGalleryImageSchema,
  insertTournamentSchema,
  insertMatchSchema,
  insertStandingSchema,
  insertPaymentConceptSchema,
  insertAccountReceivableSchema,
  insertPaymentSchema,
  insertDocumentSchema,
  insertContactSubmissionSchema,
  insertCategoryAchievementSchema,
  users,
  playerProfiles,
} from "@shared/schema";
import { eq } from "drizzle-orm";

// Helper middleware using the auth from replitAuth
const isAuthenticated = authMiddleware;

// Middleware to check if user is admin
async function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).send("401: Unauthorized");
  }
  
  const user = req.user as any;
  const userId = user.claims?.sub;
  
  if (!userId) {
    return res.status(401).send("401: Unauthorized");
  }
  
  const dbUser = await storage.getUser(userId);
  
  if (!dbUser || dbUser.role !== "admin") {
    return res.status(403).send("403: Forbidden - Admin access required");
  }
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ============================================
  // AUTH SETUP & ROUTES
  // ============================================
  
  // Setup Replit Auth
  await setupAuth(app);
  
  // Get current user
  app.get("/api/auth/user", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const userId = user.claims?.sub;
      const dbUser = await storage.getUser(userId);
      res.json(dbUser);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // ============================================
  // PUBLIC ROUTES
  // ============================================

  // Get all news posts
  app.get("/api/news", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const posts = await storage.getNewsPosts(limit);
      res.json(posts);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Get gallery albums
  app.get("/api/galleries", async (req: Request, res: Response) => {
    try {
      const albums = await storage.getGalleryAlbums();
      res.json(albums);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Get images for an album
  app.get("/api/galleries/:albumId/images", async (req: Request, res: Response) => {
    try {
      const albumId = parseInt(req.params.albumId);
      const images = await storage.getGalleryImages(albumId);
      res.json(images);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Get players by category with user info
  app.get("/api/categories/:categoryId/players", async (req: Request, res: Response) => {
    try {
      const categoryId = req.params.categoryId;
      const profiles = await storage.getPlayersByCategory(categoryId);
      
      // Fetch user info for each player
      const playersWithUsers = await Promise.all(
        profiles.map(async (profile) => {
          const user = await storage.getUser(profile.userId);
          return { ...profile, user };
        })
      );
      
      res.json(playersWithUsers);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Get coaches by category
  app.get("/api/categories/:categoryId/coaches", async (req: Request, res: Response) => {
    try {
      const categoryId = req.params.categoryId === "all" ? null : req.params.categoryId;
      const coaches = await storage.getCoachesByCategory(categoryId);
      res.json(coaches);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Get category achievements
  app.get("/api/categories/:categoryId/achievements", async (req: Request, res: Response) => {
    try {
      const categoryId = req.params.categoryId;
      const achievements = await storage.getAchievementsByCategory(categoryId);
      res.json(achievements);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Get tournaments
  app.get("/api/tournaments", async (req: Request, res: Response) => {
    try {
      const tournaments = await storage.getTournaments();
      res.json(tournaments);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Get upcoming matches
  app.get("/api/matches/upcoming", async (req: Request, res: Response) => {
    try {
      const matches = await storage.getUpcomingMatches();
      res.json(matches);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Get past matches
  app.get("/api/matches/past", async (req: Request, res: Response) => {
    try {
      const matches = await storage.getPastMatches();
      res.json(matches);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Get standings
  app.get("/api/standings", async (req: Request, res: Response) => {
    try {
      const tournamentId = req.query.tournamentId ? parseInt(req.query.tournamentId as string) : undefined;
      const standings = await storage.getStandings(tournamentId);
      res.json(standings);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      res.json(submission);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  // ============================================
  // PROTECTED ROUTES (Authenticated Users)
  // ============================================

  // Get player profile with user info
  app.get("/api/player/profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const userId = user.claims?.sub;
      const profile = await storage.getPlayerProfile(userId);
      if (!profile) {
        res.status(404).send("Profile not found");
        return;
      }
      const dbUser = await storage.getUser(userId);
      res.json({ ...profile, user: dbUser });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Update player profile
  app.patch("/api/player/profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const userId = user.claims?.sub;
      const validatedData = insertPlayerProfileSchema.partial().parse(req.body);
      const profile = await storage.updatePlayerProfile(userId, validatedData);
      res.json(profile);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  // Get player accounts receivable
  app.get("/api/player/accounts", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const userId = user.claims?.sub;
      const accounts = await storage.getAccountsByUser(userId);
      res.json(accounts);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Get player payments
  app.get("/api/player/payments", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const userId = user.claims?.sub;
      const payments = await storage.getPaymentsByUser(userId);
      res.json(payments);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Get player documents
  app.get("/api/player/documents", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const userId = user.claims?.sub;
      const documents = await storage.getDocumentsByUser(userId);
      res.json(documents);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Upload document
  app.post("/api/player/documents", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const userId = user.claims?.sub;
      const validatedData = insertDocumentSchema.parse({ ...req.body, userId });
      const document = await storage.createDocument(validatedData);
      res.json(document);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  // ============================================
  // ADMIN ROUTES
  // ============================================

  // --- User Management ---
  app.get("/api/admin/users", isAdmin, async (req: Request, res: Response) => {
    try {
      const allUsers = await db.select().from(users);
      res.json(allUsers);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.patch("/api/admin/users/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const user = await storage.updateUser(userId, req.body);
      res.json(user);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  // --- News Management ---
  app.post("/api/admin/news", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertNewsPostSchema.parse(req.body);
      const post = await storage.createNewsPost(validatedData);
      res.json(post);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.patch("/api/admin/news/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertNewsPostSchema.partial().parse(req.body);
      const post = await storage.updateNewsPost(id, validatedData);
      res.json(post);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.delete("/api/admin/news/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteNewsPost(id);
      res.json({ success });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // --- Gallery Management ---
  app.post("/api/admin/galleries", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertGalleryAlbumSchema.parse(req.body);
      const album = await storage.createGalleryAlbum(validatedData);
      res.json(album);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.post("/api/admin/galleries/:albumId/images", isAdmin, async (req: Request, res: Response) => {
    try {
      const albumId = parseInt(req.params.albumId);
      const validatedData = insertGalleryImageSchema.parse({ ...req.body, albumId });
      const image = await storage.createGalleryImage(validatedData);
      res.json(image);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  // --- Player Management ---
  app.get("/api/admin/players", isAdmin, async (req: Request, res: Response) => {
    try {
      const allProfiles = await db.select().from(playerProfiles);
      const playersWithUsers = await Promise.all(
        allProfiles.map(async (profile) => {
          const user = await storage.getUser(profile.userId);
          return { ...profile, user };
        })
      );
      res.json(playersWithUsers);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/admin/players", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertPlayerProfileSchema.parse(req.body);
      const profile = await storage.createPlayerProfile(validatedData);
      res.json(profile);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.patch("/api/admin/players/:userId", isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const validatedData = insertPlayerProfileSchema.partial().parse(req.body);
      const profile = await storage.updatePlayerProfile(userId, validatedData);
      res.json(profile);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  // --- Coach Management ---
  app.post("/api/admin/coaches", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertCoachSchema.parse(req.body);
      const coach = await storage.createCoach(validatedData);
      res.json(coach);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.patch("/api/admin/coaches/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCoachSchema.partial().parse(req.body);
      const coach = await storage.updateCoach(id, validatedData);
      res.json(coach);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  // --- Tournament Management ---
  app.post("/api/admin/tournaments", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertTournamentSchema.parse(req.body);
      const tournament = await storage.createTournament(validatedData);
      res.json(tournament);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  // --- Match Management ---
  app.post("/api/admin/matches", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(validatedData);
      res.json(match);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.patch("/api/admin/matches/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMatchSchema.partial().parse(req.body);
      const match = await storage.updateMatch(id, validatedData);
      res.json(match);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  // --- Standings Management ---
  app.post("/api/admin/standings", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertStandingSchema.parse(req.body);
      const standing = await storage.createStanding(validatedData);
      res.json(standing);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.patch("/api/admin/standings/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertStandingSchema.partial().parse(req.body);
      const standing = await storage.updateStanding(id, validatedData);
      res.json(standing);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  // --- Payment Concept Management ---
  app.get("/api/admin/payment-concepts", isAdmin, async (req: Request, res: Response) => {
    try {
      const concepts = await storage.getPaymentConcepts();
      res.json(concepts);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/admin/payment-concepts", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertPaymentConceptSchema.parse(req.body);
      const concept = await storage.createPaymentConcept(validatedData);
      res.json(concept);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.patch("/api/admin/payment-concepts/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPaymentConceptSchema.partial().parse(req.body);
      const concept = await storage.updatePaymentConcept(id, validatedData);
      res.json(concept);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  // --- Accounts Receivable Management ---
  app.get("/api/admin/accounts", isAdmin, async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const accounts = await storage.getAllAccounts(status);
      res.json(accounts);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/admin/accounts", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertAccountReceivableSchema.parse(req.body);
      const account = await storage.createAccountReceivable(validatedData);
      res.json(account);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  app.patch("/api/admin/accounts/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAccountReceivableSchema.partial().parse(req.body);
      const account = await storage.updateAccountReceivable(id, validatedData);
      res.json(account);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  // --- Payment Recording ---
  app.post("/api/admin/payments", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.recordPayment(validatedData);
      
      // Update the corresponding account receivable to "paid"
      if (validatedData.accountReceivableId) {
        await storage.updateAccountReceivable(validatedData.accountReceivableId, {
          status: "paid",
        });
      }
      
      res.json(payment);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  // --- Document Management ---
  app.get("/api/admin/documents", isAdmin, async (req: Request, res: Response) => {
    try {
      const documents = await storage.getPendingDocuments();
      res.json(documents);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.patch("/api/admin/documents/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertDocumentSchema.partial().parse(req.body);
      const document = await storage.updateDocument(id, validatedData);
      res.json(document);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  // --- Category Achievements ---
  app.post("/api/admin/achievements", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertCategoryAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(validatedData);
      res.json(achievement);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
