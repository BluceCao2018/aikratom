import logger from '../utils/logger';

export abstract class BaseCollector {
  protected constructor() {}

  // 收集数据的主方法
  public async collect(): Promise<void> {
    try {
      logger.info(`Starting collection for ${this.constructor.name}`);
      await this.doCollect();
      logger.info(`Completed collection for ${this.constructor.name}`);
    } catch (error) {
      logger.error(`Error in ${this.constructor.name} collection:`, error);
      throw error;
    }
  }

  // 子类需要实现的具体收集方法
  protected abstract doCollect(): Promise<void>;

  // 检查数据是否已存在
  protected abstract checkExists(id: string): Promise<boolean>;

  // 保存数据
  protected abstract saveData(data: any): Promise<void>;
}

export interface Collector {
  collect(): Promise<void>;
} 