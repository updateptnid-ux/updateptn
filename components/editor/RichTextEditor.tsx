'use client';

/**
 * Secure Rich Text Editor Component
 * Uses TipTap editor with security-first approach
 * - XSS protection through content sanitization
 * - Image upload with validation
 * - Mobile-optimized interface
 */

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useState } from 'react';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading2, 
  Heading3, 
  Quote, 
  Image as ImageIcon, 
  Link as LinkIcon,
  Undo,
  Redo,
  Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sanitizeHTML } from '@/lib/article-security';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
}

export function RichTextEditor({ 
  content, 
  onChange, 
  onImageUpload,
  placeholder = 'Tulis konten artikel di sini...' 
}: RichTextEditorProps) {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: false, // Security: prevent base64 images
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer', // Security: prevent tabnabbing
        },
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Sanitize output before passing to parent
      const sanitized = sanitizeHTML(html);
      onChange(sanitized);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none min-h-[400px] p-4 focus:outline-none',
        style: 'font-size: 16px', // Prevent iOS auto-zoom
      },
    },
  });

  if (!editor) {
    return null;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;

    try {
      setUploadingImage(true);
      const url = await onImageUpload(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      alert('Gagal upload gambar: ' + (error as Error).message);
    } finally {
      setUploadingImage(false);
    }
  };

  const insertImageUrl = () => {
    if (!imageUrl) return;
    
    // Validate URL format (basic XSS prevention)
    try {
      const url = new URL(imageUrl);
      if (!url.protocol.match(/^https?:$/)) {
        alert('URL harus menggunakan http atau https');
        return;
      }
    } catch {
      alert('URL tidak valid');
      return;
    }

    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl('');
    setIsImageDialogOpen(false);
  };

  const insertLink = () => {
    if (!linkUrl) return;

    // Validate URL format
    try {
      const url = new URL(linkUrl);
      if (!url.protocol.match(/^https?:$/)) {
        alert('URL harus menggunakan http atau https');
        return;
      }
    } catch {
      alert('URL tidak valid');
      return;
    }

    const text = linkText || linkUrl;
    
    if (editor.state.selection.empty) {
      // No selection, insert new link
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`)
        .run();
    } else {
      // Has selection, make it a link
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }

    setLinkUrl('');
    setLinkText('');
    setIsLinkDialogOpen(false);
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Toolbar - Mobile Optimized */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap items-center gap-1">
        {/* Text Formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-9 w-9 p-0 touch-manipulation ${editor.isActive('bold') ? 'bg-slate-200' : ''}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-9 w-9 p-0 touch-manipulation ${editor.isActive('italic') ? 'bg-slate-200' : ''}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`h-9 w-9 p-0 touch-manipulation ${editor.isActive('code') ? 'bg-slate-200' : ''}`}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        {/* Headings */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`h-9 w-9 p-0 touch-manipulation ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200' : ''}`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`h-9 w-9 p-0 touch-manipulation ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-200' : ''}`}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-9 w-9 p-0 touch-manipulation ${editor.isActive('bulletList') ? 'bg-slate-200' : ''}`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-9 w-9 p-0 touch-manipulation ${editor.isActive('orderedList') ? 'bg-slate-200' : ''}`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`h-9 w-9 p-0 touch-manipulation ${editor.isActive('blockquote') ? 'bg-slate-200' : ''}`}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        {/* Media */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsImageDialogOpen(true)}
          className="h-9 w-9 p-0 touch-manipulation"
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsLinkDialogOpen(true)}
          className="h-9 w-9 p-0 touch-manipulation"
          title="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-9 w-9 p-0 touch-manipulation"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-9 w-9 p-0 touch-manipulation"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Image Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sisipkan Gambar</DialogTitle>
            <DialogDescription>
              Upload gambar atau masukkan URL gambar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {onImageUpload && (
              <div className="space-y-2">
                <Label>Upload File</Label>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  style={{ fontSize: '16px' }}
                />
                {uploadingImage && (
                  <p className="text-xs text-slate-500">Uploading...</p>
                )}
              </div>
            )}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">atau</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL Gambar</Label>
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{ fontSize: '16px' }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={insertImageUrl} disabled={!imageUrl}>
              Sisipkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sisipkan Link</DialogTitle>
            <DialogDescription>
              Tambahkan link ke teks yang dipilih atau buat link baru
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>URL *</Label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                style={{ fontSize: '16px' }}
              />
            </div>
            <div className="space-y-2">
              <Label>Teks Link (opsional)</Label>
              <Input
                type="text"
                placeholder="Klik di sini"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                style={{ fontSize: '16px' }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={insertLink} disabled={!linkUrl}>
              Sisipkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
