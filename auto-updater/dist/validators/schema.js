"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categorySchema = exports.cursorRuleSchema = exports.mcpServerSchema = exports.aiToolSchema = void 0;
const zod_1 = require("zod");
// AI工具数据验证schema
exports.aiToolSchema = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    website: zod_1.z.string().url(),
    category: zod_1.z.array(zod_1.z.string()),
    pricing: zod_1.z.string().optional(),
    features: zod_1.z.array(zod_1.z.string()).optional(),
    lastUpdated: zod_1.z.string()
});
// MCP服务器数据验证schema
exports.mcpServerSchema = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    address: zod_1.z.string(),
    version: zod_1.z.string(),
    type: zod_1.z.string(),
    lastUpdated: zod_1.z.string()
});
// Cursor规则数据验证schema
exports.cursorRuleSchema = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    category: zod_1.z.string(),
    content: zod_1.z.string(),
    lastUpdated: zod_1.z.string()
});
// 分类文件验证schema
exports.categorySchema = zod_1.z.object({
    name: zod_1.z.string(),
    src: zod_1.z.string(),
    link: zod_1.z.string(),
    description: zod_1.z.string(),
    h1: zod_1.z.string().optional(),
    h1description: zod_1.z.string().optional()
});
