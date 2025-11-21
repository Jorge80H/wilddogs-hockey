#!/usr/bin/env node

/**
 * Script para configurar el schema de InstantDB
 *
 * Nota: Este script asume que tienes el MCP de InstantDB disponible
 * o que InstantDB expone una API para configuración de schema.
 *
 * Uso:
 *   node scripts/setup-instantdb-schema.js
 */

const APP_ID = '27acc1e8-fce9-4800-a9cd-c769cea6844f';

// Schema completo basado en instantSchema.ts
const schema = {
  users: {
    email: 'string',
    firstName: 'string',
    lastName: 'string',
    profileImageUrl: 'string',
    role: 'string', // 'admin' | 'coach' | 'player' | 'guardian'
    status: 'string', // 'pending' | 'approved' | 'rejected' | 'inactive'
    createdAt: 'number',
  },

  playerProfiles: {
    userId: 'string',
    documentType: 'string',
    documentNumber: 'string',
    dateOfBirth: 'string',
    gender: 'string', // 'male' | 'female' | 'other'
    phone: 'string',
    address: 'string',
    category: 'string', // 'sub8' | 'sub12' | 'sub14' | 'sub16' | 'sub18' | 'mayores'
    position: 'string', // 'forward' | 'defense' | 'goalie'
    jerseyNumber: 'number',
    uniformSize: 'string',
    guardianName: 'string',
    guardianRelationship: 'string',
    guardianDocument: 'string',
    guardianPhone: 'string',
    guardianEmail: 'string',
    bloodType: 'string',
    allergies: 'string',
    medicalConditions: 'string',
    emergencyContact: 'string',
    emergencyPhone: 'string',
    gamesPlayed: 'number',
    goals: 'number',
    assists: 'number',
    createdAt: 'number',
  },

  categories: {
    name: 'string',
    ageMin: 'number',
    ageMax: 'number',
    description: 'string',
    trainingSchedule: 'string',
    objectives: 'string',
    imageUrl: 'string',
    createdAt: 'number',
  },

  coaches: {
    categoryId: 'string',
    name: 'string',
    role: 'string',
    photoUrl: 'string',
    bio: 'string',
    experience: 'string',
    createdAt: 'number',
  },

  newsPosts: {
    title: 'string',
    content: 'string',
    excerpt: 'string',
    imageUrl: 'string',
    status: 'string', // 'draft' | 'published'
    publishedAt: 'number',
    createdAt: 'number',
  },

  tournaments: {
    name: 'string',
    categoryId: 'string',
    season: 'string',
    startDate: 'string',
    endDate: 'string',
    location: 'string',
    description: 'string',
    createdAt: 'number',
  },

  matches: {
    tournamentId: 'string',
    categoryId: 'string',
    date: 'number',
    opponent: 'string',
    location: 'string',
    homeScore: 'number',
    awayScore: 'number',
    result: 'string', // 'win' | 'loss' | 'draw'
    notes: 'string',
    createdAt: 'number',
  },

  standings: {
    tournamentId: 'string',
    teamName: 'string',
    position: 'number',
    played: 'number',
    won: 'number',
    drawn: 'number',
    lost: 'number',
    goalsFor: 'number',
    goalsAgainst: 'number',
    goalDifference: 'number',
    points: 'number',
  },

  paymentConcepts: {
    name: 'string',
    description: 'string',
    amount: 'number',
    frequency: 'string', // 'once' | 'monthly' | 'quarterly' | 'annual'
    applicableCategories: 'string',
    isActive: 'boolean',
    createdAt: 'number',
  },

  accountsReceivable: {
    playerProfileId: 'string',
    conceptId: 'string',
    amount: 'number',
    dueDate: 'string',
    status: 'string', // 'pending' | 'paid' | 'overdue'
    description: 'string',
    createdAt: 'number',
  },

  payments: {
    playerProfileId: 'string',
    amount: 'number',
    paymentDate: 'string',
    paymentMethod: 'string', // 'cash' | 'transfer' | 'card' | 'other'
    referenceNumber: 'string',
    notes: 'string',
    receiptNumber: 'string',
    createdAt: 'number',
  },

  documents: {
    playerProfileId: 'string',
    type: 'string', // 'id' | 'eps' | 'medical' | 'image_rights' | 'other'
    fileUrl: 'string',
    fileName: 'string',
    status: 'string', // 'pending' | 'approved' | 'rejected'
    notes: 'string',
    uploadedAt: 'number',
  },

  contactSubmissions: {
    name: 'string',
    email: 'string',
    phone: 'string',
    subject: 'string',
    message: 'string',
    isRead: 'boolean',
    createdAt: 'number',
  },

  galleryAlbums: {
    title: 'string',
    description: 'string',
    categoryId: 'string',
    coverImageUrl: 'string',
    createdAt: 'number',
  },

  galleryImages: {
    albumId: 'string',
    imageUrl: 'string',
    caption: 'string',
    createdAt: 'number',
  },

  categoryAchievements: {
    categoryId: 'string',
    title: 'string',
    description: 'string',
    year: 'number',
    imageUrl: 'string',
    createdAt: 'number',
  },
};

