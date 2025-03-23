import json
import re

def process_json_file(file_path):
    # Read the JSON file
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Process each item in the JSON array
    for item in data:
        # Skip if author field already exists and has a value
        if 'author' in item and item['author']:
            continue
            
        if 'description' in item:
            # Look for author pattern in description
            author_pattern = r'[（(]作者[:：]([^)）]+)[)）]|作者[:：]([^\s,，.。)）]+)'
            match = re.search(author_pattern, item['description'])
            
            if match:
                # Extract author name
                author = match.group(1) if match.group(1) else match.group(2)
                
                # Remove author information from description
                item['description'] = re.sub(author_pattern, '', item['description']).strip()
                
                # Add author field
                item['author'] = author
    
    # Write back to file
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# Process both files
process_json_file('data/json/en/mcp/client.jsonc')
process_json_file('data/json/en/mcp/server.jsonc') 