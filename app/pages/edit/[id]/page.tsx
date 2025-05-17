"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const MediaLibrary = dynamic(() => import("@/components/MediaLibrary"), { ssr: false });
const EditorJS = dynamic(() => import("@/components/editor/EditorJS"), { ssr: false });

export default function EditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: null,
    mdx_content: "", // 👈 EKLENDİ
    seo_title: "",
    seo_description: "",
    banner_image: "",
    thumbnail_image: "",
    menu_group: "",
    status: "draft",
    parent: "",
  });

  const [parentPages, setParentPages] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMedia, setShowMedia] = useState(false);
  const [imageTarget, setImageTarget] = useState<"banner_image" | "thumbnail_image" | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchPage();
    fetchParentPages();
  }, [id]);

  const fetchPage = async () => {
    const res = await fetch(`/api/pages/${id}`);
    const data = await res.json();

    if (res.ok) {
      setForm({
        title: data.title || "",
        slug: data.slug || "",
        content: data.content || null,
        mdx_content: data.mdx_content || "", // 👈 EKLENDİ
        seo_title: data.seo_title || "",
        seo_description: data.seo_description || "",
        banner_image: data.banner_image || "",
        thumbnail_image: data.thumbnail_image || "",
        menu_group: data.menu_group || "",
        status: data.status || "draft",
        parent: data.parent || "",
      });
    } else {
      alert("Sayfa verisi alınamadı.");
    }
    setLoading(false);
  };

  const fetchParentPages = async () => {
    const res = await fetch("/api/pages");
    const allPages = await res.json();
    if (Array.isArray(allPages)) {
      const filtered = allPages.filter((p) => !p.parent || p.id !== id);
      setParentPages(filtered);
    }
  };

  const handleChange = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageSelect = (filename: string) => {
    if (imageTarget) {
      handleChange(
        imageTarget,
        `https://uxnpmdeizkzvnevpceiw.supabase.co/storage/v1/object/public/images/${filename}`
      );
    }
    setShowMedia(false);
  };

  const handleUpdate = async () => {
    const updatedData = {
      ...form,
      published: form.status === "published",
      parent: form.parent ? form.parent : null,
    };

    const res = await fetch(`/api/pages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    if (res.ok) {
      alert("Sayfa başarıyla güncellendi!");
      router.push("/pages");
    } else {
      alert("Hata oluştu.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu sayfayı silmek istediğinize emin misiniz?")) return;

    const res = await fetch(`/api/pages/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("Sayfa başarıyla silindi!");
      router.push("/pages");
    } else {
      alert("Sayfa silinirken hata oluştu.");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Sayfa Düzenle</h1>

      <div className="space-y-6 bg-white p-8 rounded shadow-md">
        <input
          className="border px-3 py-2 w-full rounded"
          placeholder="Başlık"
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />

        <input
          className="border px-3 py-2 w-full rounded"
          placeholder="Slug"
          value={form.slug}
          onChange={(e) => handleChange("slug", e.target.value)}
        />

        {/* Editor.js */}
        <EditorJS data={form.content} onChange={(value) => handleChange("content", value)} />

        {/* MDX İçeriği Alanı */}
        <div>
          <label className="text-sm font-semibold">MDX İçeriği</label>
          <textarea
            className="border px-3 py-2 w-full rounded mt-2 font-mono text-sm"
            rows={16}
            placeholder="MDX içeriği buraya yazın..."
            value={form.mdx_content || ""}
            onChange={(e) => handleChange("mdx_content", e.target.value)}
          />
        </div>

        {/* SEO Bilgileri */}
        <div>
          <h2 className="text-lg font-semibold">SEO Bilgileri</h2>
          <input
            className="border px-3 py-2 w-full rounded mt-2"
            placeholder="SEO Başlık"
            value={form.seo_title}
            onChange={(e) => handleChange("seo_title", e.target.value)}
          />
          <textarea
            className="border px-3 py-2 w-full rounded mt-2"
            rows={3}
            placeholder="SEO Açıklama"
            value={form.seo_description}
            onChange={(e) => handleChange("seo_description", e.target.value)}
          />
        </div>

        {/* SEO Snippet */}
        <div className="bg-[#111] text-white p-6 rounded shadow-inner mt-4 space-y-2 text-sm font-sans">
          <p className="text-green-400">https://lenacars.com/{form.slug}</p>
          <p className="text-blue-400 text-lg">{form.seo_title || "LenaCars | Araç Kiralama"}</p>
          <p className="text-gray-300">{form.seo_description || "Araç kiralama avantajlarını öğrenin."}</p>
        </div>

        {/* Diğer alanlar */}
        <select
          className="border px-3 py-2 w-full rounded mt-6"
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

        <div className="flex gap-6">
          <div className="flex-1">
            <label className="block text-sm mb-1 font-semibold">Banner Görseli</label>
            {form.banner_image && (
              <img src={form.banner_image} className="h-20 object-cover mb-2 rounded" />
            )}
            <button
              className="bg-gray-200 text-sm px-3 py-2 rounded"
              onClick={() => {
                setImageTarget("banner_image");
                setShowMedia(true);
              }}
            >
              Görsel Seç
            </button>
          </div>

          <div className="flex-1">
            <label className="block text-sm mb-1 font-semibold">Thumbnail Görseli</label>
            {form.thumbnail_image && (
              <img src={form.thumbnail_image} className="h-20 object-cover mb-2 rounded" />
            )}
            <button
              className="bg-gray-200 text-sm px-3 py-2 rounded"
              onClick={() => {
                setImageTarget("thumbnail_image");
                setShowMedia(true);
              }}
            >
              Görsel Seç
            </button>
          </div>
        </div>

        <select
          className="border px-3 py-2 w-full rounded"
          value={form.status}
          onChange={(e) => handleChange("status", e.target.value)}
        >
          <option value="draft">Taslak</option>
          <option value="published">Yayınlandı</option>
        </select>

        <div className="flex gap-4 mt-8">
          <button
            className="bg-green-600 hover:bg-green-700 text-white w-full py-3 rounded"
            onClick={handleUpdate}
          >
            Sayfayı Güncelle
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white w-full py-3 rounded"
            onClick={handleDelete}
          >
            Sayfayı Sil
          </button>
        </div>
      </div>

      {showMedia && (
        <MediaLibrary
          onSelect={handleImageSelect}
          onClose={() => setShowMedia(false)}
        />
      )}
    </div>
  );
}
