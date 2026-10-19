import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.resolve(__dirname, 'db.json');

export interface AppointmentRecord {
  id: string;
  fullName: string;
  phone: string;
  serviceId?: string;
  serviceTitle?: string;
  preferredDate?: string;
  preferredTime?: string;
  description?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  notes?: string;
}

export interface MediaRecord {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  alt: string;
  title: string;
  mimeType: string;
  size: number;
  createdAt: string;
  category?: 'site' | 'gallery' | 'article' | 'upload';
  targetKey?: string;
  targetId?: string;
  targetField?: string;
}

export interface PatientCommentRecord {
  id: string;
  articleId?: string;
  articleTitle?: string;
  authorName: string;
  authorPhone?: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  doctorReply?: string;
  repliedAt?: string;
  repliedBy?: string;
}

export interface DbSchema {
  admin: {
    username: string;
    password: string;
  };
  siteSettings: Record<string, any>;
  siteImages: Record<string, { url: string; alt: string; title: string }>;
  clinicInfo: Record<string, any>;
  valuePropositions: any[];
  services: any[];
  transformations: any[];
  articles: any[];
  comments: PatientCommentRecord[];
  faqs: any[];
  mobileFaqs: any[];
  blogCategories: any[];
  trendingTags: any[];
  quickHealthTips: any[];
  treatments: any[];
  doctor: Record<string, any>;
  about: Record<string, any>;
  hero: Record<string, any>;
  contact: Record<string, any>;
  appointments: AppointmentRecord[];
  media: MediaRecord[];
  [key: string]: any;
}

export function readDb(): DbSchema {
  try {
    const raw = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to read db.json:', error);
    throw new Error('Database read failure');
  }
}

export function writeDb(data: DbSchema): void {
  try {
    const tempPath = `${dbFilePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, dbFilePath);
  } catch (error) {
    console.error('Failed to write db.json:', error);
    throw new Error('Database write failure');
  }
}
