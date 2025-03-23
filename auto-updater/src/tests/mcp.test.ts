import { MCPCollector } from '../collectors/mcp';
import FileManager from '../storage/file_manager';
import ConfigManager from '../utils/config';

// Mock外部依赖
jest.mock('../storage/file_manager');
jest.mock('../utils/config');
jest.mock('@octokit/rest');
jest.mock('axios');

describe('MCPCollector', () => {
  let collector: MCPCollector;
  let mockFileManager: jest.Mocked<FileManager>;
  let mockConfig: jest.Mocked<ConfigManager>;

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
    } as any;

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
    } as any;

    // 注入模拟
    (FileManager as any).getInstance = jest.fn().mockReturnValue(mockFileManager);
    (ConfigManager as any).getInstance = jest.fn().mockReturnValue(mockConfig);

    collector = new MCPCollector();
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