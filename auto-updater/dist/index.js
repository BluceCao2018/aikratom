"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ai_tools_1 = require("./collectors/ai_tools");
const mcp_1 = require("./collectors/mcp");
const cursor_rules_1 = require("./collectors/cursor_rules");
const logger_1 = __importDefault(require("./utils/logger"));
async function main() {
    try {
        logger_1.default.info('Starting data collection process');
        // 创建收集器实例
        const aiToolsCollector = new ai_tools_1.AIToolsCollector();
        const mcpCollector = new mcp_1.MCPCollector();
        const cursorRulesCollector = new cursor_rules_1.CursorRulesCollector();
        // 并行执行所有收集器
        const results = await Promise.allSettled([
            aiToolsCollector.collect(),
            // mcpCollector.collect(),
            // cursorRulesCollector.collect()
        ]);
        // 检查结果
        results.forEach((result, index) => {
            const collectorNames = ['AITools', 'MCP', 'Cursor Rules'];
            if (result.status === 'fulfilled') {
                logger_1.default.info(`${collectorNames[index]} collection completed successfully`);
            }
            else {
                logger_1.default.error(`${collectorNames[index]} collection failed`, { error: result.reason });
            }
        });
        logger_1.default.info('Data collection process completed');
    }
    catch (error) {
        logger_1.default.error('Fatal error in data collection process', { error });
        process.exit(1);
    }
}
// 运行主函数
main().catch(error => {
    logger_1.default.error('Unhandled error in main process', { error });
    process.exit(1);
});
