import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

interface Params {
  id: string;
}

// ✅ Belirli bir sayfayı getir
export async function GET(req: Request, { params }: { params: Params }) {
  const { id } = params;

  const { data, error } = await supabase
    .from("Pages")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("GET Page Hatası:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ✅ Sayfayı güncelle
export async function PUT(req: Request, { params }: { params: Params }) {
  const { id } = params;
  const body = await req.json();

  const {
    title,
    slug,
    html_content, // ✅ mdx_content yerine html_content kullanılacak
    status,
    seo_title,
    seo_description,
    banner_image,
    thumbnail_image,
    menu_group,
    parent,
    published,
  } = body;

  const { data, error } = await supabase
    .from("Pages")
    .update({
      title,
      slug,
      html_content: html_content || null,
      status,
      seo_title,
      seo_description,
      banner_image,
      thumbnail_image,
      menu_group,
      parent: parent || null,
      published: published ?? false,
    })
    .eq("id", id);

  if (error) {
    console.error("PUT Page Hatası:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ✅ Sayfayı sil
export async function DELETE(req: Request, { params }: { params: Params }) {
  const { id } = params;

  const { error } = await supabase
    .from("Pages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("DELETE Page Hatası:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
