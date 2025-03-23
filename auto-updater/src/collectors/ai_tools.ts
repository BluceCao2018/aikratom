import axios from 'axios';
import { BaseCollector } from './base_collector';
import { AITool, aiToolSchema } from '../validators/schema';
import FileManager from '../storage/file_manager';
import ConfigManager from '../utils/config';
import logger from '../utils/logger';
import { Octokit } from '@octokit/rest';
import * as cheerio from 'cheerio';
import * as path from 'path';

export class AIToolsCollector extends BaseCollector {
  private fileManager: FileManager;
  private config: ConfigManager;
  private octokit: Octokit;
  private isFirstTool: boolean = true;

  constructor() {
    super();
    this.fileManager = FileManager.getInstance();
    this.config = ConfigManager.getInstance();
    this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  }

  protected async doCollect(): Promise<void> {
    this.isFirstTool = true;
    await Promise.all([
      this.collectFromGitHub(),
      this.collectFromProductHunt(),
      this.collectFromLocal()
    ]);
  }

  private async collectFromGitHub(): Promise<void> {
    try {
      const topics = ['ai-tools', 'artificial-intelligence', 'machine-learning'];
      for (const topic of topics) {
        const { data } = await this.octokit.search.repos({
          q: `topic:${topic}`,
          sort: 'stars',
          per_page: 20
        });

        for (const repo of data.items) {
          const tool = await this.extractToolFromRepo(repo);
          if (tool && !(await this.checkExists(tool.name))) {
            await this.saveData(tool);
          }
        }
      }
    } catch (error) {
      logger.error('Error collecting from GitHub:', error);
    }
  }

  private async collectFromProductHunt(): Promise<void> {
    try {
      // TODO: Implement ProductHunt API integration
      // This will require a ProductHunt API key
      logger.info('ProductHunt collection not implemented yet');
    } catch (error) {
      logger.error('Error collecting from ProductHunt:', error);
    }
  }

  private async collectFromLocal(): Promise<void> {
    try {
      const content = await this.fileManager.readMarkdown('ai-tools.md');
      if (content) {
        const tools = this.parseMarkdown(content);
        for (const tool of tools) {
          if (!(await this.checkExists(tool.name))) {
            await this.saveData(tool);
          }
        }
      }
    } catch (error) {
      logger.error('Error collecting from local file:', error);
    }
  }

  private async extractToolFromRepo(repo: any): Promise<AITool | null> {
    try {
      const { data: readmeData } = await this.octokit.repos.getReadme({
        owner: repo.owner.login,
        repo: repo.name,
        mediaType: {
          format: 'raw'
        }
      });

      const readmeContent = readmeData.toString();
      const features = this.extractFeatures(readmeContent);
      const categories = this.extractCategories(readmeContent, repo.topics);

      return {
        name: repo.name,
        description: repo.description || 'No description available',
        website: repo.homepage || repo.html_url,
        features,
        categories
      };
    } catch (error) {
      logger.error(`Error extracting tool from repo ${repo.name}:`, error);
      return null;
    }
  }

  private extractFeatures(content: string): string[] {
    const features = new Set<string>();
    const featureRegexes = [
      /## Features\s+([\s\S]*?)(?=##|$)/i,
      /## Capabilities\s+([\s\S]*?)(?=##|$)/i,
      /## What it does\s+([\s\S]*?)(?=##|$)/i
    ];

    for (const regex of featureRegexes) {
      const match = content.match(regex);
      if (match && match[1]) {
        const featureList = match[1]
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.trim().replace(/^-\s*/, ''));
        featureList.forEach(feature => features.add(feature));
      }
    }

    return Array.from(features);
  }

  private extractCategories(content: string, topics: string[]): string[] {
    const categories = new Set<string>();
    
    // Add relevant topics as categories
    topics.forEach(topic => {
      if (topic.includes('ai') || topic.includes('ml') || topic.includes('intelligence')) {
        categories.add(this.formatCategory(topic));
      }
    });

    // Extract categories from content
    const categoryRegexes = [
      /## Categories\s+([\s\S]*?)(?=##|$)/i,
      /## Type\s+([\s\S]*?)(?=##|$)/i,
      /## Domain\s+([\s\S]*?)(?=##|$)/i
    ];

    for (const regex of categoryRegexes) {
      const match = content.match(regex);
      if (match && match[1]) {
        const categoryList = match[1]
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.trim().replace(/^-\s*/, ''));
        categoryList.forEach(category => categories.add(category));
      }
    }

    return Array.from(categories);
  }

  private formatCategory(topic: string): string {
    return topic
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  protected async checkExists(name: string): Promise<boolean> {
    try {
      const existingTools = await this.fileManager.readMarkdown('ai-tools.md');
      return existingTools.includes(`## ${name}`);
    } catch {
      return false;
    }
  }

  protected async saveData(tool: AITool): Promise<void> {
    try {
      const markdown = this.generateMarkdown(tool);
      const filename = 'ai-tools.md';
      
      if (this.isFirstTool) {
        await this.fileManager.saveMarkdown(filename, '# AI Tools\n\n' + markdown, 'overwrite');
        this.isFirstTool = false;
      } else {
        await this.fileManager.saveMarkdown(filename, markdown, 'append');
      }
      
      logger.info(`Saved AI tool: ${tool.name}`);
    } catch (error) {
      logger.error(`Error saving AI tool ${tool.name}:`, error);
      throw error;
    }
  }

  private generateMarkdown(tool: AITool): string {
    return `## ${tool.name}

${tool.description}

${tool.website}

### Features

${tool.features.map(feature => `- ${feature}`).join('\n')}

### Categories

${tool.categories.map(category => `- ${category}`).join('\n')}
`;
  }

  private parseMarkdown(content: string): AITool[] {
    const tools: AITool[] = [];
    const sections = content.split(/\n##\s+/).filter(Boolean);

    for (const section of sections) {
      const lines = section.split('\n').filter(Boolean);
      const name = lines[0].trim();
      const description = lines[1]?.trim() || '';
      const website = lines[2]?.trim() || '';

      const featuresStart = section.indexOf('### Features');
      const categoriesStart = section.indexOf('### Categories');
      
      let features: string[] = [];
      let categories: string[] = [];

      if (featuresStart !== -1) {
        const featuresSection = section.slice(
          featuresStart + 11,
          categoriesStart !== -1 ? categoriesStart : undefined
        );
        features = featuresSection
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.trim().replace(/^-\s*/, ''));
      }

      if (categoriesStart !== -1) {
        const categoriesSection = section.slice(categoriesStart + 13);
        categories = categoriesSection
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.trim().replace(/^-\s*/, ''));
      }

      tools.push({
        name,
        description,
        website,
        features,
        categories
      });
    }

    return tools;
  }
} 