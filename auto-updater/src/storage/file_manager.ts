import * as fs from 'fs/promises';
import * as path from 'path';
import logger from '../utils/logger';

export default class FileManager {
  private static instance: FileManager;
  private readonly dataDir: string;

  private constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
  }

  static getInstance(): FileManager {
    if (!FileManager.instance) {
      FileManager.instance = new FileManager();
    }
    return FileManager.instance;
  }

  async readMarkdown(filename: string): Promise<string> {
    try {
      const filePath = path.join(this.dataDir, 'md', 'en', filename);
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      logger.error(`Error reading markdown file ${filename}:`, error);
      return '';
    }
  }

  async saveMarkdown(filename: string, content: string, mode: 'append' | 'overwrite' = 'append'): Promise<void> {
    try {
      const outputDir = path.join(this.dataDir, 'md', 'en');
      await fs.mkdir(outputDir, { recursive: true });
      
      const filePath = path.join(outputDir, filename);
      
      if (mode === 'append') {
        const existingContent = await this.readMarkdown(filename);
        await fs.writeFile(filePath, existingContent + '\n' + content);
      } else {
        await fs.writeFile(filePath, content);
      }
      
      logger.info(`Successfully saved markdown to ${filePath}`);
    } catch (error) {
      logger.error(`Error saving markdown file ${filename}:`, error);
      throw error;
    }
  }

  async saveCategory(category: string, data: any): Promise<void> {
    try {
      const outputDir = path.join(this.dataDir, 'categories');
      await fs.mkdir(outputDir, { recursive: true });
      
      const filePath = path.join(outputDir, `${category}.json`);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      
      logger.info(`Successfully saved category data to ${filePath}`);
    } catch (error) {
      logger.error(`Error saving category data for ${category}:`, error);
      throw error;
    }
  }

  async fileExists(filepath: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.dataDir, filepath));
      return true;
    } catch {
      return false;
    }
  }
} 