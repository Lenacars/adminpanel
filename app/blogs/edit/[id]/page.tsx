"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const Editor = dynamic(() => import("@/components/MyEditor"), { ssr: false });
const MediaLibrary = dynamic(() => import("@/components/MediaLibraryModal"), { ssr: false });

export default function EditBlogPage() {
  const [form, setForm] = useState<any>(null);
  const [showMedia, setShowMedia] = useState(false);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("bloglar").select("*").eq("id", id).single();
      setForm(data);
    };
    fetch();
  }, [id]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    const { error } = await supabase.from("bloglar").update(form).eq("id", id);
    if (error) return toast({ title: "Hata", description: error.message });
    toast({ title: "Güncellendi" });
    router.push("/blogs");
  };

  if (!form) return <p>Yükleniyor...</p>;

  return (
    <div className="p-4 space-y-4 max-w-3xl">
      <h1 className="text-2xl font-bold">Blog Düzenle</h1>

      <Label>Başlık</Label>
      <Input name="title" value={form.title} onChange={handleChange} />

      <Label>Slug</Label>
      <Input name="slug" value={form.slug} onChange={handleChange} />

      <Label>SEO Başlık</Label>
      <Input name="seo_title" value={form.seo_title} onChange={handleChange} />

      <Label>SEO Açıklama</Label>
      <Input name="seo_description" value={form.seo_description} onChange={handleChange} />

      <Label>İçerik</Label>
      <Editor
        initialValue={form.content}
        onEditorChange={(val) => setForm((prev: any) => ({ ...prev, content: val }))}
      />

      <Label>Kapak Görseli</Label>
      <Button variant="outline" onClick={() => setShowMedia(true)}>
        Ortam Kütüphanesinden Seç
      </Button>
      {form.thumbnail_image && <img src={form.thumbnail_image} className="w-64 mt-2 rounded" />}
      {showMedia && (
        <MediaLibrary
          onSelect={(url) => {
            setForm((prev: any) => ({ ...prev, thumbnail_image: url }));
            setShowMedia(false);
          }}
        />
      )}

      <div className="flex items-center gap-2 mt-2">
        <input type="checkbox" name="published" checked={form.published} onChange={handleChange} />
        <Label htmlFor="published">Yayında mı?</Label>
      </div>

      <Button className="mt-4" onClick={handleSubmit}>Güncelle</Button>
    </div>
  );
}
