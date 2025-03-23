"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ai_tools_1 = require("../collectors/ai_tools");
const promises_1 = __importDefault(require("fs/promises"));
jest.mock('fs/promises');
jest.mock('../utils/logger');
describe('AIToolsCollector', () => {
    let collector;
    beforeEach(() => {
        collector = new ai_tools_1.AIToolsCollector();
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
            promises_1.default.readFile.mockResolvedValue(mockContent);
            promises_1.default.mkdir.mockResolvedValue(undefined);
            promises_1.default.writeFile.mockResolvedValue(undefined);
            promises_1.default.access.mockResolvedValue(undefined);
            await collector.collect();
            expect(promises_1.default.readFile).toHaveBeenCalled();
            expect(promises_1.default.writeFile).toHaveBeenCalled();
        });
        it('should handle errors gracefully', async () => {
            promises_1.default.readFile.mockRejectedValue(new Error('File read error'));
            await expect(collector.collect()).rejects.toThrow();
        });
    });
    describe('file operations', () => {
        it('should create output directory if it does not exist', async () => {
            const mockContent = '# AI Tools\n\n## Test Tool\nDescription\nhttps://test.com';
            promises_1.default.readFile.mockResolvedValue(mockContent);
            promises_1.default.mkdir.mockResolvedValue(undefined);
            promises_1.default.writeFile.mockResolvedValue(undefined);
            promises_1.default.access.mockResolvedValue(undefined);
            await collector.collect();
            expect(promises_1.default.mkdir).toHaveBeenCalledWith(expect.stringContaining('data/md/en'), expect.any(Object));
        });
        it('should write processed data to file', async () => {
            const mockContent = '# AI Tools\n\n## Test Tool\nDescription\nhttps://test.com';
            promises_1.default.readFile.mockResolvedValue(mockContent);
            promises_1.default.mkdir.mockResolvedValue(undefined);
            promises_1.default.writeFile.mockResolvedValue(undefined);
            promises_1.default.access.mockResolvedValue(undefined);
            await collector.collect();
            expect(promises_1.default.writeFile).toHaveBeenCalledWith(expect.stringContaining('ai-tools.md'), expect.any(String), 'utf-8');
        });
    });
});
