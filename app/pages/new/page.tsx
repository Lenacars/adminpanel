"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const MediaLibrary = dynamic(() => import("@/components/MediaLibrary"), { ssr: false });

export default function NewPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    html_content: "<h1>Yeni Sayfa</h1><p>Buraya HTML içerik ekleyin.</p>",
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
    fetchParentPages();
  }, []);

  const fetchParentPages = async () => {
    const res = await fetch("/api/pages");
    const allPages = await res.json();
    if (Array.isArray(allPages)) {
      setParentPages(allPages);
    }
  };

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "title" && !prev.slug) {
        updated.slug = value.toLowerCase().replace(/\s+/g, "-");
      }
      return updated;
    });
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

  const handleCreate = async () => {
    const newPage = {
      ...form,
      published: form.status === "published",
      parent: form.parent || null,
    };

    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPage),
    });

    if (res.ok) {
      alert("Sayfa başarıyla oluşturuldu!");
      router.push("/pages");
    } else {
      alert("Hata oluştu.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Yeni Sayfa Oluştur</h1>

      <div className="space-y-6 bg-white p-8 rounded shadow-md">
        <input className="border px-3 py-2 w-full rounded" placeholder="Başlık" value={form.title} onChange={(e) => handleChange("title", e.target.value)} />
        <input className="border px-3 py-2 w-full rounded" placeholder="Slug" value={form.slug} onChange={(e) => handleChange("slug", e.target.value)} />

        {/* HTML İçerik */}
        <textarea
          className="border px-3 py-2 w-full rounded min-h-[300px] font-mono text-sm"
          placeholder="<p>HTML içeriğiniz</p>"
          value={form.html_content}
          onChange={(e) => handleChange("html_content", e.target.value)}
        />

        <div className="border rounded p-4 bg-gray-50 shadow-inner mb-6">
          <label className="text-xs font-semibold text-gray-600 mb-2 block">Canlı Önizleme</label>
          <div dangerouslySetInnerHTML={{ __html: form.html_content }} className="prose max-w-none" />
        </div>

        <h2 className="text-lg font-semibold">SEO Bilgileri</h2>
        <input className="border px-3 py-2 w-full rounded mt-2" placeholder="SEO Başlık" value={form.seo_title} onChange={(e) => handleChange("seo_title", e.target.value)} />
        <textarea className="border px-3 py-2 w-full rounded mt-2" rows={3} placeholder="SEO Açıklama" value={form.seo_description} onChange={(e) => handleChange("seo_description", e.target.value)} />

        <div className="bg-[#111] text-white p-6 rounded shadow-inner mt-4 space-y-2 text-sm font-sans">
          <p className="text-green-400">https://lenacars.com/{form.slug}</p>
          <p className="text-blue-400 text-lg">{form.seo_title || "LenaCars | Araç Kiralama"}</p>
          <p className="text-gray-300">{form.seo_description || "Araç kiralama avantajlarını öğrenin."}</p>
        </div>

        <select className="border px-3 py-2 w-full rounded mt-6" value={form.menu_group} onChange={(e) => handleChange("menu_group", e.target.value)}>
          <option value="">Ana Menüde Gösterme</option>
          <option value="kurumsal">Kurumsal</option>
          <option value="kiralama">Kiralama</option>
          <option value="ikinci-el">İkinci El</option>
          <option value="lenacars-bilgilendiriyor">LenaCars Bilgilendiriyor</option>
          <option value="basin-kosesi">Basın Köşesi</option>
          <option value="elektrikli-araclar">Elektrikli Araçlar</option>
        </select>

        <select className="border px-3 py-2 w-full rounded" value={form.parent} onChange={(e) => handleChange("parent", e.target.value)}>
          <option value="">Üst Sayfa Seç (İsteğe Bağlı)</option>
          {parentPages.map((page) => (
            <option key={page.id} value={page.id}>{page.title}</option>
          ))}
        </select>

        {/* Görseller */}
        <div className="flex gap-6">
          <div className="flex-1">
            <label className="block text-sm mb-1 font-semibold">Banner Görseli</label>
            {form.banner_image && <img src={form.banner_image} className="h-20 object-cover mb-2 rounded" />}
            <button className="bg-gray-200 text-sm px-3 py-2 rounded" onClick={() => { setImageTarget("banner_image"); setShowMedia(true); }}>Görsel Seç</button>
          </div>

          <div className="flex-1">
            <label className="block text-sm mb-1 font-semibold">Thumbnail Görseli</label>
            {form.thumbnail_image && <img src={form.thumbnail_image} className="h-20 object-cover mb-2 rounded" />}
            <button className="bg-gray-200 text-sm px-3 py-2 rounded" onClick={() => { setImageTarget("thumbnail_image"); setShowMedia(true); }}>Görsel Seç</button>
          </div>
        </div>

        <select className="border px-3 py-2 w-full rounded" value={form.status} onChange={(e) => handleChange("status", e.target.value)}>
          <option value="draft">Taslak</option>
          <option value="published">Yayınlandı</option>
        </select>

        <button className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded mt-8" onClick={handleCreate}>Sayfayı Oluştur</button>
      </div>

      {showMedia && (
        <MediaLibrary onSelect={handleImageSelect} onClose={() => setShowMedia(false)} />
      )}
    </div>
  );
}
