import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const payload = {
      title: body.title,
      slug: body.slug,
      html_content: body.mdx_content || null, // 👈 mdx_content → html_content olarak kaydet
      seo_title: body.seo_title || null,
      seo_description: body.seo_description || null,
      banner_image: body.banner_image || null,
      thumbnail_image: body.thumbnail_image || null,
      menu_group: body.menu_group || null,
      status: body.status || "draft",
      parent: body.parent || null,
      published: body.published ?? false,
    };

    console.log("Supabase'e gönderilecek veri:", payload);

    const { data, error } = await supabase.from("Pages").insert([payload]);

    if (error) {
      console.error("POST Pages Hatası:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("POST Pages Genel Hata:", error);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("Pages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET Pages Hatası:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET Pages Genel Hata:", error);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}
