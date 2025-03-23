import { CursorRulesCollector } from '../collectors/cursor_rules';
import FileManager from '../storage/file_manager';
import ConfigManager from '../utils/config';
import axios from 'axios';
import { Octokit } from '@octokit/rest';
import * as cheerio from 'cheerio';

// Mock外部依赖
jest.mock('../storage/file_manager');
jest.mock('../utils/config');
jest.mock('axios');
jest.mock('@octokit/rest');

describe('CursorRulesCollector', () => {
  let collector: CursorRulesCollector;
  let mockFileManager: jest.Mocked<FileManager>;
  let mockConfig: jest.Mocked<ConfigManager>;

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
    } as any;

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
    } as any;

    // 设置axios模拟
    (axios.get as jest.Mock).mockResolvedValue(mockBlogResponse);
    
    // 设置Octokit模拟
    const mockOctokit = {
      search: {
        repos: jest.fn().mockResolvedValue(mockGitHubResponse)
      },
      repos: {
        getReadme: jest.fn().mockResolvedValue(mockReadmeResponse)
      }
    };
    (Octokit as unknown as jest.Mock).mockImplementation(() => mockOctokit);

    // 注入模拟
    (FileManager as any).getInstance = jest.fn().mockReturnValue(mockFileManager);
    (ConfigManager as any).getInstance = jest.fn().mockReturnValue(mockConfig);

    collector = new CursorRulesCollector();
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