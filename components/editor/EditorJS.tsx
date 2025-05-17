"use client";

import React, { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Paragraph from "@editorjs/paragraph";
import Checklist from "@editorjs/checklist";
import Raw from "@editorjs/raw"; // 👈 Yeni eklendi

interface EditorProps {
  data: any;
  onChange: (data: any) => void;
}

export default function Editor({ data, onChange }: EditorProps) {
  const ref = useRef<EditorJS>();

  useEffect(() => {
    if (!ref.current) {
      const editor = new EditorJS({
        holder: "editorjs",
        data,
        tools: {
          header: Header,
          list: List,
          paragraph: Paragraph,
          checklist: Checklist,
          raw: Raw, // 👈 Burada da tanımlandı
        },
        onChange: async () => {
          const output = await editor.save();
          onChange(output);
        },
      });

      ref.current = editor;
    }

    return () => {
      ref.current?.destroy();
      ref.current = undefined;
    };
  }, []);

  return <div id="editorjs" className="bg-white p-4 border rounded min-h-[300px]" />;
}
