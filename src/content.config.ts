import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { articleSchema, authorSchema, issueSchema } from './lib/content-schema.mjs';

export const collections = {
  articles: defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/articles' }), schema: articleSchema }),
  authors: defineCollection({ loader: glob({ pattern: '*.json', base: './src/content/authors' }), schema: authorSchema }),
  issues: defineCollection({ loader: glob({ pattern: '*.json', base: './src/content/issues' }), schema: issueSchema }),
};
