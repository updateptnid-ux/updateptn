'use client';

/**
 * Secure Image Upload Component
 * - File validation (type, size, name)
 * - XSS prevention
 * - Mobile-optimized
 */

import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { validateImageFile } from '@/lib/article-security';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
  maxSizeMB?: number;
}

export function ImageUpload({ 
  value, 
  onChange, 
  onUpload,
  maxSizeMB = 5 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
    const validation = validateImageFile(file, maxSizeMB);
    if (!validation.valid) {
      setError(validation.error || 'File tidak valid');
      return;
    }

    try {
      setUploading(true);
      const url = await onUpload(file);
      onChange(url);
    } catch (err) {
      setError('Gagal upload: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200">
          <Image
            src={value}
            alt="Featured image"
            fill
            className="object-cover"
            unoptimized
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3" />
                <p className="text-sm text-slate-600">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-slate-400 mb-3" />
                <p className="text-sm text-slate-600 font-semibold mb-1">
                  Klik untuk upload gambar
                </p>
                <p className="text-xs text-slate-400">
                  PNG, JPG, GIF, WebP (max {maxSizeMB}MB)
                </p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
