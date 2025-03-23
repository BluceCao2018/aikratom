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
exports.CursorRulesCollector = void 0;
const axios_1 = __importDefault(require("axios"));
const base_collector_1 = require("./base_collector");
const schema_1 = require("../validators/schema");
const file_manager_1 = __importDefault(require("../storage/file_manager"));
const config_1 = __importDefault(require("../utils/config"));
const logger_1 = __importDefault(require("../utils/logger"));
const rest_1 = require("@octokit/rest");
const cheerio = __importStar(require("cheerio"));
class CursorRulesCollector extends base_collector_1.BaseCollector {
    constructor() {
        super();
        this.fileManager = file_manager_1.default.getInstance();
        this.config = config_1.default.getInstance();
        this.octokit = new rest_1.Octokit({ auth: process.env.GITHUB_TOKEN });
    }
    async doCollect() {
        await Promise.all([
            this.collectFromGitHub(),
            this.collectFromCommunities()
        ]);
    }
    async collectFromGitHub() {
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
        }
        catch (error) {
            logger_1.default.error('Error collecting from GitHub:', error);
        }
    }
    async extractRulesFromRepo(repo) {
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
            const rules = [];
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
        }
        catch (error) {
            logger_1.default.error(`Error extracting rules from repo ${repo.name}:`, error);
            return [];
        }
    }
    async collectFromCommunities() {
        try {
            const { communities } = this.config.getConfig().cursorRules;
            for (const community of communities) {
                if (community.name === 'Cursor Discord') {
                    // Discord需要特殊处理，可能需要使用Discord API
                    continue;
                }
                const response = await axios_1.default.get(community.url);
                const $ = cheerio.load(response.data);
                // 根据不同的社区网站使用不同的选择器
                const rules = this.extractRulesFromCommunity($, community.name);
                for (const rule of rules) {
                    if (!(await this.checkExists(rule.title))) {
                        await this.saveData(rule);
                    }
                }
            }
        }
        catch (error) {
            logger_1.default.error('Error collecting from communities:', error);
        }
    }
    extractRulesFromCommunity($, communityName) {
        const rules = [];
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
    isCursorRelated(title, content) {
        const keywords = ['cursor', 'ide', 'development', 'coding', 'programming'];
        const text = (title + ' ' + content).toLowerCase();
        return keywords.some(keyword => text.includes(keyword));
    }
    determineCategory(title, content) {
        const text = (title + ' ' + content).toLowerCase();
        if (text.includes('typescript') || text.includes('ts'))
            return 'TypeScript';
        if (text.includes('javascript') || text.includes('js'))
            return 'JavaScript';
        if (text.includes('react'))
            return 'React';
        if (text.includes('vue'))
            return 'Vue';
        if (text.includes('angular'))
            return 'Angular';
        if (text.includes('node'))
            return 'Node.js';
        if (text.includes('python'))
            return 'Python';
        return 'General';
    }
    async checkExists(title) {
        const filename = `${title.toLowerCase().replace(/\s+/g, '-')}.md`;
        return await this.fileManager.fileExists(`md_cursor/en/${filename}`);
    }
    async saveData(data) {
        try {
            const validatedData = schema_1.cursorRuleSchema.parse(data);
            const markdown = this.generateMarkdown(validatedData);
            const filename = data.title.toLowerCase().replace(/\s+/g, '-');
            await this.fileManager.saveMarkdown(markdown, filename, 'cursor');
            // 更新分类文件
            await this.updateCategory(validatedData);
        }
        catch (error) {
            logger_1.default.error(`Error saving Cursor rule data for ${data.title}:`, error);
        }
    }
    async updateCategory(data) {
        try {
            const categoryPath = 'json/en/cursor/category.jsonc';
            let categoryData = [];
            try {
                const existingData = await this.fileManager.readFile(categoryPath);
                categoryData = JSON.parse(existingData);
            }
            catch {
                // 文件不存在，使用空数组
            }
            // 检查分类是否存在
            let categoryIndex = categoryData.findIndex((item) => item.name === data.category);
            if (categoryIndex === -1) {
                // 添加新分类
                categoryData.push({
                    name: data.category,
                    src: `${data.category.toLowerCase()}.jsonc`,
                    link: data.category,
                    description: `${data.category} development guidelines and best practices`
                });
                categoryIndex = categoryData.length - 1;
            }
            // 按名称排序
            categoryData.sort((a, b) => a.name.localeCompare(b.name));
            await this.fileManager.saveCategory(categoryData, 'category.jsonc', 'cursor');
        }
        catch (error) {
            logger_1.default.error(`Error updating category for ${data.title}:`, error);
        }
    }
    generateMarkdown(data) {
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
exports.CursorRulesCollector = CursorRulesCollector;
