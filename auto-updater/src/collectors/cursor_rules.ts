import axios from 'axios';
import { BaseCollector } from './base_collector';
import { CursorRule, cursorRuleSchema } from '../validators/schema';
import FileManager from '../storage/file_manager';
import ConfigManager from '../utils/config';
import logger from '../utils/logger';
import { Octokit } from '@octokit/rest';
import * as cheerio from 'cheerio';
import path from 'path';

export class CursorRulesCollector extends BaseCollector {
  private fileManager: FileManager;
  private config: ConfigManager;
  private octokit: Octokit;

  constructor() {
    super();
    this.fileManager = FileManager.getInstance();
    this.config = ConfigManager.getInstance();
    this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  }

  protected async doCollect(): Promise<void> {
    await Promise.all([
      this.collectFromGitHub(),
      this.collectFromCommunities()
    ]);
  }

  private async collectFromGitHub(): Promise<void> {
    try {
      const { githubTopics } = this.config.getConfig().cursorRules;
      for (const topic of githubTopics) {
        const { data } = await this.octokit.search.repos({
          q: `topic:${topic}`,
          sort: 'stars',
          per_page: 20
        });

        for (const repo of data.items) {
          // 尝试从README中提取规则
          const rules = await this.extractRulesFromRepo(repo);
          for (const rule of rules) {
            if (!(await this.checkExists(rule.title))) {
              await this.saveData(rule);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error collecting from GitHub:', error);
    }
  }

  private async extractRulesFromRepo(repo: any): Promise<CursorRule[]> {
    try {
      // 获取README内容
      const { data: readmeData } = await this.octokit.repos.getReadme({
        owner: repo.owner.login,
        repo: repo.name,
        mediaType: {
          format: 'raw'
        }
      });

      // 解析README中的规则
      const rules: CursorRule[] = [];
      const readmeContent = readmeData.toString();
      const sections = readmeContent.split(/\n#{2,3}\s+/); // 分割二级和三级标题

      for (const section of sections) {
        if (section.toLowerCase().includes('cursor') || 
            section.toLowerCase().includes('ide') ||
            section.toLowerCase().includes('development') ||
            section.toLowerCase().includes('guidelines')) {
          const lines = section.split('\n');
          const title = lines[0].trim();
          const content = lines.slice(1).join('\n').trim();

          if (title && content) {
            rules.push({
              title,
              description: content.slice(0, 200) + '...', // 取前200个字符作为描述
              category: this.determineCategory(title, content),
              content,
              lastUpdated: new Date().toISOString()
            });
          }
        }
      }

      return rules;
    } catch (error) {
      logger.error(`Error extracting rules from repo ${repo.name}:`, error);
      return [];
    }
  }

  private async collectFromCommunities(): Promise<void> {
    try {
      const { communities } = this.config.getConfig().cursorRules;
      for (const community of communities) {
        if (community.name === 'Cursor Discord') {
          // Discord需要特殊处理，可能需要使用Discord API
          continue;
        }

        const response = await axios.get(community.url);
        const $ = cheerio.load(response.data);

        // 根据不同的社区网站使用不同的选择器
        const rules = this.extractRulesFromCommunity($, community.name);
        for (const rule of rules) {
          if (!(await this.checkExists(rule.title))) {
            await this.saveData(rule);
          }
        }
      }
    } catch (error) {
      logger.error('Error collecting from communities:', error);
    }
  }

  private extractRulesFromCommunity($: cheerio.CheerioAPI, communityName: string): CursorRule[] {
    const rules: CursorRule[] = [];

    // 根据不同的社区使用不同的选择器
    switch (communityName) {
      case 'Cursor Blog':
        $('.blog-post').each((_, element) => {
          const $element = $(element);
          const title = $element.find('.post-title').text().trim();
          const content = $element.find('.post-content').text().trim();
          
          if (title && content && this.isCursorRelated(title, content)) {
            rules.push({
              title,
              description: content.slice(0, 200) + '...',
              category: this.determineCategory(title, content),
              content,
              lastUpdated: new Date().toISOString()
            });
          }
        });
        break;
      // 添加其他社区的处理逻辑
    }

    return rules;
  }

  private isCursorRelated(title: string, content: string): boolean {
    const keywords = ['cursor', 'ide', 'development', 'coding', 'programming'];
    const text = (title + ' ' + content).toLowerCase();
    return keywords.some(keyword => text.includes(keyword));
  }

  private determineCategory(title: string, content: string): string {
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.includes('typescript') || text.includes('ts')) return 'TypeScript';
    if (text.includes('javascript') || text.includes('js')) return 'JavaScript';
    if (text.includes('react')) return 'React';
    if (text.includes('vue')) return 'Vue';
    if (text.includes('angular')) return 'Angular';
    if (text.includes('node')) return 'Node.js';
    if (text.includes('python')) return 'Python';
    
    return 'General';
  }

  protected async checkExists(title: string): Promise<boolean> {
    const filename = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
    return await this.fileManager.fileExists(`md_cursor/en/${filename}`);
  }

  protected async saveData(rule: CursorRule): Promise<void> {
    try {
      const markdown = this.generateMarkdown(rule);
      const filename = `${rule.title.toLowerCase().replace(/\s+/g, '-')}.md`;
      await this.fileManager.saveMarkdown(filename, markdown);
      
      // Save to categories
      const categoryPath = path.join('categories', 'category.jsonc');
      
      let categoryData: CursorRule[] = [];
      try {
        const existingContent = await this.fileManager.readMarkdown(categoryPath);
        if (existingContent) {
          categoryData = JSON.parse(existingContent);
        }
      } catch {
        // No existing category file
      }
      
      categoryData.push(rule);
      await this.fileManager.saveCategory('cursor-rules', categoryData);
      
      logger.info(`Saved cursor rule: ${rule.title}`);
    } catch (error) {
      logger.error(`Error saving cursor rule ${rule.title}:`, error);
      throw error;
    }
  }

  private generateMarkdown(data: CursorRule): string {
    return `---
title: ${data.title}
description: ${data.description}
category: ${data.category}
lastUpdated: ${data.lastUpdated}
---

${data.content}
`;
  }
} 