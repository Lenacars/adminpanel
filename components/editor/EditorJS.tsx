"use client";

import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";

interface EditorJSRendererProps {
  data?: any;
  onChange?: (data: any) => void;
}

export default function EditorJSRenderer({ data, onChange }: EditorJSRendererProps) {
  const ref = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!ref.current) {
      const editor = new EditorJS({
        holder: "editorjs",
        data: data || undefined,
        onChange: async () => {
          const savedData = await editor.save();
          onChange?.(savedData);
        },
        tools: {
          header: Header,
          list: List,
          paragraph: Paragraph,
        },
      });
      ref.current = editor;
    }

    return () => {
      ref.current?.destroy();
      ref.current = null;
    };
  }, []);

  return <div id="editorjs" className="bg-white border rounded p-4 min-h-[300px]"></div>;
}
