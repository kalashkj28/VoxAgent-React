import type { KBStatusResponse } from '../types/voxagent';

export class KBApiService {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  async getStatus(): Promise<KBStatusResponse> {
    const res = await fetch(`${this.baseUrl}/api/knowledge/status`);
    if (!res.ok) {
      throw new Error(`Failed to fetch status: ${res.statusText}`);
    }
    return res.json();
  }

  async uploadPDF(file: File): Promise<{ message: string; total_chunks: number; error?: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${this.baseUrl}/api/knowledge/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Upload failed');
    }
    return data;
  }

  async deleteFile(filename: string): Promise<{ message: string }> {
    const res = await fetch(`${this.baseUrl}/api/knowledge/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to delete file: ${res.statusText}`);
    }
    return res.json();
  }

  async clearAll(): Promise<{ message: string }> {
    const res = await fetch(`${this.baseUrl}/api/knowledge/clear`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to clear knowledge base: ${res.statusText}`);
    }
    return res.json();
  }
}

export const kbApi = new KBApiService();
