"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPCollector = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const base_collector_1 = require("./base_collector");
const schema_1 = require("../validators/schema");
const file_manager_1 = __importDefault(require("../storage/file_manager"));
const config_1 = __importDefault(require("../utils/config"));
const logger_1 = __importDefault(require("../utils/logger"));
const rest_1 = require("@octokit/rest");
class MCPCollector extends base_collector_1.BaseCollector {
    constructor() {
        super();
        this.fileManager = file_manager_1.default.getInstance();
        this.config = config_1.default.getInstance();
        this.octokit = new rest_1.Octokit({ auth: process.env.GITHUB_TOKEN });
    }
    async doCollect() {
        await Promise.all([
            this.collectFromWebsites(),
            this.collectFromGitHub()
        ]);
    }
    async collectFromWebsites() {
        try {
            const { sources } = this.config.getConfig().mcpServers;
            for (const source of sources) {
                const response = await axios_1.default.get(source.url);
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
        }
        catch (error) {
            logger_1.default.error('Error collecting from websites:', error);
        }
    }
    parseMinecraftServer($, element) {
        try {
            const $element = $(element);
            const name = $element.find('.server-name').text().trim();
            const description = $element.find('.server-description').text().trim();
            const address = $element.find('.server-address').text().trim();
            const version = $element.find('.server-version').text().trim();
            if (!name || !address)
                return null;
            return {
                name,
                description: description || 'No description available',
                address,
                version: version || 'Unknown',
                type: 'MCP Server',
                lastUpdated: new Date().toISOString()
            };
        }
        catch (error) {
            logger_1.default.error('Error parsing Minecraft server:', error);
            return null;
        }
    }
    async collectFromGitHub() {
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
        }
        catch (error) {
            logger_1.default.error('Error collecting from GitHub:', error);
        }
    }
    transformGitHubData(data) {
        return {
            name: data.name,
            description: data.description || 'No description available',
            address: data.homepage || data.html_url,
            version: 'Latest',
            type: 'MCP Client',
            lastUpdated: new Date().toISOString()
        };
    }
    async checkExists(name) {
        const filename = `${name.toLowerCase().replace(/\s+/g, '-')}.md`;
        return await this.fileManager.fileExists(`md/en/mcp/${filename}`);
    }
    async saveData(data) {
        try {
            const validatedData = schema_1.mcpServerSchema.parse(data);
            const markdown = this.generateMarkdown(validatedData);
            const filename = data.name.toLowerCase().replace(/\s+/g, '-');
            await this.fileManager.saveMarkdown(markdown, filename, 'mcp');
            // 更新分类文件
            await this.updateCategory(validatedData);
        }
        catch (error) {
            logger_1.default.error(`Error saving MCP data for ${data.name}:`, error);
        }
    }
    async updateCategory(data) {
        try {
            const categoryType = data.type === 'MCP Server' ? 'server' : 'client';
            const categoryPath = `json/en/mcp/${categoryType}.jsonc`;
            let categoryData = [];
            try {
                const existingData = await this.fileManager.readFile(categoryPath);
                categoryData = JSON.parse(existingData);
            }
            catch {
                // 文件不存在，使用空数组
            }
            // 检查是否已存在
            const exists = categoryData.some((item) => item.name === data.name);
            if (!exists) {
                categoryData.push({
                    name: data.name,
                    src: `${data.name.toLowerCase().replace(/\s+/g, '-')}.md`,
                    link: data.name.toLowerCase().replace(/\s+/g, '-'),
                    description: data.description
                });
                // 按名称排序
                categoryData.sort((a, b) => a.name.localeCompare(b.name));
                await this.fileManager.saveCategory(categoryData, `${categoryType}.jsonc`, 'mcp');
            }
        }
        catch (error) {
            logger_1.default.error(`Error updating category for ${data.name}:`, error);
        }
    }
    generateMarkdown(data) {
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
exports.MCPCollector = MCPCollector;
