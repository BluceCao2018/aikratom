import { DataValidator } from '../validators/data_validator';

describe('DataValidator', () => {
  const validTool = {
    name: 'Test AI Tool',
    description: 'A comprehensive test AI tool for validation',
    website: 'https://test-ai-tool.com',
    category: ['Machine Learning', 'Deep Learning'],
    features: ['Feature 1', 'Feature 2'],
    lastUpdated: new Date().toISOString()
  };

  describe('validateAndCleanAITool', () => {
    test('should validate and clean valid data', () => {
      const result = DataValidator.validateAndCleanAITool(validTool);
      expect(result).toBeTruthy();
      expect(result?.name).toBe(validTool.name);
    });

    test('should handle invalid name', () => {
      const result = DataValidator.validateAndCleanAITool({
        ...validTool,
        name: 'A' // 太短
      });
      expect(result).toBeNull();
    });

    test('should handle invalid description', () => {
      const result = DataValidator.validateAndCleanAITool({
        ...validTool,
        description: 'Too short' // 太短
      });
      expect(result).toBeNull();
    });

    test('should handle invalid website', () => {
      const result = DataValidator.validateAndCleanAITool({
        ...validTool,
        website: 'not-a-url'
      });
      expect(result).toBeNull();
    });

    test('should handle invalid category count', () => {
      const result = DataValidator.validateAndCleanAITool({
        ...validTool,
        category: []
      });
      expect(result).toBeNull();
    });

    test('should handle too many features', () => {
      const result = DataValidator.validateAndCleanAITool({
        ...validTool,
        features: Array.from({ length: 25 }, (_, i) => `Feature ${i + 1}`) // Generate 25 unique features
      });
      expect(result).toBeNull();
    });

    test('should handle invalid date', () => {
      const result = DataValidator.validateAndCleanAITool({
        ...validTool,
        lastUpdated: '1999-12-31T23:59:59Z' // 2000年之前
      });
      expect(result).toBeNull();
    });
  });

  describe('cleanString', () => {
    test('should clean HTML tags', () => {
      const result = DataValidator['cleanString']('<p>Test<br/>String</p>');
      expect(result).toBe('Test String');
    });

    test('should clean control characters', () => {
      const result = DataValidator['cleanString']('Test\x00String\x1F');
      expect(result).toBe('Test String');
    });

    test('should normalize whitespace', () => {
      const result = DataValidator['cleanString']('Test    String\n\t');
      expect(result).toBe('Test String');
    });

    test('should handle null or undefined', () => {
      expect(DataValidator['cleanString'](null)).toBe('');
      expect(DataValidator['cleanString'](undefined)).toBe('');
    });
  });

  describe('cleanURL', () => {
    test('should clean and validate URL', () => {
      const result = DataValidator['cleanURL']('http://test.com/path?query=1');
      expect(result).toBe('https://test.com/path?query=1');
    });

    test('should remove sensitive parameters', () => {
      const result = DataValidator['cleanURL']('https://test.com?token=secret&name=test');
      expect(result).toBe('https://test.com/?name=test');
    });

    test('should remove javascript in hash', () => {
      const result = DataValidator['cleanURL']('https://test.com#javascript:alert(1)');
      expect(result).toBe('https://test.com/');
    });

    test('should handle invalid URLs', () => {
      expect(DataValidator['cleanURL']('not-a-url')).toBe('');
      expect(DataValidator['cleanURL'](null)).toBe('');
    });
  });

  describe('cleanCategories', () => {
    test('should clean and normalize categories', () => {
      const result = DataValidator['cleanCategories'](['ml', 'Deep Learning', 'machine learning']);
      expect(result).toContain('Machine Learning');
      expect(result).toContain('Deep Learning');
      expect(result.length).toBe(2); // 去重后应该只有两个分类
    });

    test('should handle non-array input', () => {
      const result = DataValidator['cleanCategories']('Machine Learning');
      expect(result).toContain('Machine Learning');
      expect(result.length).toBe(1);
    });

    test('should handle empty or invalid input', () => {
      expect(DataValidator['cleanCategories'](null)).toHaveLength(0);
      expect(DataValidator['cleanCategories']([])).toHaveLength(0);
    });
  });

  describe('cleanFeatures', () => {
    test('should clean and deduplicate features', () => {
      const result = DataValidator['cleanFeatures'](['Feature 1', 'Feature 1', '<p>Feature 2</p>']);
      expect(result).toHaveLength(2);
      expect(result).toContain('Feature 1');
      expect(result).toContain('Feature 2');
    });

    test('should handle non-array input', () => {
      const result = DataValidator['cleanFeatures']('Single Feature');
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('Single Feature');
    });

    test('should handle empty or invalid input', () => {
      expect(DataValidator['cleanFeatures'](null)).toHaveLength(0);
      expect(DataValidator['cleanFeatures']([])).toHaveLength(0);
    });
  });
}); 