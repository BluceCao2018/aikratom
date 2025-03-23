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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = __importDefault(require("../utils/logger"));
const config_1 = __importDefault(require("../utils/config"));
class FileManager {
    constructor() {
        this.dataDir = config_1.default.getInstance().getDataDir();
    }
    static getInstance() {
        if (!FileManager.instance) {
            FileManager.instance = new FileManager();
        }
        return FileManager.instance;
    }
    // 保存Markdown文件
    async saveMarkdown(content, filename, subDir) {
        try {
            const dir = path.join(this.dataDir, 'md', 'en', subDir);
            await this.ensureDir(dir);
            await fs.promises.writeFile(path.join(dir, `${filename}.md`), content);
            logger_1.default.info(`Saved markdown file: ${filename}.md`);
        }
        catch (error) {
            logger_1.default.error(`Error saving markdown file: ${filename}`, error);
            throw error;
        }
    }
    // 保存分类文件
    async saveCategory(content, filename, subDir) {
        try {
            const dir = path.join(this.dataDir, 'json', 'en', subDir);
            await this.ensureDir(dir);
            await fs.promises.writeFile(path.join(dir, filename), JSON.stringify(content, null, 2));
            logger_1.default.info(`Saved category file: ${filename}`);
        }
        catch (error) {
            logger_1.default.error(`Error saving category file: ${filename}`, error);
            throw error;
        }
    }
    // 读取现有文件
    async readFile(filepath) {
        try {
            return await fs.promises.readFile(path.join(this.dataDir, filepath), 'utf-8');
        }
        catch (error) {
            logger_1.default.error(`Error reading file: ${filepath}`, error);
            throw error;
        }
    }
    // 检查文件是否存在
    async fileExists(filepath) {
        try {
            await fs.promises.access(path.join(this.dataDir, filepath));
            return true;
        }
        catch {
            return false;
        }
    }
    // 确保目录存在
    async ensureDir(dir) {
        try {
            await fs.promises.mkdir(dir, { recursive: true });
        }
        catch (error) {
            logger_1.default.error(`Error creating directory: ${dir}`, error);
            throw error;
        }
    }
}
exports.default = FileManager;
