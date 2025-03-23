"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_1 = require("../collectors/mcp");
const file_manager_1 = __importDefault(require("../storage/file_manager"));
const config_1 = __importDefault(require("../utils/config"));
// Mock外部依赖
jest.mock('../storage/file_manager');
jest.mock('../utils/config');
jest.mock('@octokit/rest');
jest.mock('axios');
describe('MCPCollector', () => {
    let collector;
    let mockFileManager;
    let mockConfig;
    const mockServerData = {
        name: 'Test Server',
        description: 'A test MCP server',
        address: 'test.server.com',
        version: '1.12.2',
        type: 'MCP Server',
        lastUpdated: new Date().toISOString()
    };
    const mockGitHubData = {
        name: 'test-client',
        description: 'A test MCP client',
        html_url: 'https://github.com/test/client',
        topics: ['minecraft-forge']
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
                mcpServers: {
                    sources: [{
                            name: 'MinecraftServers.org',
                            url: 'https://minecraftservers.org/type/modded'
                        }],
                    githubTopics: ['minecraft-forge']
                }
            })
        };
        // 注入模拟
        file_manager_1.default.getInstance = jest.fn().mockReturnValue(mockFileManager);
        config_1.default.getInstance = jest.fn().mockReturnValue(mockConfig);
        collector = new mcp_1.MCPCollector();
    });
    test('should check if server exists', async () => {
        await collector['checkExists']('test-server');
        expect(mockFileManager.fileExists).toHaveBeenCalledWith('md/en/mcp/test-server.md');
    });
    test('should save server data', async () => {
        await collector['saveData'](mockServerData);
        expect(mockFileManager.saveMarkdown).toHaveBeenCalled();
        expect(mockFileManager.saveCategory).toHaveBeenCalled();
    });
    test('should transform GitHub data correctly', () => {
        const result = collector['transformGitHubData'](mockGitHubData);
        expect(result).toEqual({
            name: mockGitHubData.name,
            description: mockGitHubData.description,
            address: mockGitHubData.html_url,
            version: 'Latest',
            type: 'MCP Client',
            lastUpdated: expect.any(String)
        });
    });
    test('should generate correct markdown', () => {
        const markdown = collector['generateMarkdown'](mockServerData);
        expect(markdown).toContain(`title: ${mockServerData.name}`);
        expect(markdown).toContain(`description: ${mockServerData.description}`);
        expect(markdown).toContain(`address: ${mockServerData.address}`);
        expect(markdown).toContain(`version: ${mockServerData.version}`);
    });
});
