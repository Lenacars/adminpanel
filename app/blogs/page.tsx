"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    const { data } = await supabase
      .from("bloglar")
      .select("*")
      .order("created_at", { ascending: false });
    setBlogs(data || []);
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Bloglar</CardTitle>
          <Link href="/blogs/new">
            <Button>+ Yeni Blog</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Yayın</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell>{blog.title}</TableCell>
                  <TableCell>{blog.slug}</TableCell>
                  <TableCell>{blog.published ? "✅" : "❌"}</TableCell>
                  <TableCell>{new Date(blog.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Link href={`/blogs/edit/${blog.id}`}>
                      <Button variant="outline" size="sm">Düzenle</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
