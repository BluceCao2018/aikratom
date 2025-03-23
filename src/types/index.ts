export interface CursorCategory {
    name: string;
    link: string;
    description: string;
    count?: number;
  }
  
  export interface CursorRule {
    title: string;
    content: string;
    category: string;
    language?: string;
  }