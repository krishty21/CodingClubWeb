"use client"

import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import DOMPurify from "dompurify"
import StarterKit from "@tiptap/starter-kit"
import { Link } from "@tiptap/extension-link"
import { Image } from "@tiptap/extension-image"
import { Placeholder } from "@tiptap/extension-placeholder"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import { Underline } from "@tiptap/extension-underline"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { TaskList } from "@tiptap/extension-task-list"
import { TaskItem } from "@tiptap/extension-task-item"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { Highlight } from "@tiptap/extension-highlight"
import { lowlight } from "./lowlight-config"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Highlighter,
  Minus,
} from "lucide-react"
import { useCallback } from "react"
import { cn } from "@/lib/utils"

export interface TipTapEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  editable?: boolean
  onImageUpload?: (file: File) => Promise<string>
}

/**
 * TipTapEditor — a modern, slash-command-capable WYSIWYG editor built on TipTap.
 *
 * Extensions:
 *   - StarterKit (paragraph, heading, bold, italic, code, codeBlock, blockquote,
 *     bulletList, orderedList, listItem, horizontalRule, hardBreak, history)
 *   - Link (autolink, openOnClick)
 *   - Image (inline images, drag-drop)
 *   - Placeholder
 *   - Table + row/cell/header
 *   - Underline
 *   - TextAlign (left, center, right)
 *   - Typography (smart quotes, em-dashes, etc.)
 *   - TaskList + TaskItem (checklists)
 *   - TextStyle + Color
 *   - CodeBlockLowlight (syntax highlighting via lowlight)
 */
