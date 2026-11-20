import React, { useState, useEffect, useRef } from 'react';
import { BrandSurveyV2Service } from '../../services/surveyServiceV2';
import { isSupabaseV2Configured } from '../../services/supabaseClient';
import {
  Upload, Trash2, Image as ImageIcon, RefreshCw, Copy, Check, X, Loader2, AlertCircle,
} from 'lucide-react';

const EXPECTED_FILENAMES = [
  'H1a', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10', 'H11',
  'LOGO-HH', 'TL-a', 'TL-b', 'TL-c', 'TL-d',
  'SO-SANH', 'NB-A', 'NB-SET',
  'NB1-16', 'NB1-24', 'NB1-32',
  'NB2-30', 'NB2-20', 'NB2-10',
];

export const ImageUploadPanel: React.FC = () => {
  const [images, setImages] = useState<{ name: string; url: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ name: string; url: string } | null>(null);
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const [customFileName, setCustomFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    if (!isSupabaseV2Configured()) return;
    setIsLoading(true);
    try {
      const list = await BrandSurveyV2Service.listImages();
      setImages(list);
    } catch (err) {
      console.error('Failed to fetch images:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Strip extension for the default custom name
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    setCustomFileName(nameWithoutExt);
    setUploadError(null);
    setUploadSuccess(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !customFileName.trim()) return;
    setUploadingFile(customFileName);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const result = await BrandSurveyV2Service.uploadImage(customFileName.trim(), selectedFile);
      if (result.error) {
        setUploadError(`Lỗi upload: ${result.error}`);
        return;
      }
      setUploadSuccess(`✓ Đã upload "${customFileName.trim()}" thành công!`);
      setSelectedFile(null);
      setCustomFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchImages();
    } catch (err: any) {
      setUploadError(`Lỗi upload: ${err?.message || 'Unknown error'}`);
    } finally {
      setUploadingFile(null);
    }
  };

  const handleDelete = async (name: string) => {
    if (!window.confirm(`Xóa file "${name}"?`)) return;
    try {
      await BrandSurveyV2Service.deleteImage(name);
      await fetchImages();
    } catch (err: any) {
      alert(`Lỗi xóa: ${err?.message}`);
    }
  };

  const handleCopyName = (name: string) => {
    // Copy filename without extension
    const nameWithoutExt = name.replace(/\.[^/.]+$/, '');
    navigator.clipboard.writeText(nameWithoutExt).then(() => {
      setCopiedName(name);
      setTimeout(() => setCopiedName(null), 2000);
    });
  };

  if (!isSupabaseV2Configured()) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-6 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Supabase V2 chưa được cấu hình.</p>
          <p className="text-sm text-amber-700 mt-1">
            Vui lòng thêm <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_V2_URL</code> vào .env.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Expected filenames info box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <ImageIcon className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-800">Tên file hệ thống yêu cầu</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {EXPECTED_FILENAMES.map(fn => (
            <span key={fn} className="inline-block bg-blue-100 text-blue-800 text-xs font-mono px-2 py-0.5 rounded">
              {fn}
            </span>
          ))}
        </div>
        <p className="text-xs text-blue-700">
          Tên file (không có đuôi) phải khớp chính xác với các tên trên để hiển thị đúng trong phiếu khảo sát.
        </p>
      </div>

      {/* Upload section */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Upload className="h-4 w-4 text-amber-600" />
          Upload hình ảnh
        </h3>

        {/* Drag & drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-amber-400 bg-amber-50'
              : 'border-gray-300 hover:border-amber-300 hover:bg-amber-50/40'
          }`}
        >
          <ImageIcon className={`h-10 w-10 mx-auto mb-2 ${dragOver ? 'text-amber-500' : 'text-gray-400'}`} />
          {selectedFile ? (
            <div>
              <p className="text-sm font-medium text-gray-800">{selectedFile.name}</p>
              <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600">Kéo thả file vào đây hoặc</p>
              <span className="inline-block mt-1 text-sm font-medium text-amber-600 underline">Chọn file</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>

        {/* Custom file name input */}
        {selectedFile && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Tên file (không có đuôi) — phải khớp với tên hệ thống
            </label>
            <input
              type="text"
              value={customFileName}
              onChange={e => setCustomFileName(e.target.value)}
              placeholder="Ví dụ: H1, H2, SO_SANH..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        )}

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || !customFileName.trim() || !!uploadingFile}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
        >
          {uploadingFile ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang upload "{uploadingFile}"...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload
            </>
          )}
        </button>

        {uploadError && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{uploadError}</p>
          </div>
        )}
        {uploadSuccess && (
          <div className="rounded-md bg-green-50 border border-green-200 p-3 flex items-start gap-2">
            <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{uploadSuccess}</p>
          </div>
        )}
      </div>

      {/* Image library */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-amber-600" />
            Thư viện hình ảnh ({images.length} file)
          </h3>
          <button
            onClick={fetchImages}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-amber-600 border border-gray-200 rounded px-2 py-1 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500">
            <ImageIcon className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            Chưa có hình ảnh nào. Hãy upload file đầu tiên.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map(img => {
              const nameWithoutExt = img.name.replace(/\.[^/.]+$/, '');
              const isCopied = copiedName === img.name;
              return (
                <div
                  key={img.name}
                  className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
                >
                  {/* Thumbnail */}
                  <div
                    className="aspect-square overflow-hidden cursor-pointer"
                    onClick={() => setPreviewImage(img)}
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>

                  {/* Card footer */}
                  <div className="p-2 space-y-1.5">
                    <p className="text-xs font-mono font-semibold text-gray-800 truncate" title={img.name}>
                      {nameWithoutExt}
                    </p>
                    <div className="flex items-center gap-1">
                      {/* Copy name */}
                      <button
                        onClick={() => handleCopyName(img.name)}
                        title="Copy tên file"
                        className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded transition-colors ${
                          isCopied
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 hover:bg-amber-100 text-gray-600 hover:text-amber-700'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3" />
                            Đã copy
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy
                          </>
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(img.name)}
                        title="Xóa"
                        className="ml-auto flex items-center justify-center p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={previewImage.url}
              alt={previewImage.name}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <p className="mt-3 text-sm font-mono text-white/90 bg-black/40 px-3 py-1 rounded">
              {previewImage.name.replace(/\.[^/.]+$/, '')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
