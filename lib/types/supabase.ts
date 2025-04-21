// lib/types/supabase.ts

export type Database = {
  public: {
    Tables: {
      Araclar: {
        Row: {
          id: string;
          isim: string;
          aciklama: string;
          segment: string;
          yakit_tipi: string;
          created_at: string;
          updated_at: string;
          stok_kodu: string;
          yakit_turu: string;
          vites: string;
          durum: string;
          bodyType: string;
          brand: string;
          category: string;
          cover_image: string;
          gallery_images: string[];
          fiyat: number;
          yakit: string;
        };
      };
      variations: {
        Row: {
          id: string;
          arac_id: string;
          kilometre: string | null;
          sure: string | null;
          fiyat: number | null;
          status: string | null;
          product_id: string | null;
        };
      };
    };
  };
};
