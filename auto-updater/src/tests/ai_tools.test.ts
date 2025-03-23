import { AIToolsCollector } from '../collectors/ai_tools';
import fs from 'fs/promises';
import path from 'path';

jest.mock('fs/promises');
jest.mock('../utils/logger');

describe('AIToolsCollector', () => {
  let collector: AIToolsCollector;

  beforeEach(() => {
    collector = new AIToolsCollector();
    jest.clearAllMocks();
  });

  describe('collect', () => {
    it('should collect and process data successfully', async () => {
      const mockContent = `# AI Tools

## Test Tool
A test AI tool for validation.
https://test-tool.com

### Features
- Feature 1
- Feature 2

### Categories
- Machine Learning
- Deep Learning
`;

      (fs.readFile as jest.Mock).mockResolvedValue(mockContent);
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.access as jest.Mock).mockResolvedValue(undefined);

      await collector.collect();

      expect(fs.readFile).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (fs.readFile as jest.Mock).mockRejectedValue(new Error('File read error'));

      await expect(collector.collect()).rejects.toThrow();
    });
  });

  describe('file operations', () => {
    it('should create output directory if it does not exist', async () => {
      const mockContent = '# AI Tools\n\n## Test Tool\nDescription\nhttps://test.com';
      
      (fs.readFile as jest.Mock).mockResolvedValue(mockContent);
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.access as jest.Mock).mockResolvedValue(undefined);

      await collector.collect();

      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('data/md/en'),
        expect.any(Object)
      );
    });

    it('should write processed data to file', async () => {
      const mockContent = '# AI Tools\n\n## Test Tool\nDescription\nhttps://test.com';
      
      (fs.readFile as jest.Mock).mockResolvedValue(mockContent);
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
      (fs.access as jest.Mock).mockResolvedValue(undefined);

      await collector.collect();

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('ai-tools.md'),
        expect.any(String),
        'utf-8'
      );
    });
  });
}); 