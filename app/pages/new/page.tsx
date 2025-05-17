"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { Editor } from "@tinymce/tinymce-react";

const MediaLibrary = dynamic(() => import("@/components/MediaLibraryModal"), { ssr: false });

export default function AddPage() {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    seo_title: "",
    seo_description: "",
    banner_image: "",
    thumbnail_image: "",
    menu_group: "",
    status: "draft",
    parent: "",
  });

  const [parentPages, setParentPages] = useState<{ id: string; title: string }[]>([]);
  const [showMedia, setShowMedia] = useState(false);
  const [imageTarget, setImageTarget] = useState<"banner_image" | "thumbnail_image" | null>(null);

  useEffect(() => {
    const fetchParentPages = async () => {
      const { data, error } = await supabase.from("Pages").select("id, title");
      if (error) {
        console.error("❌ Üst sayfalar alınırken hata:", error);
      } else {
        console.log("✅ Üst sayfa verisi:", data);
        setParentPages(data || []);
      }
    };
    fetchParentPages();
  }, []);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ü/g, "u")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleImageSelect = (filename: string) => {
    if (imageTarget) {
      const fullUrl = `https://uxnpmdeizkzvnevpceiw.supabase.co/storage/v1/object/public/images/${filename}`;
      handleChange(imageTarget, fullUrl);

      if (imageTarget === "banner_image" && fullUrl) {
        const imgTag = `<img src="${fullUrl}" alt="banner" class="mb-4 rounded" />`;
        if (!form.content.includes(fullUrl)) {
          handleChange("content", imgTag + "\n" + form.content);
        }
      }
    }
    setShowMedia(false);
  };

  const handleSubmit = async () => {
    console.log("📤 Form verisi:", form);

    if (!form.title || !form.slug || !form.content) {
      alert("Lütfen başlık, slug ve içerik alanlarını doldurunuz.");
      return;
    }

    let fullSlug = form.slug;

    if (form.parent) {
      console.log("🔎 Seçilen üst sayfa ID:", form.parent);

      const { data: parentData, error: parentError } = await supabase
        .from("Pages")
        .select("slug")
        .eq("id", form.parent)
        .single();

      if (parentError) {
        console.error("❌ Üst sayfa slug alınırken hata:", parentError.message);
      } else if (parentData) {
        console.log("📦 Gelen üst sayfa slug:", parentData.slug);
        fullSlug = `${parentData.slug}/${form.slug}`;
      } else {
        console.warn("⚠️ parentData boş geldi.");
      }
    }

    console.log("📦 Final slug değeri:", fullSlug);

    const payload = {
      ...form,
      slug: fullSlug,
      published: form.status === "published",
      parent: form.parent || null,
    };

    console.log("📡 Supabase insert verisi:", payload);

    const { error } = await supabase.from("Pages").insert([payload]);

    if (error) {
      console.error("❌ Supabase insert hatası:", error.message);
      alert("Hata oluştu.");
    } else {
      console.log("✅ Sayfa başarıyla eklendi!");
      alert("Sayfa başarıyla eklendi!");

      setForm({
        title: "",
        slug: "",
        content: "",
        seo_title: "",
        seo_description: "",
        banner_image: "",
        thumbnail_image: "",
        menu_group: "",
        status: "draft",
        parent: "",
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Yeni Sayfa Ekle</h1>

      <div className="space-y-6 bg-white p-8 rounded shadow-md">
        <input
          className="border px-3 py-2 w-full rounded"
          placeholder="Başlık"
          value={form.title}
          onChange={(e) => {
            const title = e.target.value;
            handleChange("title", title);
            if (!form.slug) {
              handleChange("slug", generateSlug(title));
            }
          }}
        />

        <input
          className="border px-3 py-2 w-full rounded"
          placeholder="Slug (örnek: hakkimizda1)"
          value={form.slug}
          onChange={(e) => handleChange("slug", e.target.value)}
        />

        <Editor
          tinymceScriptSrc="/tinymce/tinymce.min.js"
          value={form.content}
          onEditorChange={(value) => handleChange("content", value)}
          init={{
            height: 500,
            menubar: false,
            plugins: ["link", "image", "code", "media", "fullscreen"],
            toolbar: "undo redo | bold italic underline | link image media | code fullscreen",
            content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
          }}
        />

        <select
          className="border px-3 py-2 w-full rounded"
          value={form.parent}
          onChange={(e) => handleChange("parent", e.target.value)}
        >
          <option value="">Üst Sayfa Seç (İsteğe Bağlı)</option>
          {parentPages.map((page) => (
            <option key={page.id} value={page.id}>{page.title}</option>
          ))}
        </select>

        <select
          className="border px-3 py-2 w-full rounded"
          value={form.status}
          onChange={(e) => handleChange("status", e.target.value)}
        >
          <option value="draft">Taslak</option>
          <option value="published">Yayınlandı</option>
        </select>

        <button
          className="bg-green-600 hover:bg-green-700 text-white w-full py-3 rounded mt-6"
          onClick={handleSubmit}
        >
          Sayfayı Oluştur
        </button>
      </div>

      {showMedia && (
        <MediaLibrary onSelect={handleImageSelect} onClose={() => setShowMedia(false)} />
      )}
    </div>
  );
}
