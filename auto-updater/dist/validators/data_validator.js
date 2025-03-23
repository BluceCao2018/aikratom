"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataValidator = void 0;
const zod_1 = require("zod");
const logger_1 = __importDefault(require("../utils/logger"));
class DataValidator {
    static validateAndCleanAITool(data) {
        try {
            if (!data?.name || typeof data.name !== 'string' || data.name.length < this.MIN_NAME_LENGTH) {
                logger_1.default.warn('Invalid name length', { name: data?.name });
                return null;
            }
            if (!data?.description || typeof data.description !== 'string' || data.description.length < this.MIN_DESCRIPTION_LENGTH) {
                logger_1.default.warn('Invalid description length', { length: data?.description?.length, name: data.name });
                return null;
            }
            // First, clean the features array
            const cleanedFeatures = this.cleanFeatures(data.features);
            if (cleanedFeatures.length > this.MAX_FEATURES) {
                logger_1.default.warn('Too many features', { count: cleanedFeatures.length, name: data.name });
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
                logger_1.default.warn('Invalid URL', { name: data.name });
                return null;
            }
            if (!cleanedData.category || cleanedData.category.length === 0) {
                logger_1.default.warn('Invalid category count', { count: cleanedData.category?.length, name: data.name });
                return null;
            }
            const date = new Date(cleanedData.lastUpdated);
            if (isNaN(date.getTime()) || date < this.MIN_DATE) {
                logger_1.default.warn('Invalid date', { date: cleanedData.lastUpdated, name: data.name });
                return null;
            }
            const result = this.aiToolSchema.safeParse(cleanedData);
            if (!result.success) {
                logger_1.default.error('Validation error for AI tool', {
                    tool: data.name,
                    errors: result.error.errors,
                });
                return null;
            }
            logger_1.default.info('Validated AI tool successfully', { name: data.name });
            return cleanedData;
        }
        catch (error) {
            logger_1.default.error('Error validating AI tool', { error, tool: data?.name });
            return null;
        }
    }
    static cleanString(str) {
        if (!str)
            return '';
        return str
            .replace(/<[^>]*>/g, ' ') // Remove HTML tags
            .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ') // Remove control characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }
    static cleanURL(url) {
        if (!url)
            return '';
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
        }
        catch {
            return '';
        }
    }
    static cleanCategories(categories) {
        if (!categories)
            return [];
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
    static cleanFeatures(features) {
        if (!features)
            return [];
        const featureArray = Array.isArray(features) ? features : [features];
        return [...new Set(featureArray
                .map(feature => this.cleanString(String(feature)))
                .filter(feature => feature))];
    }
}
exports.DataValidator = DataValidator;
DataValidator.MIN_NAME_LENGTH = 3;
DataValidator.MIN_DESCRIPTION_LENGTH = 10;
DataValidator.MAX_FEATURES = 20;
DataValidator.MIN_DATE = new Date('2000-01-01');
DataValidator.aiToolSchema = zod_1.z.object({
    name: zod_1.z.string().min(DataValidator.MIN_NAME_LENGTH),
    description: zod_1.z.string().min(DataValidator.MIN_DESCRIPTION_LENGTH),
    website: zod_1.z.string().url(),
    category: zod_1.z.array(zod_1.z.string()).min(1),
    features: zod_1.z.array(zod_1.z.string()).max(DataValidator.MAX_FEATURES),
    lastUpdated: zod_1.z.string().datetime()
});
