import { AIToolsCollector } from './collectors/ai_tools';
import { MCPCollector } from './collectors/mcp';
import { CursorRulesCollector } from './collectors/cursor_rules';
import logger from './utils/logger';

async function main() {
  try {
    logger.info('Starting data collection process');

    // 创建收集器实例
    const aiToolsCollector = new AIToolsCollector();
    const mcpCollector = new MCPCollector();
    const cursorRulesCollector = new CursorRulesCollector();

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
        logger.info(`${collectorNames[index]} collection completed successfully`);
      } else {
        logger.error(`${collectorNames[index]} collection failed`, { error: result.reason });
      }
    });

    logger.info('Data collection process completed');
  } catch (error) {
    logger.error('Fatal error in data collection process', { error });
    process.exit(1);
  }
}

// 运行主函数
main().catch(error => {
  logger.error('Unhandled error in main process', { error });
  process.exit(1);
}); 