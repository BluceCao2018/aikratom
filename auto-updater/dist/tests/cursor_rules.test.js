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
const cursor_rules_1 = require("../collectors/cursor_rules");
const file_manager_1 = __importDefault(require("../storage/file_manager"));
const config_1 = __importDefault(require("../utils/config"));
const axios_1 = __importDefault(require("axios"));
const rest_1 = require("@octokit/rest");
const cheerio = __importStar(require("cheerio"));
// Mock外部依赖
jest.mock('../storage/file_manager');
jest.mock('../utils/config');
jest.mock('axios');
jest.mock('@octokit/rest');
describe('CursorRulesCollector', () => {
    let collector;
    let mockFileManager;
    let mockConfig;
    const mockCursorRule = {
        title: 'Test Cursor Rule',
        description: 'A test cursor development rule',
        category: 'TypeScript',
        content: 'This is a test rule for Cursor IDE development',
        lastUpdated: new Date().toISOString()
    };
    const mockGitHubResponse = {
        data: {
            items: [
                {
                    name: 'cursor-rules',
                    owner: {
                        login: 'test-user'
                    },
                    description: 'A collection of Cursor IDE rules',
                    html_url: 'https://github.com/test-user/cursor-rules'
                }
            ]
        }
    };
    const mockReadmeResponse = {
        data: `# Cursor Rules

## TypeScript Development
This is a test rule for Cursor IDE development

## JavaScript Guidelines
Another test rule for JavaScript development
`
    };
    const mockBlogResponse = {
        data: `
      <div class="blog-post">
        <h2 class="post-title">Cursor IDE Best Practices</h2>
        <div class="post-content">
          Some best practices for Cursor IDE development
        </div>
      </div>
    `
    };
    beforeEach(() => {
        // 清除所有模拟
        jest.clearAllMocks();
        // 设置FileManager模拟
        mockFileManager = {
            getInstance: jest.fn().mockReturnThis(),
            fileExists: jest.fn().mockResolvedValue(false),
            saveMarkdown: jest.fn().mockResolvedValue(undefined),
            saveCategory: jest.fn().mockResolvedValue(undefined),
            readFile: jest.fn().mockResolvedValue('[]')
        };
        // 设置ConfigManager模拟
        mockConfig = {
            getInstance: jest.fn().mockReturnThis(),
            getConfig: jest.fn().mockReturnValue({
                cursorRules: {
                    githubTopics: ['cursor-ide'],
                    communities: [
                        {
                            name: 'Cursor Blog',
                            url: 'https://cursor.sh/blog'
                        }
                    ]
                }
            })
        };
        // 设置axios模拟
        axios_1.default.get.mockResolvedValue(mockBlogResponse);
        // 设置Octokit模拟
        const mockOctokit = {
            search: {
                repos: jest.fn().mockResolvedValue(mockGitHubResponse)
            },
            repos: {
                getReadme: jest.fn().mockResolvedValue(mockReadmeResponse)
            }
        };
        rest_1.Octokit.mockImplementation(() => mockOctokit);
        // 注入模拟
        file_manager_1.default.getInstance = jest.fn().mockReturnValue(mockFileManager);
        config_1.default.getInstance = jest.fn().mockReturnValue(mockConfig);
        collector = new cursor_rules_1.CursorRulesCollector();
    });
    test('should check if rule exists', async () => {
        await collector['checkExists']('test-rule');
        expect(mockFileManager.fileExists).toHaveBeenCalledWith('md_cursor/en/test-rule.md');
    });
    test('should save cursor rule data', async () => {
        await collector['saveData'](mockCursorRule);
        expect(mockFileManager.saveMarkdown).toHaveBeenCalled();
    });
    test('should determine category correctly', () => {
        const result = collector['determineCategory']('TypeScript Guide', 'A guide for TypeScript development');
        expect(result).toBe('TypeScript');
    });
    test('should identify cursor related content', () => {
        const result = collector['isCursorRelated']('Cursor IDE Guide', 'A guide for development');
        expect(result).toBe(true);
    });
    test('should extract rules from GitHub repo', async () => {
        const repo = mockGitHubResponse.data.items[0];
        const rules = await collector['extractRulesFromRepo'](repo);
        expect(rules.length).toBeGreaterThan(0);
        expect(rules[0].title).toBe('TypeScript Development');
    });
    test('should extract rules from community', () => {
        const $ = cheerio.load(mockBlogResponse.data);
        const rules = collector['extractRulesFromCommunity']($, 'Cursor Blog');
        expect(rules.length).toBeGreaterThan(0);
        expect(rules[0].title).toBe('Cursor IDE Best Practices');
    });
    test('should collect from all sources', async () => {
        await collector.collect();
        expect(mockFileManager.saveMarkdown).toHaveBeenCalled();
        expect(mockFileManager.saveCategory).toHaveBeenCalled();
    });
});
