import { z } from 'zod';

export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase ASCII slug.');
const text = (max) => z.string().trim().min(1).max(max);
export const topics = {
  culture: 'فرهنگ و جامعه',
  literature: 'هنر و ادبیات',
  campus: 'زندگی دانشجویی',
  science: 'علم و فناوری',
};
export const topicSchema = z.enum(['culture', 'literature', 'campus', 'science']);

export function isLocalAsset(value) {
  return /^\/(?:images|covers|downloads|audio)\/[a-zA-Z0-9_./-]+$/.test(value)
    && !value.split('/').includes('..') && !value.includes('//');
}
export function isHttps(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !/[\s\\]/.test(value);
  } catch { return false; }
}
export function isSafeLink(value) {
  if (/[\u0000-\u0020\u007f\\]/.test(value)) return false;
  if (value.startsWith('#')) return value.length > 1;
  if (value.startsWith('/')) return !value.startsWith('//') && !/%(?:2f|5c|0[ad])/i.test(value)
    && !value.split(/[/?#]/).includes('..');
  if (/^mailto:[^?\s@]+@[^?\s@]+\.[^?\s@]+$/.test(value)) return true;
  return isHttps(value);
}
export const assetSchema = z.string().refine(v => isLocalAsset(v) && /\.(?:png|jpe?g|webp|avif|gif)$/.test(v), 'Use a local PNG, JPEG, WebP, AVIF or GIF image.');
const audioSchema = z.string().refine(v => isLocalAsset(v) && /^\/audio\/.+\.(?:mp3|ogg|m4a|wav)$/.test(v), 'Use a local audio file under /audio/.');
export const mediaSchema = z.string().refine((v) => isLocalAsset(v) || isHttps(v), 'Use a local path or HTTPS URL.');
export const authorSchema = z.object({
  name: text(100),
  bio: text(700),
  avatar: assetSchema.optional(),
  links: z.array(z.object({ label: text(50), url: z.string().refine(isHttps) }).strict()).max(4).default([]),
}).strict();

export const issueSchema = z.object({
  title: text(140),
  number: z.number().int().positive().optional(),
  kind: z.enum(['regular', 'special']),
  order: z.number().int(),
  dateLabel: text(70).optional(),
  description: text(600),
  cover: assetSchema,
  coverAlt: text(240),
  pdf: mediaSchema,
  pdfPages: z.number().int().positive(),
  pdfBytes: z.number().int().positive(),
  draft: z.boolean().default(false),
  tocLabel: text(100).default('در این شماره'),
  toc: z.array(z.object({
    title: text(180),
    pdfPage: z.number().int().positive(),
    article: slugSchema.optional(),
  }).strict()).default([]),
  credits: z.array(z.object({ role: text(70), names: z.array(text(100)).min(1) }).strict()).default([]),
}).strict();

export const articleSchema = z.object({
  title: text(180),
  description: text(350),
  authors: z.array(slugSchema).min(1),
  issue: slugSchema,
  topics: z.array(topicSchema).min(1),
  order: z.number().int().nonnegative().default(0),
  draft: z.boolean().default(true),
  format: z.enum(['article', 'poem']).default('article'),
  edition: z.enum(['full', 'excerpt']).default('full'),
  pdfPage: z.number().int().positive(),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v).optional(),
  image: assetSchema.optional(),
  imageAlt: text(240).optional(),
  imageCredit: text(180).optional(),
  audio: z.object({ src: audioSchema, reader: text(100) }).strict().optional(),
}).strict().refine(v => !v.image || Boolean(v.imageAlt), { message: 'An image needs imageAlt.', path: ['imageAlt'] });

export const siteSchema = z.object({
  name: text(60),
  description: text(350),
  tagline: text(180),
  featuredIssue: slugSchema,
  heroTitle: text(180),
  heroDescription: text(400),
  heroImage: assetSchema,
  heroImageAlt: text(240),
  heroImageCredit: text(180),
  featuredArticles: z.array(slugSchema).min(1).max(6),
  contactEmail: z.email().optional(),
  socialLinks: z.array(z.object({ label: text(50), url: z.string().refine(isHttps) }).strict()).default([]),
}).strict();
