"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIToolsCollector = void 0;
const base_collector_1 = require("./base_collector");
const data_validator_1 = require("../validators/data_validator");
const logger_1 = __importDefault(require("../utils/logger"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class AIToolsCollector extends base_collector_1.BaseCollector {
    constructor() {
        super();
    }
    async doCollect() {
        try {
            // 从本地文件读取数据
            const data = await this.collectFromLocal();
            // 验证和清理数据
            const cleanedData = await this.validateAndCleanData(data);
            // 保存数据
            await this.saveData(cleanedData);
        }
        catch (error) {
            logger_1.default.error('Error in AIToolsCollector', { error });
            throw error;
        }
    }
    async checkExists(id) {
        try {
            const filePath = path_1.default.join(process.cwd(), 'data', 'md', 'en', 'ai-tools.md');
            await promises_1.default.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    async saveData(data) {
        try {
            const toolsArray = Array.isArray(data) ? data : [data];
            if (toolsArray.length === 0) {
                logger_1.default.warn('No valid tools to save');
                return;
            }
            // 确保目录存在
            const outputDir = path_1.default.join(process.cwd(), 'data', 'md', 'en');
            await promises_1.default.mkdir(outputDir, { recursive: true });
            // 生成 Markdown 内容
            const markdown = this.generateMarkdown(toolsArray);
            if (!markdown.trim()) {
                logger_1.default.warn('Generated markdown is empty');
                return;
            }
            // 保存文件
            const outputPath = path_1.default.join(outputDir, 'ai-tools.md');
            await promises_1.default.writeFile(outputPath, markdown, 'utf-8');
            logger_1.default.info('Data saved successfully', {
                path: outputPath,
                toolCount: toolsArray.length
            });
        }
        catch (error) {
            logger_1.default.error('Error saving data', { error });
            throw error;
        }
    }
    async collectFromLocal() {
        try {
            // 读取本地文件
            const filePath = path_1.default.join(process.cwd(), 'data', 'md', 'en', 'ai-tools.md');
            const content = await promises_1.default.readFile(filePath, 'utf-8');
            logger_1.default.info('Read file content', {
                length: content.length,
                preview: content.substring(0, 100)
            });
            // 解析 Markdown 内容
            const tools = this.parseMarkdown(content);
            return tools;
        }
        catch (error) {
            logger_1.default.error('Error collecting from local files', { error });
            return [];
        }
    }
    parseMarkdown(content) {
        const tools = [];
        const sections = content.split('\n## ').slice(1); // 跳过标题部分
        logger_1.default.info('Parsing content', {
            contentLength: content.length,
            sectionsCount: sections.length,
            firstSection: sections[0]?.substring(0, 100)
        });
        for (const section of sections) {
            if (!section.trim())
                continue;
            const lines = section.split('\n');
            const name = lines[0].trim();
            let description = '';
            let website = '';
            const features = [];
            const categories = [];
            let inFeatures = false;
            let inCategories = false;
            logger_1.default.debug('Parsing section', {
                name,
                lineCount: lines.length,
                firstLine: lines[0],
                preview: section.substring(0, 100)
            });
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line === '### Features') {
                    inFeatures = true;
                    inCategories = false;
                    continue;
                }
                else if (line === '### Categories') {
                    inFeatures = false;
                    inCategories = true;
                    continue;
                }
                if (line.startsWith('- ')) {
                    if (inFeatures) {
                        features.push(line.substring(2));
                    }
                    else if (inCategories) {
                        categories.push(line.substring(2));
                    }
                }
                else if (line.startsWith('http')) {
                    website = line;
                }
                else if (line && !line.startsWith('#')) {
                    description += line + ' ';
                }
            }
            const tool = {
                name,
                description: description.trim(),
                website,
                features,
                category: categories,
                lastUpdated: new Date().toISOString()
            };
            logger_1.default.debug('Parsed tool', {
                name: tool.name,
                descriptionLength: tool.description.length,
                websiteLength: tool.website.length,
                featuresCount: tool.features.length,
                categoriesCount: tool.category.length
            });
            tools.push(tool);
        }
        logger_1.default.info(`Successfully parsed ${tools.length} tools`);
        return tools;
    }
    async validateAndCleanData(data) {
        const validatedData = [];
        for (const item of data) {
            const cleanedItem = data_validator_1.DataValidator.validateAndCleanAITool(item);
            if (cleanedItem) {
                validatedData.push(cleanedItem);
            }
        }
        return validatedData;
    }
    generateMarkdown(data) {
        let markdown = '# AI Tools\n\n';
        for (const tool of data) {
            markdown += `## ${tool.name}\n\n`;
            markdown += `${tool.description}\n\n`;
            markdown += `${tool.website}\n\n`;
            if (tool.features && tool.features.length > 0) {
                markdown += '### Features\n\n';
                for (const feature of tool.features) {
                    markdown += `- ${feature}\n`;
                }
                markdown += '\n';
            }
            if (tool.category && tool.category.length > 0) {
                markdown += '### Categories\n\n';
                for (const category of tool.category) {
                    markdown += `- ${category}\n`;
                }
                markdown += '\n';
            }
        }
        return markdown;
    }
}
exports.AIToolsCollector = AIToolsCollector;
