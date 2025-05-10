"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

const Editor = dynamic(() => import("@/components/MyEditor"), { ssr: false });
const MediaLibrary = dynamic(() => import("@/components/MediaLibraryModal"), { ssr: false });

export default function NewBlogPage() {
  const router = useRouter();
  const [showMedia, setShowMedia] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    seo_title: "",
    seo_description: "",
    thumbnail_image: "",
    published: false,
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.slug) {
      toast({ title: "Eksik Bilgi", description: "Başlık ve slug alanı zorunludur." });
      return;
    }

    const { error } = await supabase.from("bloglar").insert([form]);
    if (error) return toast({ title: "Hata", description: error.message });
    toast({ title: "Başarılı", description: "Blog başarıyla eklendi." });
    router.push("/blogs");
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">📝 Yeni Blog Ekle</CardTitle>
          <p className="text-sm text-muted-foreground">Blog yazınızı aşağıdaki alanları doldurarak oluşturabilirsiniz.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Başlık <span className="text-red-500">*</span></Label>
            <Input
              name="title"
              placeholder="Örn: 2025’te Elektrikli Araç Trendleri"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Slug <span className="text-red-500">*</span></Label>
            <Input
              name="slug"
              placeholder="elektrikli-arac-trendleri-2025"
              value={form.slug}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>SEO Başlık</Label>
            <Input
              name="seo_title"
              placeholder="Google’da görünecek başlık"
              value={form.seo_title}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>SEO Açıklama</Label>
            <Input
              name="seo_description"
              placeholder="Google arama açıklaması"
              value={form.seo_description}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>İçerik</Label>
            <Editor
              initialValue={form.content}
              onEditorChange={(val) => setForm((prev) => ({ ...prev, content: val }))}
            />
          </div>

          <div>
            <Label>Kapak Görseli</Label>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => setShowMedia(true)}>Ortam Kütüphanesinden Seç</Button>
              {form.thumbnail_image && (
                <img src={form.thumbnail_image} alt="Kapak" className="rounded shadow-md w-full max-w-sm" />
              )}
            </div>
            {showMedia && (
              <MediaLibrary
                onSelect={(url) => {
                  setForm((prev) => ({ ...prev, thumbnail_image: url }));
                  setShowMedia(false);
                }}
              />
            )}
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              name="published"
              checked={form.published}
              onChange={handleChange}
              id="published"
            />
            <Label htmlFor="published">Yayında mı?</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSubmit} className="px-6 py-2 text-base">💾 Kaydet</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
