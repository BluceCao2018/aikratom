'use client'
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Copy, FileDown } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { usePathname } from 'next/navigation';

interface CursorRule {
  title: string;
  content: string;
  url?: string;
}

interface CursorRuleGridProps {
  rules: CursorRule[];
}

export function CursorRuleGrid({ rules }: CursorRuleGridProps) {
  const { toast } = useToast();
  const pathname = usePathname();

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Content has been copied to clipboard",
        duration: 2000,
      });
    } catch (err) {
      console.error('Failed to copy text:', err);
      toast({
        title: "Error",
        description: "Failed to copy content",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleDownload = (title: string, content: string) => {
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-cursor-rules.mdc`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Downloaded!",
        description: "Rules have been downloaded successfully",
        duration: 2000,
      });
    } catch (err) {
      console.error('Failed to download file:', err);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleShare = async (rule: CursorRule) => {
    try {
      // Get the base URL from the current pathname
      const baseUrl = window.location.origin;
      const ruleUrl = rule.url || pathname;
      const fullUrl = `${baseUrl}${ruleUrl}`;
      
      await navigator.clipboard.writeText(fullUrl);
      toast({
        title: "Link Copied!",
        description: "Rule URL has been copied to clipboard",
        duration: 2000,
      });
    } catch (err) {
      console.error('Failed to copy URL:', err);
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {rules.map((rule, index) => (
        <div
          key={index}
          className="group relative bg-card border rounded-lg overflow-hidden transition-all hover:border-accent hover:shadow-lg"
        >
          <div className="p-4">
            <h3 className="font-semibold mb-2 text-blue-500">{rule.title}</h3>
            <div className="h-[300px] overflow-y-auto prose-sm dark:prose-invert">
              <pre className="whitespace-pre-wrap text-sm transition-colors group-hover:text-foreground/90">
                {rule.content}
              </pre>
            </div>
          </div>
          
          <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
              onClick={() => handleCopy(rule.content)}
            >
              <Copy className="h-4 w-4 text-blue-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
              onClick={() => handleDownload(rule.title, rule.content)}
            >
              <Download className="h-4 w-4 text-blue-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
              onClick={() => handleShare(rule)}
            >
              <FileDown className="h-4 w-4 text-blue-500" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
} 