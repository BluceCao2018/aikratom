import fs from 'fs'
import path from 'path'
import * as jsonc from 'jsonc-parser';

// 读取 categories 数据
export function getCategories(locale) {
    const categoriesPath = path.join(process.cwd(), 'data', 'json', locale, 'tools', 'category.jsonc');
    const categories = jsonc.parse(fs.readFileSync(categoriesPath, 'utf8'));
    if (typeof categories === 'string') {
        // 如果解析后仍是字符串，可能需要二次解析
        try {
            return jsonc.parse(categories);
        } catch (error) {
            console.error('二次解析失败:', error);
            return categories; // 如果二次解析失败，返回原始解析结果
        }
    }
    return categories;
}


// 读取category数据
export function getCategoryByLink(link, locale) {
    const categoriesPath = path.join(process.cwd(), 'data', 'json', locale, 'tools', 'category.jsonc');
    const categories = jsonc.parse(fs.readFileSync(categoriesPath, 'utf8'));
    return categories.find(category => category.link === link);

}

// 读取 datalist 数据
export function getDataList(src, locale) {
    const dataPath = path.join(process.cwd(), 'data', 'json', locale, 'tools', src);
    const dataList = jsonc.parse(fs.readFileSync(dataPath, 'utf8'));
    if (typeof dataList === 'string') {
        // 如果解析后仍是字符串，可能需要二次解析
        try {
            return jsonc.parse(dataList);
        } catch (error) {
            console.error('二次解析失败:', error);
            return dataList; // 如果二次解析失败，返回原始解析结果
        }
    }

    return dataList;
}

// 根据关键词搜索数据
export function searchDataByKeyword(keyword, locale) {
    let result = []
    
    const categories = getCategories(locale);

    
    if (!categories || categories.length === 0) return null;

    
    for (const category of categories) {
        if (category.name.toLowerCase() == keyword.toLowerCase()) {
             const dataList = getDataList(category.src, locale)
             result = result.concat(dataList);
        } else {
            const dataList = getDataList(category.src, locale)
        
            for (const item of dataList) {
                if (item.name.toLowerCase().includes(keyword.toLowerCase())) {
                    // search by name
                    result.push(item)
                } else if (item.tags && item.tags.some(tag => tag.toLowerCase() == keyword.toLowerCase())) {
                    // search by tags
                    // console.log('item hit: ', item)
                    result.push(item)
                }
            }
        }
        
        // console.log('result: ', result)
    }

    return result;
}

// 读取更新日志
export function getChangelog() {
    const dataPath = path.join(process.cwd(), 'data', 'json', 'changelog.jsonc');
    const dataList = jsonc.parse(fs.readFileSync(dataPath, 'utf8'));
    return dataList;
}

// MCP相关数据获取函数
export function getMCPCategories(locale) {
    const categoriesPath = path.join(process.cwd(), 'data', 'json', locale, 'mcp', 'category.jsonc');
    const categories = jsonc.parse(fs.readFileSync(categoriesPath, 'utf8'));
    return categories;
}

export function getMCPDataList(src, locale) {
    const dataPath = path.join(process.cwd(), 'data', 'json', locale, 'mcp', src);
    const dataList = jsonc.parse(fs.readFileSync(dataPath, 'utf8'));
    return dataList;
}

export function searchMCPByKeyword(keyword, locale) {
  let result = []
  const categories = getMCPCategories(locale)
  
  if (!categories || categories.length === 0) return []

  for (const category of categories) {
    const dataList = getMCPDataList(category.src, locale)
    
    for (const item of dataList) {
      if (item.name.toLowerCase().includes(keyword.toLowerCase())) {
        // search by name
        result.push(item)
      } else if (item.tags && item.tags.some(tag => tag.toLowerCase() === keyword.toLowerCase())) {
        // search by tags
        result.push(item)
      }
    }
  }

  return result
}

export function getCursorCategories(locale) {
    const categoriesPath = path.join(process.cwd(), 'data', 'json', locale, 'cursor', 'category.jsonc');
    const categories = jsonc.parse(fs.readFileSync(categoriesPath, 'utf8'));
    return categories;
}

export function getCursorDataList(src, locale) {
    const dataPath = path.join(process.cwd(), 'data', 'json', locale, 'cursor', src);
    const dataList = jsonc.parse(fs.readFileSync(dataPath, 'utf8'));
    return dataList;
}

// 获取 MCP 数据通过链接
export function getMCPByLink(link, locale) {
    const mcpPath = path.join(process.cwd(), 'data', 'json', locale, 'mcp', 'category.jsonc');
    const mcpCategories = jsonc.parse(fs.readFileSync(mcpPath, 'utf8'));
    return mcpCategories.find(category => category.link === link);
}

// 获取 Cursor 数据通过链接
export function getCursorByLink(link, locale) {
    const cursorPath = path.join(process.cwd(), 'data', 'json', locale, 'cursor', 'category.jsonc');
    const cursorCategories = jsonc.parse(fs.readFileSync(cursorPath, 'utf8'));
    return cursorCategories.find(category => category.link === link);
}

