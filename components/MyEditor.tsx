// components/MyEditor.tsx
"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

import "tinymce/tinymce";
import "tinymce/icons/default";
import "tinymce/themes/silver";
import "tinymce/models/dom";
import "tinymce/plugins/advlist";
import "tinymce/plugins/autolink";
import "tinymce/plugins/lists";
import "tinymce/plugins/link";
import "tinymce/plugins/image";
import "tinymce/plugins/charmap";
import "tinymce/plugins/preview";
import "tinymce/plugins/anchor";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/code";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/media";
import "tinymce/plugins/table";
// import "tinymce/plugins/paste";
import "tinymce/plugins/help";
import "tinymce/plugins/wordcount";

interface Props {
  initialValue?: string;
  onEditorChange: (content: string) => void;
}

export default function MyEditor({ initialValue = "", onEditorChange }: Props) {
  return (
    <Editor
      /** buraya ekledik: local dist dosyanızın yolu */
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      /** apiKey’i tamamen kaldırdık */
      init={{
        base_url: "/tinymce",
        suffix: ".min",
        skin_url: "/tinymce/skins/ui/oxide",
        content_css: "/tinymce/skins/content/default/content.css",
        height: 400,
        menubar: false,
        plugins: [
          "advlist","autolink","lists","link","image","charmap","preview","anchor",
          "searchreplace","visualblocks","code","fullscreen","insertdatetime",
          "media","table","help","wordcount",
        ],
        toolbar:
          "undo redo | formatselect | bold italic backcolor | " +
          "alignleft aligncenter alignright alignjustify | " +
          "bullist numlist outdent indent | removeformat | code help",
        branding: false,
        promotion: false,
      }}
      initialValue={initialValue}
      onEditorChange={onEditorChange}
    />
  );
}
