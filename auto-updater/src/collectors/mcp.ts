import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseCollector } from './base_collector';
import { MCPServer, mcpServerSchema } from '../validators/schema';
import FileManager from '../storage/file_manager';
import ConfigManager from '../utils/config';
import logger from '../utils/logger';
import { Octokit } from '@octokit/rest';
import type { CheerioAPI } from 'cheerio';
import path from 'path';

export class MCPCollector extends BaseCollector {
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
      this.collectFromWebsites(),
      this.collectFromGitHub()
    ]);
  }

  private async collectFromWebsites(): Promise<void> {
    try {
      const { sources } = this.config.getConfig().mcpServers;
      for (const source of sources) {
        const response = await axios.get(source.url);
        const $ = cheerio.load(response.data);
        
        // MinecraftServers.org specific scraping
        if (source.name === 'MinecraftServers.org') {
          const serverItems = $('.server-item').toArray();
          for (const element of serverItems) {
            const server = this.parseMinecraftServer($, element);
            if (server && !(await this.checkExists(server.name))) {
              await this.saveData(server);
            }
          }
        }
        // Add more website specific scrapers here
      }
    } catch (error) {
      logger.error('Error collecting from websites:', error);
    }
  }

  private parseMinecraftServer($: CheerioAPI, element: any): MCPServer | null {
    try {
      const $element = $(element);
      const name = $element.find('.server-name').text().trim();
      const description = $element.find('.server-description').text().trim();
      const address = $element.find('.server-address').text().trim();
      const version = $element.find('.server-version').text().trim();
      
      if (!name || !address) return null;

      return {
        name,
        description: description || 'No description available',
        address,
        version: version || 'Unknown',
        type: 'MCP Server',
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error parsing Minecraft server:', error);
      return null;
    }
  }

  private async collectFromGitHub(): Promise<void> {
    try {
      const { githubTopics } = this.config.getConfig().mcpServers;
      for (const topic of githubTopics) {
        const { data } = await this.octokit.search.repos({
          q: `topic:${topic}`,
          sort: 'stars',
          per_page: 20
        });

        for (const repo of data.items) {
          const server = this.transformGitHubData(repo);
          if (!(await this.checkExists(server.name))) {
            await this.saveData(server);
          }
        }
      }
    } catch (error) {
      logger.error('Error collecting from GitHub:', error);
    }
  }

  private transformGitHubData(data: any): MCPServer {
    return {
      name: data.name,
      description: data.description || 'No description available',
      address: data.homepage || data.html_url,
      version: 'Latest',
      type: 'MCP Client',
      lastUpdated: new Date().toISOString()
    };
  }

  protected async checkExists(name: string): Promise<boolean> {
    const filename = `${name.toLowerCase().replace(/\s+/g, '-')}.md`;
    return await this.fileManager.fileExists(`md/en/mcp/${filename}`);
  }

  protected async saveData(server: MCPServer): Promise<void> {
    try {
      const markdown = this.generateMarkdown(server);
      const filename = `${server.name.toLowerCase()}.md`;
      await this.fileManager.saveMarkdown(filename, markdown);
      
      // Save to categories
      const categoryType = server.type.toLowerCase().replace(/\s+/g, '-');
      const categoryPath = path.join('categories', `${categoryType}.jsonc`);
      
      let categoryData: MCPServer[] = [];
      try {
        const existingContent = await this.fileManager.readMarkdown(categoryPath);
        if (existingContent) {
          categoryData = JSON.parse(existingContent);
        }
      } catch {
        // No existing category file
      }
      
      categoryData.push(server);
      await this.fileManager.saveCategory(categoryType, categoryData);
      
      logger.info(`Saved MCP server: ${server.name}`);
    } catch (error) {
      logger.error(`Error saving MCP server ${server.name}:`, error);
      throw error;
    }
  }

  private generateMarkdown(data: MCPServer): string {
    return `---
title: ${data.name}
description: ${data.description}
type: ${data.type}
address: ${data.address}
version: ${data.version}
lastUpdated: ${data.lastUpdated}
---

## Overview
${data.description}

## Server Information
- **Type:** ${data.type}
- **Address:** ${data.address}
- **Version:** ${data.version}
- **Last Updated:** ${new Date(data.lastUpdated).toLocaleDateString()}

## How to Connect
1. Launch Minecraft with the appropriate MCP version
2. Click "Multiplayer"
3. Click "Add Server"
4. Enter the server address: \`${data.address}\`
5. Click "Done" and join the server
`;
  }
} 