"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

const Editor = dynamic(() => import("@/components/MyEditor"), { ssr: false });
const MediaLibrary = dynamic(() => import("@/components/MediaLibraryModal"), { ssr: false });

export default function EditBlogPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [showMedia, setShowMedia] = useState(false);

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
    toast({ title: "Başarıyla Güncellendi" });
    router.push("/blogs");
  };

  if (!form) return <p className="p-4">Yükleniyor...</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">✏️ Blog Düzenle</CardTitle>
          <p className="text-sm text-muted-foreground">Blog içeriğini aşağıdaki alanlardan güncelleyebilirsiniz.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Başlık</Label>
            <Input name="title" value={form.title} onChange={handleChange} />
          </div>

          <div>
            <Label>Slug</Label>
            <Input name="slug" value={form.slug} onChange={handleChange} />
          </div>

          <div>
            <Label>SEO Başlık</Label>
            <Input name="seo_title" value={form.seo_title} onChange={handleChange} />
          </div>

          <div>
            <Label>SEO Açıklama</Label>
            <Input name="seo_description" value={form.seo_description} onChange={handleChange} />
          </div>

          <div>
            <Label>İçerik</Label>
            <Editor
              initialValue={form.content}
              onEditorChange={(val) => setForm((prev: any) => ({ ...prev, content: val }))}
            />
          </div>

          <div>
            <Label>Kapak Görseli</Label>
            <Button variant="outline" onClick={() => setShowMedia(true)}>
              Ortam Kütüphanesinden Seç
            </Button>
            {form.thumbnail_image && (
              <img src={form.thumbnail_image} alt="Kapak" className="rounded shadow-md mt-2 w-full max-w-sm" />
            )}
            {showMedia && (
              <MediaLibrary
                onSelect={(url) => {
                  setForm((prev: any) => ({ ...prev, thumbnail_image: url }));
                  setShowMedia(false);
                }}
                onClose={() => setShowMedia(false)} // ✅ EKLENDİ
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
          <Button onClick={handleSubmit} className="px-6 py-2 text-base">💾 Güncelle</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
