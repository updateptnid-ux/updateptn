'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, Underline as UnderlineIcon } from 'lucide-react';
import { useEffect } from 'react';
import { sanitizeHTML } from '@/lib/article-security';

interface QuestionTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function QuestionTextEditor({
  value,
  onChange,
  placeholder = 'Tulis soal di sini...',
  className = '',
}: QuestionTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Underline,
    ],
    content: value || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'focus:outline-none min-h-[100px] max-h-[220px] overflow-y-auto p-3 text-sm text-slate-800 leading-relaxed [&_p]:my-1 [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_u]:underline',
      },
    },
    onUpdate: ({ editor }) => {
      if (editor.isEmpty) {
        onChange('');
      } else {
        const html = editor.getHTML();
        onChange(sanitizeHTML(html));
      }
    },
  });

  // Sinkronisasi value dari parent (misal saat form di-reset atau ganti soal di modal edit)
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (value !== currentHtml) {
      if (!editor.isFocused || !value) {
        editor.commands.setContent(value || '', { emitUpdate: false });
      }
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className={`w-full min-h-[140px] border border-slate-200 rounded-xl bg-slate-50/50 animate-pulse ${className}`} />
    );
  }

  return (
    <div
      className={`w-full border border-slate-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all ${className}`}
    >
      {/* Toolbar Format Teks Dasar: Bold, Italic, Underline */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-slate-50 border-b border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
            editor.isActive('bold')
              ? 'bg-blue-100 text-blue-700 font-bold border border-blue-200 shadow-2xs'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 border border-transparent'
          }`}
          title="Tebal / Bold (Ctrl+B)"
          aria-label="Tebal"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
            editor.isActive('italic')
              ? 'bg-blue-100 text-blue-700 shadow-2xs border border-blue-200'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 border border-transparent'
          }`}
          title="Miring / Italic (Ctrl+I)"
          aria-label="Miring"
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
            editor.isActive('underline')
              ? 'bg-blue-100 text-blue-700 shadow-2xs border border-blue-200'
              : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 border border-transparent'
          }`}
          title="Garis Bawah / Underline (Ctrl+U)"
          aria-label="Garis Bawah"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Surface */}
      <div
        className="relative min-h-[100px] cursor-text"
        onClick={() => editor.commands.focus()}
      >
        {editor.isEmpty && (
          <div className="absolute top-3 left-3 text-slate-400 pointer-events-none text-sm select-none">
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
