import { z } from 'zod';

// AI工具数据验证schema
export interface AITool {
  name: string;
  description: string;
  website: string;
  features: string[];
  categories: string[];
  lastUpdated?: string;
}

export const aiToolSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    website: { type: 'string' },
    features: { 
      type: 'array',
      items: { type: 'string' }
    },
    categories: {
      type: 'array',
      items: { type: 'string' }
    },
    lastUpdated: { type: 'string' }
  },
  required: ['name', 'description', 'website', 'features', 'categories']
};

// MCP服务器数据验证schema
export const mcpServerSchema = z.object({
  name: z.string(),
  description: z.string(),
  address: z.string(),
  version: z.string(),
  type: z.string(),
  lastUpdated: z.string()
});

// Cursor规则数据验证schema
export const cursorRuleSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.string(),
  content: z.string(),
  lastUpdated: z.string()
});

// 分类文件验证schema
export const categorySchema = z.object({
  name: z.string(),
  src: z.string(),
  link: z.string(),
  description: z.string(),
  h1: z.string().optional(),
  h1description: z.string().optional()
});

export type MCPServer = z.infer<typeof mcpServerSchema>;
export type CursorRule = z.infer<typeof cursorRuleSchema>;
export type Category = z.infer<typeof categorySchema>; 