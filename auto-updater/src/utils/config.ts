import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// 配置验证schema
const configSchema = z.object({
  aiTools: z.object({
    productHunt: z.object({
      url: z.string().url(),
      topics: z.array(z.string())
    }),
    githubTopics: z.array(z.string()),
    rssFeeds: z.array(z.object({
      name: z.string(),
      url: z.string().url()
    }))
  }),
  mcpServers: z.object({
    sources: z.array(z.object({
      name: z.string(),
      url: z.string().url()
    })),
    githubTopics: z.array(z.string())
  }),
  cursorRules: z.object({
    githubTopics: z.array(z.string()),
    communities: z.array(z.object({
      name: z.string(),
      url: z.string().url()
    }))
  })
});

export type Config = z.infer<typeof configSchema>;

class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    const configPath = path.resolve(__dirname, '../../config/sources.json');
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    this.config = configSchema.parse(configData);
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public getConfig(): Config {
    return this.config;
  }

  public getDataDir(): string {
    return process.env.DATA_DIR || '../data';
  }

  public getUpdateInterval(): string {
    return process.env.UPDATE_INTERVAL || '4h';
  }
}

export default ConfigManager; 