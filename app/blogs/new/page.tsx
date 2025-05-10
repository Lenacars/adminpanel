"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });
const MediaLibrary = dynamic(() => import("@/components/MediaLibraryModal"), { ssr: false });

export default function NewBlogPage() {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    seo_title: "",
    seo_description: "",
    thumbnail_image: "",
    published: false,
  });

  const router = useRouter();

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    const { error } = await supabase.from("bloglar").insert([form]);
    if (error) return toast({ title: "Hata", description: error.message });
    toast({ title: "Başarılı", description: "Blog eklendi." });
    router.push("/blogs");
  };

  return (
    <div className="p-4 space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Yeni Blog Ekle</h1>

      <Label>Başlık</Label>
      <Input name="title" value={form.title} onChange={handleChange} />

      <Label>Slug</Label>
      <Input name="slug" value={form.slug} onChange={handleChange} placeholder="seo-uyumlu-baslik" />

      <Label>SEO Başlık</Label>
      <Input name="seo_title" value={form.seo_title} onChange={handleChange} />

      <Label>SEO Açıklama</Label>
      <Input name="seo_description" value={form.seo_description} onChange={handleChange} />

      <Label>İçerik</Label>
      <Editor value={form.content} onChange={(val) => setForm((prev) => ({ ...prev, content: val }))} />

      <Label>Kapak Görseli</Label>
      <MediaLibrary onSelect={(url) => setForm((prev) => ({ ...prev, thumbnail_image: url }))} />
      {form.thumbnail_image && <img src={form.thumbnail_image} className="w-64 mt-2 rounded" />}

      <div className="flex items-center gap-2 mt-2">
        <input type="checkbox" name="published" checked={form.published} onChange={handleChange} />
        <Label htmlFor="published">Yayında mı?</Label>
      </div>

      <Button className="mt-4" onClick={handleSubmit}>Kaydet</Button>
    </div>
  );
}
