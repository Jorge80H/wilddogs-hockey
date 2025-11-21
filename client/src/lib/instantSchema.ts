/**
 * InstantDB Schema Definition
 *
 * Este archivo define el schema TypeScript para InstantDB
 * Debe coincidir con el schema configurado en el dashboard de InstantDB
 */

export interface InstantSchema {
  users: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    role: 'admin' | 'coach' | 'player' | 'guardian';
    status: 'pending' | 'approved' | 'rejected' | 'inactive';
    createdAt: number;
  };

  playerProfiles: {
    id: string;
    userId: string;
    documentType?: string;
    documentNumber?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    phone?: string;
    address?: string;
    category: 'sub8' | 'sub12' | 'sub14' | 'sub16' | 'sub18' | 'mayores';
    position?: 'forward' | 'defense' | 'goalie';
    jerseyNumber?: number;
    uniformSize?: string;

    // Guardian info
    guardianName?: string;
    guardianRelationship?: string;
    guardianDocument?: string;
    guardianPhone?: string;
    guardianEmail?: string;

    // Medical info
    bloodType?: string;
    allergies?: string;
    medicalConditions?: string;
    emergencyContact?: string;
    emergencyPhone?: string;

    // Stats
    gamesPlayed: number;
    goals: number;
    assists: number;

    createdAt: number;
  };

  categories: {
    id: string;
    name: string;
    ageMin: number;
    ageMax?: number;
    description?: string;
    trainingSchedule?: string;
    objectives?: string;
    imageUrl?: string;
    createdAt: number;
  };

  coaches: {
    id: string;
    categoryId: string;
    name: string;
    role: string;
    photoUrl?: string;
    bio?: string;
    experience?: string;
    createdAt: number;
  };

  newsPosts: {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    imageUrl?: string;
    status: 'draft' | 'published';
    publishedAt: number;
    createdAt: number;
  };

  tournaments: {
    id: string;
    name: string;
    categoryId?: string;
    season?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    description?: string;
    createdAt: number;
  };

  matches: {
    id: string;
    tournamentId?: string;
    categoryId?: string;
    date: number;
    opponent: string;
    location?: string;
    homeScore?: number;
    awayScore?: number;
    result?: 'win' | 'loss' | 'draw';
    notes?: string;
    createdAt: number;
  };

  standings: {
    id: string;
    tournamentId: string;
    teamName: string;
    position: number;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
  };

  paymentConcepts: {
    id: string;
    name: string;
    description?: string;
    amount: number;
    frequency: 'once' | 'monthly' | 'quarterly' | 'annual';
    applicableCategories: string[];
    isActive: boolean;
    createdAt: number;
  };

  accountsReceivable: {
    id: string;
    playerProfileId: string;
    conceptId?: string;
    amount: number;
    dueDate: string;
    status: 'pending' | 'paid' | 'overdue';
    description?: string;
    createdAt: number;
  };

  payments: {
    id: string;
    playerProfileId: string;
    amount: number;
    paymentDate: string;
    paymentMethod: 'cash' | 'transfer' | 'card' | 'other';
    referenceNumber?: string;
    notes?: string;
    receiptNumber: string;
    createdAt: number;
  };

  documents: {
    id: string;
    playerProfileId: string;
    type: 'id' | 'eps' | 'medical' | 'image_rights' | 'other';
    fileUrl: string;
    fileName: string;
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
    uploadedAt: number;
  };

  contactSubmissions: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    isRead: boolean;
    createdAt: number;
  };

  galleryAlbums: {
    id: string;
    title: string;
    description?: string;
    categoryId?: string;
    coverImageUrl?: string;
    createdAt: number;
  };

  galleryImages: {
    id: string;
    albumId: string;
    imageUrl: string;
    caption?: string;
    createdAt: number;
  };

  categoryAchievements: {
    id: string;
    categoryId: string;
    title: string;
    description?: string;
    year: number;
    imageUrl?: string;
    createdAt: number;
  };
}

// Type helper para obtener tipos de entidades
export type User = InstantSchema['users'];
export type PlayerProfile = InstantSchema['playerProfiles'];
export type Category = InstantSchema['categories'];
export type Coach = InstantSchema['coaches'];
export type NewsPost = InstantSchema['newsPosts'];
export type Tournament = InstantSchema['tournaments'];
export type Match = InstantSchema['matches'];
export type Standing = InstantSchema['standings'];
export type PaymentConcept = InstantSchema['paymentConcepts'];
export type AccountReceivable = InstantSchema['accountsReceivable'];
export type Payment = InstantSchema['payments'];
export type Document = InstantSchema['documents'];
export type ContactSubmission = InstantSchema['contactSubmissions'];
export type GalleryAlbum = InstantSchema['galleryAlbums'];
export type GalleryImage = InstantSchema['galleryImages'];
export type CategoryAchievement = InstantSchema['categoryAchievements'];
