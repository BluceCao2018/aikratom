"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCollector = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
class BaseCollector {
    constructor() { }
    // 收集数据的主方法
    async collect() {
        try {
            logger_1.default.info(`Starting collection for ${this.constructor.name}`);
            await this.doCollect();
            logger_1.default.info(`Completed collection for ${this.constructor.name}`);
        }
        catch (error) {
            logger_1.default.error(`Error in ${this.constructor.name} collection:`, error);
            throw error;
        }
    }
}
exports.BaseCollector = BaseCollector;
