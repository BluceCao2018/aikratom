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
const zod_1 = require("zod");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// 配置验证schema
const configSchema = zod_1.z.object({
    aiTools: zod_1.z.object({
        productHunt: zod_1.z.object({
            url: zod_1.z.string().url(),
            topics: zod_1.z.array(zod_1.z.string())
        }),
        githubTopics: zod_1.z.array(zod_1.z.string()),
        rssFeeds: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            url: zod_1.z.string().url()
        }))
    }),
    mcpServers: zod_1.z.object({
        sources: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            url: zod_1.z.string().url()
        })),
        githubTopics: zod_1.z.array(zod_1.z.string())
    }),
    cursorRules: zod_1.z.object({
        githubTopics: zod_1.z.array(zod_1.z.string()),
        communities: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            url: zod_1.z.string().url()
        }))
    })
});
class ConfigManager {
    constructor() {
        const configPath = path.resolve(__dirname, '../../config/sources.json');
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        this.config = configSchema.parse(configData);
    }
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    getConfig() {
        return this.config;
    }
    getDataDir() {
        return process.env.DATA_DIR || '../data';
    }
    getUpdateInterval() {
        return process.env.UPDATE_INTERVAL || '4h';
    }
}
exports.default = ConfigManager;
