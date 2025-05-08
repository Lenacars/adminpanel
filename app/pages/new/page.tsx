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
      const { data, error } = await supabase.from("Pages").select("id, title").is("parent", null);
      if (!error && data) {
        setParentPages(data);
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
    if (!form.title || !form.slug || !form.content) {
      alert("Lütfen başlık, slug ve içerik alanlarını doldurunuz.");
      return;
    }

    let fullSlug = form.slug;
    if (form.parent) {
      const { data: parentData } = await supabase.from("Pages").select("slug").eq("id", form.parent).single();
      if (parentData) {
        fullSlug = `${parentData.slug}/${form.slug}`;
      }
    }

    const { error } = await supabase.from("Pages").insert([{
      ...form,
      slug: fullSlug,
      published: form.status === "published",
      parent: form.parent || null,
    }]);

    if (!error) {
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
    } else {
      alert("Hata oluştu.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Yeni Sayfa Ekle</h1>

      <div className="space-y-6 bg-white p-8 rounded shadow-md">
        {/* Başlık */}
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

        {/* Slug */}
        <input
          className="border px-3 py-2 w-full rounded"
          placeholder="Slug (örnek: hakkimizda)"
          value={form.slug}
          onChange={(e) => handleChange("slug", e.target.value)}
        />

        {/* TinyMCE Editor */}
        <Editor
          tinymceScriptSrc="/tinymce/tinymce.min.js"
          value={form.content}
          onEditorChange={(value) => handleChange("content", value)}
          init={{
            height: 500,
            menubar: "file edit view insert format tools table help",
            plugins: [
              "advlist", "autolink", "lists", "link", "image", "charmap", "preview", "anchor",
              "searchreplace", "visualblocks", "fullscreen",
              "insertdatetime", "media", "table", "code", "help", "wordcount"
            ],
            toolbar:
              "undo redo | blocks | bold italic underline strikethrough | forecolor backcolor | " +
              "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | " +
              "removeformat | link image media | code fullscreen",
            content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
            skin_url: "/tinymce/skins/ui/oxide",
            content_css: "/tinymce/skins/content/default/content.css",
            branding: false,
          }}
        />

        {/* Canlı Önizleme */}
        <div className="border rounded p-4 bg-gray-50 shadow-inner mb-6">
          <label className="text-xs font-semibold text-gray-600 mb-2 block">Canlı Önizleme</label>
          <div dangerouslySetInnerHTML={{ __html: form.content }} className="prose max-w-none" />
        </div>

        {/* SEO Alanları + Snippet */}
        <div className="bg-gray-100 rounded p-4 space-y-2">
          <h2 className="font-semibold text-gray-800 text-sm">SEO Bilgileri</h2>
          <input
            className="border px-3 py-2 w-full rounded"
            placeholder="SEO Başlık"
            value={form.seo_title}
            onChange={(e) => handleChange("seo_title", e.target.value)}
          />
          <textarea
            className="border px-3 py-2 w-full rounded"
            rows={3}
            placeholder="SEO Açıklama"
            value={form.seo_description}
            onChange={(e) => handleChange("seo_description", e.target.value)}
          />
          {/* Snippet Preview */}
          <div className="bg-black text-green-400 text-sm font-mono px-4 py-2 rounded shadow-inner">
            <div className="text-[#4e9af1]">{`https://lenacars.com/${form.slug || "sayfa-url"}`}</div>
            <div className="text-white font-bold">{form.seo_title || "SEO Başlık"}</div>
            <div className="text-gray-300">{form.seo_description || "SEO açıklama buraya yazılacak..."}</div>
          </div>
        </div>

        {/* Menü ve Üst Sayfa */}
        <select
          className="border px-3 py-2 w-full rounded"
          value={form.menu_group}
          onChange={(e) => handleChange("menu_group", e.target.value)}
        >
          <option value="">Ana Menüde Gösterme</option>
          <option value="kurumsal">Kurumsal</option>
          <option value="kiralama">Kiralama</option>
          <option value="ikinci-el">İkinci El</option>
          <option value="lenacars-bilgilendiriyor">LenaCars Bilgilendiriyor</option>
          <option value="basin-kosesi">Basın Köşesi</option>
          <option value="elektrikli-araclar">Elektrikli Araçlar</option>
        </select>

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

        {/* Görseller */}
        <div className="flex gap-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-1">Banner Görseli</label>
            {form.banner_image && (
              <>
                <img src={form.banner_image} className="h-20 object-cover mb-2 rounded" />
                <button onClick={() => handleChange("banner_image", "")} className="text-xs text-red-600 hover:underline mb-2">Kaldır</button>
              </>
            )}
            <button className="bg-gray-200 text-sm px-3 py-2 rounded" onClick={() => { setImageTarget("banner_image"); setShowMedia(true); }}>Görsel Seç</button>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-semibold mb-1">Thumbnail Görseli</label>
            {form.thumbnail_image && (
              <>
                <img src={form.thumbnail_image} className="h-20 object-cover mb-2 rounded" />
                <button onClick={() => handleChange("thumbnail_image", "")} className="text-xs text-red-600 hover:underline mb-2">Kaldır</button>
              </>
            )}
            <button className="bg-gray-200 text-sm px-3 py-2 rounded" onClick={() => { setImageTarget("thumbnail_image"); setShowMedia(true); }}>Görsel Seç</button>
          </div>
        </div>

        {/* Yayın Durumu */}
        <select
          className="border px-3 py-2 w-full rounded"
          value={form.status}
          onChange={(e) => handleChange("status", e.target.value)}
        >
          <option value="draft">Taslak</option>
          <option value="published">Yayınlandı</option>
        </select>

        {/* Kaydet Butonu */}
        <button className="bg-green-600 hover:bg-green-700 text-white w-full py-3 rounded mt-6" onClick={handleSubmit}>
          Sayfayı Oluştur
        </button>
      </div>

      {showMedia && (
        <MediaLibrary onSelect={handleImageSelect} onClose={() => setShowMedia(false)} />
      )}
    </div>
  );
}
