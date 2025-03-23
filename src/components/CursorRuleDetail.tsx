'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Copy, FileDown } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface CursorRuleDetailProps {
  content: string;
  title: string;
  url: string;
}

export function CursorRuleDetail({ content, title, url }: CursorRuleDetailProps) {
  const { toast } = useToast();

  const handleCopy = async () => {
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

  const handleDownload = () => {
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-cursor-rules.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
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

  const handleShare = async () => {
    try {
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}${url}`;
      
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
    <div className="relative bg-background/60 backdrop-blur-sm rounded-lg border group">
      <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
          onClick={handleCopy}
        >
          <Copy className="h-4 w-4 text-blue-500" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 text-blue-500" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
          onClick={handleShare}
        >
          <FileDown className="h-4 w-4 text-blue-500" />
        </Button>
      </div>
      <Textarea
        value={content}
        readOnly
        className="min-h-[600px] font-mono text-sm bg-transparent border-0 resize-none focus-visible:ring-0 transition-colors group-hover:text-foreground/90"
      />
    </div>
  );
} 