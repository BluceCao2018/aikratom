import { z } from 'zod';
import logger from '../utils/logger';

export class DataValidator {
  private static readonly MIN_NAME_LENGTH = 3;
  private static readonly MIN_DESCRIPTION_LENGTH = 10;
  private static readonly MAX_FEATURES = 20;
  private static readonly MIN_DATE = new Date('2000-01-01');

  private static readonly aiToolSchema = z.object({
    name: z.string().min(DataValidator.MIN_NAME_LENGTH),
    description: z.string().min(DataValidator.MIN_DESCRIPTION_LENGTH),
    website: z.string().url(),
    category: z.array(z.string()).min(1),
    features: z.array(z.string()).max(DataValidator.MAX_FEATURES),
    lastUpdated: z.string().datetime()
  });

  static validateAndCleanAITool(data: any) {
    try {
      if (!data?.name || typeof data.name !== 'string' || data.name.length < this.MIN_NAME_LENGTH) {
        logger.warn('Invalid name length', { name: data?.name });
        return null;
      }

      if (!data?.description || typeof data.description !== 'string' || data.description.length < this.MIN_DESCRIPTION_LENGTH) {
        logger.warn('Invalid description length', { length: data?.description?.length, name: data.name });
        return null;
      }

      // First, clean the features array
      const cleanedFeatures = this.cleanFeatures(data.features);
      if (cleanedFeatures.length > this.MAX_FEATURES) {
        logger.warn('Too many features', { count: cleanedFeatures.length, name: data.name });
        return null;
      }

      const cleanedData = {
        name: this.cleanString(data.name),
        description: this.cleanString(data.description),
        website: this.cleanURL(data.website),
        category: this.cleanCategories(data.category),
        features: cleanedFeatures,
        lastUpdated: data.lastUpdated
      };

      if (!cleanedData.website) {
        logger.warn('Invalid URL', { name: data.name });
        return null;
      }

      if (!cleanedData.category || cleanedData.category.length === 0) {
        logger.warn('Invalid category count', { count: cleanedData.category?.length, name: data.name });
        return null;
      }

      const date = new Date(cleanedData.lastUpdated);
      if (isNaN(date.getTime()) || date < this.MIN_DATE) {
        logger.warn('Invalid date', { date: cleanedData.lastUpdated, name: data.name });
        return null;
      }

      const result = this.aiToolSchema.safeParse(cleanedData);
      if (!result.success) {
        logger.error('Validation error for AI tool', { 
          tool: data.name,
          errors: result.error.errors,
        });
        return null;
      }

      logger.info('Validated AI tool successfully', { name: data.name });
      return cleanedData;
    } catch (error) {
      logger.error('Error validating AI tool', { error, tool: data?.name });
      return null;
    }
  }

  private static cleanString(str: string | null | undefined): string {
    if (!str) return '';
    return str
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private static cleanURL(url: string | null | undefined): string {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      // Force HTTPS
      urlObj.protocol = 'https:';
      // Remove sensitive parameters
      const params = new URLSearchParams(urlObj.search);
      ['token', 'key', 'secret', 'password', 'auth'].forEach(param => params.delete(param));
      urlObj.search = params.toString();
      // Remove potentially dangerous hash
      if (urlObj.hash.toLowerCase().includes('javascript:')) {
        urlObj.hash = '';
      }
      return urlObj.toString();
    } catch {
      return '';
    }
  }

  private static cleanCategories(categories: any): string[] {
    if (!categories) return [];
    const categoryArray = Array.isArray(categories) ? categories : [categories];
    return [...new Set(categoryArray
      .map(cat => this.cleanString(String(cat)))
      .filter(cat => cat)
      .map(cat => {
        // Normalize common category names
        const normalized = cat.toLowerCase();
        if (normalized.includes('ml') || normalized.includes('machine learning')) {
          return 'Machine Learning';
        }
        // Capitalize first letter of each word
        return cat.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }))];
  }

  private static cleanFeatures(features: any): string[] {
    if (!features) return [];
    const featureArray = Array.isArray(features) ? features : [features];
    return [...new Set(featureArray
      .map(feature => this.cleanString(String(feature)))
      .filter(feature => feature))];
  }
} 