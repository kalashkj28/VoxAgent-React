import React, { useState, useEffect, useRef } from 'react';
import { kbApi } from '../services/kbApi';
import type { KBStatusResponse } from '../types/voxagent';
import { FileText, Upload, Trash2, CheckCircle2 } from 'lucide-react';

interface KnowledgeBaseProps {
  onNotify: (msg: string) => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ onNotify }) => {
  const [status, setStatus] = useState<KBStatusResponse>({ files: [], total_chunks: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadStatus = async () => {
    try {
      const data = await kbApi.getStatus();
      setStatus(data);
    } catch {
      // Ignore if server isn't up yet
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      onNotify('Only PDF files are supported in Knowledge Base');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);
    setUploadStatusText(`Uploading ${file.name}...`);

    const t1 = setTimeout(() => {
      setUploadProgress(50);
      setUploadStatusText('Processing PDF text...');
    }, 500);

    const t2 = setTimeout(() => {
      setUploadProgress(80);
      setUploadStatusText('Building FAISS vector index...');
    }, 1500);

    try {
      const res = await kbApi.uploadPDF(file);
      setUploadProgress(100);
      setUploadStatusText(`Indexed ${res.total_chunks} chunks`);
      onNotify(`Uploaded ${file.name} (${res.total_chunks} chunks)`);
      await loadStatus();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setUploadStatusText(`Failed: ${msg}`);
      onNotify(`Upload failed: ${msg}`);
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 2500);
    }
  };

  const handleDelete = async (filename: string) => {
    try {
      await kbApi.deleteFile(filename);
      onNotify(`Removed document: ${filename}`);
      loadStatus();
    } catch {
      onNotify('Failed to delete document');
    }
  };

  return (
    <div className="glass-panel p-4 rounded-3xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
            Knowledge Base
          </span>
        </div>
        <span
          className={`text-[10px] font-semibold ${
            status.files.length > 0 ? 'text-emerald-600' : 'text-gray-400'
          }`}
        >
          {status.files.length > 0
            ? `${status.files.length} doc · ${status.total_chunks} chunks`
            : 'Empty'}
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full py-2.5 px-3 rounded-2xl border border-dashed border-blue-400/60 bg-blue-50/30 hover:bg-blue-50/70 hover:border-blue-500 text-blue-600 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        <Upload className="w-3.5 h-3.5" />
        <span>{isUploading ? 'Indexing PDF...' : 'Upload Knowledge PDF'}</span>
      </button>

      {/* Progress Bar */}
      {isUploading && (
        <div className="mt-3">
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-500 text-center mt-1 font-medium">
            {uploadStatusText}
          </p>
        </div>
      )}

      {/* Files List */}
      {status.files.length > 0 && (
        <div className="mt-3 space-y-1.5 max-h-28 overflow-y-auto custom-scrollbar">
          {status.files.map((file) => (
            <div
              key={file}
              className="glass-card px-2.5 py-1.5 rounded-xl flex items-center justify-between text-xs text-gray-700"
            >
              <div className="flex items-center gap-1.5 truncate pr-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span className="truncate text-[11px] font-medium">{file}</span>
              </div>
              <button
                onClick={() => handleDelete(file)}
                className="text-gray-400 hover:text-rose-500 p-1 rounded-lg transition-colors cursor-pointer"
                title="Remove file"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
