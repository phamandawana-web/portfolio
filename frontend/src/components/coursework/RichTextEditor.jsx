import React, { useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered,
  Link as LinkIcon, Image as ImageIcon, Video, Table as TableIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo, Redo, Code, Quote, FileText, Minus, Music, Paperclip,
  BookOpen, ExternalLink
} from 'lucide-react';
import { Button } from '../ui/button';
import { Toggle } from '../ui/toggle';
import { Separator } from '../ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const MenuButton = ({ onClick, isActive, disabled, children, title }) => (
  <Toggle
    size="sm"
    pressed={isActive}
    onPressedChange={onClick}
    disabled={disabled}
    aria-label={title}
    className="h-8 w-8 p-0 data-[state=on]:bg-slate-200"
  >
    {children}
  </Toggle>
);

const RichTextEditor = ({ 
  content = '', 
  onChange, 
  placeholder = 'Start writing...',
  editable = true,
  minHeight = '300px',
  courses = [], // For internal page linking
  currentCourseSlug = ''
}) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showPageLinkDialog, setShowPageLinkDialog] = useState(false);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [showAudioDialog, setShowAudioDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioTitle, setAudioTitle] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer hover:text-blue-800',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg shadow-md my-4',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-slate-100 font-semibold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-slate-300 px-4 py-2',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'rounded-lg overflow-hidden my-4',
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    );
    
    setLinkUrl(previousUrl || '');
    setLinkText(selectedText || '');
    setShowLinkDialog(true);
  }, [editor]);

  const insertLink = useCallback(() => {
    if (!editor || !linkUrl) return;
    
    if (linkText && !editor.state.selection.empty) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    } else if (linkText) {
      editor.chain().focus().insertContent(`<a href="${linkUrl}">${linkText}</a>`).run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  }, [editor, linkUrl, linkText]);

  const insertPageLink = useCallback(() => {
    if (!editor || !selectedCourse || !selectedTopic) return;
    
    const course = courses.find(c => c.slug === selectedCourse);
    const topic = course?.topics_data?.find(t => t.slug === selectedTopic);
    const linkHref = `/coursework/${selectedCourse}/${selectedTopic}`;
    const linkLabel = topic?.title || selectedTopic;
    
    editor.chain().focus().insertContent(
      `<a href="${linkHref}" class="internal-link">${linkLabel}</a>`
    ).run();
    
    setShowPageLinkDialog(false);
    setSelectedCourse('');
    setSelectedTopic('');
  }, [editor, selectedCourse, selectedTopic, courses]);

  const insertFileAttachment = useCallback(() => {
    if (!editor || !fileUrl) return;
    
    const displayName = fileName || 'Download File';
    editor.chain().focus().insertContent(
      `<div class="file-attachment">
        <a href="${fileUrl}" target="_blank" rel="noopener noreferrer" class="file-link">
          📎 ${displayName}
        </a>
      </div>`
    ).run();
    
    setShowFileDialog(false);
    setFileUrl('');
    setFileName('');
  }, [editor, fileUrl, fileName]);

  const insertAudio = useCallback(() => {
    if (!editor || !audioUrl) return;
    
    const title = audioTitle || 'Audio';
    editor.chain().focus().insertContent(
      `<div class="audio-embed">
        <p class="audio-title">🎵 ${title}</p>
        <audio controls src="${audioUrl}" class="audio-player">
          Your browser does not support the audio element.
        </audio>
      </div>`
    ).run();
    
    setShowAudioDialog(false);
    setAudioUrl('');
    setAudioTitle('');
  }, [editor, audioUrl, audioTitle]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addYoutubeVideo = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('YouTube URL');
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  }, [editor]);

  const addTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      {editable && (
        <div className="border-b border-slate-200 p-2 bg-slate-50 flex flex-wrap items-center gap-1">
          {/* History */}
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </MenuButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Text formatting */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Code"
          >
            <Code className="h-4 w-4" />
          </MenuButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Headings */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </MenuButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Lists */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </MenuButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Alignment */}
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </MenuButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Links & Media */}
          <MenuButton
            onClick={() => setShowLinkDialog(true)}
            isActive={editor.isActive('link')}
            title="Add External Link"
          >
            <ExternalLink className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => setShowPageLinkDialog(true)}
            title="Link to LMS Page"
          >
            <BookOpen className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={addImage}
            title="Add Image"
          >
            <ImageIcon className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={addYoutubeVideo}
            title="Add YouTube Video"
          >
            <Video className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => setShowAudioDialog(true)}
            title="Add Audio"
          >
            <Music className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => setShowFileDialog(true)}
            title="Add File Attachment"
          >
            <Paperclip className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={addTable}
            title="Insert Table"
          >
            <TableIcon className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <Minus className="h-4 w-4" />
          </MenuButton>

          {/* Table controls (only show when in table) */}
          {editor.isActive('table') && (
            <>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                className="h-8 text-xs"
              >
                + Col Before
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className="h-8 text-xs"
              >
                + Col After
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().addRowBefore().run()}
                className="h-8 text-xs"
              >
                + Row Before
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="h-8 text-xs"
              >
                + Row After
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="h-8 text-xs text-red-600"
              >
                Delete Table
              </Button>
            </>
          )}
        </div>
      )}

      {/* Editor Content */}
      <div 
        className="prose prose-slate max-w-none p-4"
        style={{ minHeight }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* External Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Add External Link
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-text">Link Text (optional)</Label>
              <Input
                id="link-text"
                placeholder="Click here"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={insertLink} disabled={!linkUrl}>Insert Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Page Link Dialog */}
      <Dialog open={showPageLinkDialog} onOpenChange={setShowPageLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Link to LMS Page
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Course</Label>
              <Select value={selectedCourse} onValueChange={(value) => {
                setSelectedCourse(value);
                setSelectedTopic('');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a course..." />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.slug} value={course.slug}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedCourse && (
              <div className="space-y-2">
                <Label>Select Topic</Label>
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a topic..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.find(c => c.slug === selectedCourse)?.topics_data?.map((topic) => (
                      <SelectItem key={topic.slug} value={topic.slug}>
                        {topic.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={insertPageLink} disabled={!selectedCourse || !selectedTopic}>
              Insert Page Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Attachment Dialog */}
      <Dialog open={showFileDialog} onOpenChange={setShowFileDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Paperclip className="h-5 w-5" />
              Add File Attachment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file-url">File URL</Label>
              <Input
                id="file-url"
                placeholder="https://example.com/document.pdf"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Enter the URL of the file (PDF, DOCX, PPTX, etc.)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-name">Display Name</Label>
              <Input
                id="file-name"
                placeholder="Lecture Notes.pdf"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={insertFileAttachment} disabled={!fileUrl}>
              Add Attachment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audio Embed Dialog */}
      <Dialog open={showAudioDialog} onOpenChange={setShowAudioDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Add Audio
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="audio-url">Audio URL</Label>
              <Input
                id="audio-url"
                placeholder="https://example.com/audio.mp3"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Supports MP3, WAV, OGG, and other audio formats
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audio-title">Title (optional)</Label>
              <Input
                id="audio-title"
                placeholder="Lecture Recording"
                value={audioTitle}
                onChange={(e) => setAudioTitle(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={insertAudio} disabled={!audioUrl}>
              Add Audio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editor Styles */}
      <style>{`
        .ProseMirror {
          outline: none;
          min-height: ${minHeight};
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: 700;
          margin-bottom: 0.5em;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin-bottom: 0.5em;
        }
        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin-bottom: 0.5em;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5em;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #e2e8f0;
          padding-left: 1em;
          margin-left: 0;
          color: #64748b;
        }
        .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        .ProseMirror th, .ProseMirror td {
          border: 1px solid #e2e8f0;
          padding: 0.5em 1em;
          text-align: left;
        }
        .ProseMirror th {
          background: #f8fafc;
          font-weight: 600;
        }
        .ProseMirror code {
          background: #f1f5f9;
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-family: monospace;
        }
        .ProseMirror pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1em;
          border-radius: 8px;
          overflow-x: auto;
        }
        .ProseMirror pre code {
          background: none;
          padding: 0;
          color: inherit;
        }
        .ProseMirror hr {
          border: none;
          border-top: 2px solid #e2e8f0;
          margin: 2em 0;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
        }
        .ProseMirror iframe {
          width: 100%;
          border-radius: 8px;
        }
        .ProseMirror .internal-link {
          color: #7c3aed;
          text-decoration: underline;
          cursor: pointer;
        }
        .ProseMirror .internal-link:hover {
          color: #5b21b6;
        }
        .ProseMirror .file-attachment {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
          margin: 1em 0;
          display: inline-block;
        }
        .ProseMirror .file-link {
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ProseMirror .file-link:hover {
          text-decoration: underline;
        }
        .ProseMirror .audio-embed {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 16px;
          margin: 1em 0;
        }
        .ProseMirror .audio-title {
          color: white;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .ProseMirror .audio-player {
          width: 100%;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