export function TipTapEditor({
  content,
  onChange,
  placeholder = "Start writing your story…",
  className,
  editable = true,
  onImageUpload,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // replaced by CodeBlockLowlight below
        heading: { levels: [1, 2, 3, 4] },
        // Disabled here because we register them separately with custom config below
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "tiptap-link",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Image.configure({
        HTMLAttributes: { class: "tiptap-image" },
        inline: false,
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Typography,
      TaskList,
      TaskItem.configure({ nested: true }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content,
    editable,
    immediatelyRender: false, // SSR-safe
    editorProps: {
      attributes: {
        class: "tiptap-content prose prose-invert prose-lg max-w-none focus:outline-none min-h-[550px] lg:min-h-[650px] p-6 sm:p-8 text-[17px] sm:text-[18px] leading-[1.75]",
        spellcheck: "false",
      },
      handlePaste: (_view, event) => {
        const items = Array.from(event.clipboardData?.items || [])
        for (const item of items) {
          if (item.type.indexOf("image") === 0) {
            const file = item.getAsFile()
            if (file && onImageUpload) {
              event.preventDefault()
              onImageUpload(file)
                .then((url) => {
                  if (url && editor) {
                    editor.chain().focus().setImage({ src: url, alt: file.name }).run()
                  }
                })
                .catch((err) => console.error("[tiptap] Paste image failed:", err))
              return true
            }
          }
        }
        return false
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length) {
          const file = event.dataTransfer.files[0]
          if (file && file.type.startsWith("image/") && onImageUpload) {
            event.preventDefault()
            onImageUpload(file)
              .then((url) => {
                if (url && editor) {
                  editor.chain().focus().setImage({ src: url, alt: file.name }).run()
                }
              })
              .catch((err) => console.error("[tiptap] Drop image failed:", err))
            return true
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      onChange(DOMPurify.sanitize(editor.getHTML()))
    },
  })

  const handleImageUpload = useCallback(async () => {
    if (!editor || !onImageUpload) return
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        const url = await onImageUpload(file)
        editor.chain().focus().setImage({ src: url, alt: file.name }).run()
      } catch (err) {
        console.error("[tiptap] image upload failed:", err)
      }
    }
    input.click()
  }, [editor, onImageUpload])

  if (!editor) {
    return (
      <div className={cn("min-h-[400px] rounded-lg glass border border-white/10 p-4", className)}>
        <div className="animate-pulse h-4 bg-white/5 rounded w-1/3 mb-4" />
        <div className="animate-pulse h-4 bg-white/5 rounded w-1/2 mb-2" />
        <div className="animate-pulse h-4 bg-white/5 rounded w-2/3" />
      </div>
    )
  }

  return (
    <div className={cn("rounded-lg glass border border-white/10 overflow-hidden", className)}>
      <Toolbar editor={editor} onImageUpload={handleImageUpload} />
      <EditorContent editor={editor} className="tiptap-editor-body" />
    </div>
  )
}

// ============================================================
// Toolbar
// ============================================================

interface ToolbarProps {
  editor: Editor
  onImageUpload: () => void
}

function Toolbar({ editor, onImageUpload }: ToolbarProps) {
  const btn = (active: boolean, onClick: () => void, icon: React.ReactNode, label: string) => (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "p-2.5 rounded-lg transition-all duration-200 hover:bg-white/10 text-sm font-medium",
        active ? "bg-[#4A90E2]/25 text-[#4A90E2] ring-1 ring-[#4A90E2]/40" : "text-gray-300 hover:text-white",
      )}
    >
      {icon}
    </button>
  )

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("Enter URL:", prev || "https://")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2 border-b border-white/10 bg-[#0B1120]/95 backdrop-blur-xl">
      {/* History */}
      {btn(false, () => editor.chain().focus().undo().run(), <Undo className="w-4 h-4" />, "Undo")}
      {btn(false, () => editor.chain().focus().redo().run(), <Redo className="w-4 h-4" />, "Redo")}
      <Divider />

      {/* Headings */}
      {btn(
        editor.isActive("heading", { level: 1 }),
        () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        <Heading1 className="w-4 h-4" />,
        "Heading 1",
      )}
      {btn(
        editor.isActive("heading", { level: 2 }),
        () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        <Heading2 className="w-4 h-4" />,
        "Heading 2",
      )}
      {btn(
        editor.isActive("heading", { level: 3 }),
        () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        <Heading3 className="w-4 h-4" />,
        "Heading 3",
      )}
      <Divider />

      {/* Inline marks */}
      {btn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), <Bold className="w-4 h-4" />, "Bold")}
      {btn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), <Italic className="w-4 h-4" />, "Italic")}
      {btn(editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), <UnderlineIcon className="w-4 h-4" />, "Underline")}
      {btn(editor.isActive("strike"), () => editor.chain().focus().toggleStrike().run(), <Strikethrough className="w-4 h-4" />, "Strikethrough")}
      {btn(editor.isActive("code"), () => editor.chain().focus().toggleCode().run(), <Code className="w-4 h-4" />, "Inline Code")}
      {btn(editor.isActive("highlight"), () => editor.chain().focus().toggleHighlight().run(), <Highlighter className="w-4 h-4" />, "Highlight")}
      <Divider />

      {/* Lists */}
      {btn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), <List className="w-4 h-4" />, "Bullet List")}
      {btn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered className="w-4 h-4" />, "Ordered List")}
      {btn(editor.isActive("taskList"), () => editor.chain().focus().toggleTaskList().run(), <ListChecks className="w-4 h-4" />, "Task List")}
      <Divider />

      {/* Blocks */}
      {btn(editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), <Quote className="w-4 h-4" />, "Quote")}
      {btn(editor.isActive("codeBlock"), () => editor.chain().focus().toggleCodeBlock().run(), <Code2 className="w-4 h-4" />, "Code Block")}
      {btn(false, () => editor.chain().focus().setHorizontalRule().run(), <Minus className="w-4 h-4" />, "Divider")}
      {btn(false, addTable, <TableIcon className="w-4 h-4" />, "Table")}
      <Divider />

      {/* Alignment */}
      {btn(editor.isActive({ textAlign: "left" }), () => editor.chain().focus().setTextAlign("left").run(), <AlignLeft className="w-4 h-4" />, "Align Left")}
      {btn(editor.isActive({ textAlign: "center" }), () => editor.chain().focus().setTextAlign("center").run(), <AlignCenter className="w-4 h-4" />, "Align Center")}
      {btn(editor.isActive({ textAlign: "right" }), () => editor.chain().focus().setTextAlign("right").run(), <AlignRight className="w-4 h-4" />, "Align Right")}
      <Divider />

      {/* Link + Image */}
      {btn(editor.isActive("link"), setLink, <LinkIcon className="w-4 h-4" />, "Link")}
      {btn(false, onImageUpload, <ImageIcon className="w-4 h-4" />, "Upload Image")}
    </div>
  )
}

function Divider() {
  return <div className="w-px h-6 bg-white/10 mx-1" />
}
