'use client';

import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { filterSuggestionItems } from '@blocknote/core';
import {
  getDefaultReactSlashMenuItems,
  SuggestionMenuController,
} from '@blocknote/react';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';

// Custom slash menu items for advanced blocks
function createWebBookmarkItem(editor) {
  return {
    title: 'Web Bookmark',
    subtext: 'Embed a link with preview',
    group: 'Advanced blocks',
    icon: <IconWrapper d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />,
    onItemClick: () => {
      const url = prompt('Enter URL:');
      if (url) {
        editor.insertBlocks(
          [{ type: 'paragraph', content: [{ type: 'link', href: url, content: url }] }],
          editor.getTextCursorPosition().block,
          'after'
        );
      }
    },
  };
}

function createCodeBlockItem(editor) {
  return {
    title: 'Code',
    subtext: 'Insert a code block',
    group: 'Advanced blocks',
    icon: <IconWrapper d="M16 18l6-6-6-6M8 6l-6 6 6 6" />,
    onItemClick: () => {
      editor.insertBlocks(
        [{ type: 'codeBlock' }],
        editor.getTextCursorPosition().block,
        'after'
      );
    },
  };
}

function createFileItem(editor, title, subtext, accept, iconD) {
  return {
    title,
    subtext,
    group: 'Advanced blocks',
    icon: <IconWrapper d={iconD} />,
    onItemClick: () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Insert as a paragraph with filename for now
        // TODO: upload to R2 and embed
        editor.insertBlocks(
          [{ type: 'paragraph', content: `📎 ${file.name}` }],
          editor.getTextCursorPosition().block,
          'after'
        );
      };
      input.click();
    },
  };
}

function IconWrapper({ d }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const FILE_ICON = 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6';

function getCustomSlashMenuItems(editor) {
  // Get defaults and filter out video + audio
  const defaults = getDefaultReactSlashMenuItems(editor).filter(
    (item) => {
      const t = item.title.toLowerCase();
      return t !== 'video' && t !== 'audio';
    }
  );

  const custom = [
    createWebBookmarkItem(editor),
    createCodeBlockItem(editor),
    createFileItem(editor, 'CSV', 'Upload a CSV file', '.csv', FILE_ICON),
    createFileItem(editor, 'PDF', 'Upload a PDF document', '.pdf', FILE_ICON),
    createFileItem(editor, 'Markdown', 'Upload a Markdown file', '.md,.mdx', FILE_ICON),
    createFileItem(editor, 'HTML', 'Upload an HTML file', '.html,.htm', FILE_ICON),
  ];

  return [...defaults, ...custom];
}

const BlogEditor = forwardRef(function BlogEditor({ onChange, initialContent }, ref) {
  const editor = useCreateBlockNote({
    initialContent: initialContent || undefined,
    domAttributes: {
      editor: {
        class: 'blog-editor',
      },
    },
  });

  useImperativeHandle(ref, () => ({
    getDocument: () => editor.document,
    getEditor: () => editor,
    getHTML: async () => {
      const html = await editor.blocksToHTMLLossy(editor.document);
      return html;
    },
    getMarkdown: async () => {
      const md = await editor.blocksToMarkdownLossy(editor.document);
      return md;
    },
  }), [editor]);

  const handleChange = useCallback(() => {
    if (onChange) {
      onChange(editor.document);
    }
  }, [onChange, editor]);

  const slashMenuItems = useMemo(
    () => (query) => filterSuggestionItems(getCustomSlashMenuItems(editor), query),
    [editor]
  );

  return (
    <div className="blog-editor-wrapper">
      <BlockNoteView
        editor={editor}
        onChange={handleChange}
        theme="dark"
        slashMenu={false}
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={slashMenuItems}
        />
      </BlockNoteView>
    </div>
  );
});

export default BlogEditor;
