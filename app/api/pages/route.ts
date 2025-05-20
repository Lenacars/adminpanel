import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const body = await req.json();

    const payload = {
      title: body.title,
      slug: body.slug,
      html_content: body.html_content || null,
      seo_title: body.seo_title || null,
      seo_description: body.seo_description || null,
      banner_image: body.banner_image || null,
      thumbnail_image: body.thumbnail_image || null,
      menu_group: body.menu_group || null,
      status: body.status || "draft",
      parent: body.parent || null,
      published: body.published ?? false,
      external_url: body.external_url || null, // ✅ eklendi
    };

    const { data, error } = await supabase
      .from("Pages")
      .update(payload)
      .eq("id", id)
      .select();

    if (error) {
      console.error("PUT Pages Hatası:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("PUT Pages Genel Hata:", error);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const { data, error } = await supabase.from("Pages").select("*").eq("id", id).single();

    if (error) {
      console.error("GET Page Hatası:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET Page Genel Hata:", error);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const { error } = await supabase.from("Pages").delete().eq("id", id);

    if (error) {
      console.error("DELETE Page Hatası:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Page Genel Hata:", error);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}