// Links/Relaciones
const links = [
  { from: 'playerProfiles', attr: 'userId', to: 'users' },
  { from: 'coaches', attr: 'categoryId', to: 'categories' },
  { from: 'matches', attr: 'tournamentId', to: 'tournaments' },
  { from: 'matches', attr: 'categoryId', to: 'categories' },
  { from: 'standings', attr: 'tournamentId', to: 'tournaments' },
  { from: 'accountsReceivable', attr: 'playerProfileId', to: 'playerProfiles' },
  { from: 'accountsReceivable', attr: 'conceptId', to: 'paymentConcepts' },
  { from: 'payments', attr: 'playerProfileId', to: 'playerProfiles' },
  { from: 'documents', attr: 'playerProfileId', to: 'playerProfiles' },
  { from: 'galleryAlbums', attr: 'categoryId', to: 'categories' },
  { from: 'galleryImages', attr: 'albumId', to: 'galleryAlbums' },
  { from: 'categoryAchievements', attr: 'categoryId', to: 'categories' },
];

function printCommands() {
  console.log('='.repeat(80));
  console.log('COMANDOS PARA CONFIGURAR SCHEMA DE INSTANTDB');
  console.log('='.repeat(80));
  console.log(`\nApp ID: ${APP_ID}\n`);

  console.log('='.repeat(80));
  console.log('CREAR ENTIDADES Y ATRIBUTOS');
  console.log('='.repeat(80));

  Object.entries(schema).forEach(([entity, attributes], index) => {
    console.log(`\n${index + 1}. Entidad: ${entity}`);
    console.log(`   create_entity ${entity}`);
    console.log('   ');

    Object.entries(attributes).forEach(([attr, type]) => {
      console.log(`   add_attribute ${entity} ${attr} ${type}`);
    });
  });

  console.log('\n');
  console.log('='.repeat(80));
  console.log('CREAR RELACIONES (LINKS)');
  console.log('='.repeat(80));

  links.forEach((link, index) => {
    console.log(`\n${index + 1}. ${link.from}.${link.attr} -> ${link.to}`);
    console.log(`   create_link ${link.from} ${link.attr} ${link.to}`);
  });

  console.log('\n');
  console.log('='.repeat(80));
  console.log('VERIFICACIÓN');
  console.log('='.repeat(80));
  console.log(`\nDashboard: https://www.instantdb.com/dash?app=${APP_ID}`);
  console.log(`Total de entidades: ${Object.keys(schema).length}`);
  console.log(`Total de relaciones: ${links.length}`);
  console.log('\n');
}

// Ejecutar
printCommands();
