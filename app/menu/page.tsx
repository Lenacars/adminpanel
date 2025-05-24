"use client";

import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

// shadcn/ui Bileşenleri
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// lucide-react İkonları
import { GripVertical, Edit, Trash2, PlusCircle, X, Loader2, ListTree, Inbox, Save } from "lucide-react";

// dnd-kit
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function normalizeGroup(str: string) {
  return str
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

interface PageItem {
  id: string;
  title: string;
  menu_group: string | null;
  parent: string | null;
  sort_order: number | null;
  group_sort_order: number | null;
}

interface GroupBoxProps {
  group: string;
  items: PageItem[];
  onEdit: () => void;
  onSave: (newValue: string) => void;
  onDelete: () => void;
  isEditing: boolean;
  editingValue: string;
  setEditingValue: (value: string) => void;
  fetchPages: () => Promise<void>;
}

function GroupBox({
  group,
  items,
  onEdit,
  onSave,
  onDelete,
  isEditing,
  editingValue,
  setEditingValue,
  fetchPages,
}: GroupBoxProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: group,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    boxShadow: isDragging ? "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)" : "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)",
  };
  
  const corporateColor = "#6A3C96";

  const handleRemovePageFromGroup = async (itemId: string) => {
    try {
      // === DÜZELTME BURADA ===
      const { error } = await supabase // "셔츠" karakterleri kaldırıldı ve "=" eklendi
        .from("Pages")
        .update({ menu_group: null, group_sort_order: null, sort_order: null })
        .eq("id", itemId);
      // === DÜZELTME SONU ===
      if (error) throw error;
      toast({ title: "Başarılı", description: "Sayfa gruptan çıkarıldı." });
      await fetchPages();
    } catch (error: any) {
      toast({ title: "Hata", description: "Sayfa gruptan çıkarılırken bir sorun oluştu: " + error.message, variant: "destructive" });
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border bg-white dark:bg-slate-850 dark:border-slate-700 shadow-sm">
      <div className="px-4 py-3 flex justify-between items-center border-b dark:border-slate-700" style={{ backgroundColor: corporateColor, color: 'white' }}>
        <div className="flex items-center gap-2 flex-grow min-w-0">
          <Button variant="ghost" size="icon" {...attributes} {...listeners} className="cursor-move text-white hover:bg-white/20 h-8 w-8">
            <GripVertical size={18} />
          </Button>
          {isEditing ? (
            <Input
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={() => {if(editingValue.trim()) onSave(editingValue)}}
              onKeyDown={(e) => {if (e.key === "Enter" && editingValue.trim()) onSave(editingValue)}}
              className="bg-white text-black px-2 py-1 rounded-md text-sm h-8 flex-grow"
              autoFocus
            />
          ) : (
            <span className="font-semibold text-sm truncate" title={group}>{group}</span>
          )}
        </div>
        <div className="flex gap-1.5">
          {!isEditing && (
            <Button variant="ghost" size="icon" onClick={onEdit} className="text-white hover:bg-white/20 h-8 w-8">
              <Edit size={16} />
            </Button>
          )}
          {isEditing && (
             <Button variant="ghost" size="icon" onClick={() => {if(editingValue.trim()) onSave(editingValue)}} className="text-white hover:bg-white/20 h-8 w-8">
                <Save size={16} />
             </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-red-300 hover:text-red-100 hover:bg-red-500/50 h-8 w-8">
                <Trash2 size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Grubu Silmeyi Onayla</AlertDialogTitle>
                <AlertDialogDescription>
                  "{group}" grubunu silmek istediğinizden emin misiniz? Bu işlem gruptaki tüm sayfaların "menu_group" alanını sıfırlayacaktır, sayfalar silinmeyecektir.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">Evet, Sil</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {items.length > 0 ? (
        <ScrollArea className="h-auto max-h-72">
          <ul className="divide-y divide-gray-100 dark:divide-slate-700">
            {items.map((item: PageItem) => (
              <li key={item.id} className="px-4 py-2.5 text-sm text-gray-800 dark:text-slate-300 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800">
                <span className="truncate" title={item.title}>• {item.title}</span>
                <Button variant="link" size="sm" onClick={() => handleRemovePageFromGroup(item.id)} className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-auto p-0">
                  <X className="w-3.5 h-3.5 mr-1" /> Gruptan Çıkar
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      ) : (
        <p className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400 italic">Bu grupta henüz sayfa bulunmuyor.</p>
      )}
    </div>
  );
}

export default function MenuManagementPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [groupList, setGroupList] = useState<string[]>([]);
  const [orphanPages, setOrphanPages] = useState<PageItem[]>([]);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [newGroupName, setNewGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const corporateColor = "#6A3C96";

  const fetchPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("Pages")
        .select("id, title, menu_group, parent, sort_order, group_sort_order")
        .order("group_sort_order", { ascending: true, nullsFirst: false })
        .order("sort_order", { ascending: true, nullsFirst: false });

      if (error) throw error;

      if (data) {
        setPages(data);
        const grouped = data.filter((p) => p.menu_group);
        const orphaned = data.filter((p) => !p.menu_group && !p.parent);

        const uniqueGroupsMap = new Map<string, number>();
        grouped.forEach(p => {
            if (p.menu_group) {
                const normalized = normalizeGroup(p.menu_group);
                if (!uniqueGroupsMap.has(normalized) || (p.group_sort_order !== null && uniqueGroupsMap.get(normalized)! > p.group_sort_order!)) {
                    uniqueGroupsMap.set(normalized, p.group_sort_order !== null ? p.group_sort_order : Infinity);
                }
            }
        });
        
        const sortedUniqueGroups = Array.from(uniqueGroupsMap.entries())
            .sort(([, orderA], [, orderB]) => orderA - orderB)
            .map(([groupName]) => groupName);

        setGroupList(sortedUniqueGroups);
        setOrphanPages(orphaned.sort((a,b) => (a.title > b.title ? 1 : -1)));
      }
    } catch (error: any) {
        console.error("Sayfalar yüklenemedi:", error);
        toast({ title: "Hata", description: "Menü verileri yüklenirken bir sorun oluştu.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const updateGroupSortOrder = async (sortedGroups: string[]) => {
    try {
      const updates = sortedGroups.map(async (normalizedGroup, i) => {
        const originalGroupItem = pages.find(p => p.menu_group && normalizeGroup(p.menu_group) === normalizedGroup);
        if (originalGroupItem && originalGroupItem.menu_group) {
          return supabase
            .from("Pages")
            .update({ group_sort_order: i })
            .eq("menu_group", originalGroupItem.menu_group);
        }
        return Promise.resolve({ error: null });
      });
      
      const results = await Promise.all(updates);
      results.forEach(result => {
        if (result.error) throw result.error;
      });
       setGroupList(sortedGroups);
       toast({title: "Başarılı", description: "Grup sıralaması güncellendi."});

    } catch (error: any) {
        console.error("Grup sıralama hatası:", error);
        toast({ title: "Hata", description: "Grup sıralaması güncellenirken bir hata oluştu: " + error.message, variant: "destructive"});
        await fetchPages(); 
    }
  };
  
  const handleAddNewGroup = async () => {
    const name = normalizeGroup(newGroupName);
    if (!name) {
        toast({ title: "Uyarı", description: "Lütfen geçerli bir grup adı girin.", variant: "default" });
        return;
    }
    if (groupList.some(g => g.toLowerCase() === name.toLowerCase())) {
        toast({ title: "Uyarı", description: `"${name}" adında bir grup zaten mevcut.`, variant: "default" });
        return;
    }
    const updatedGroupList = [...groupList, name];
    setGroupList(updatedGroupList); 
    setNewGroupName(""); 
    toast({title: "Grup Eklendi (Yerel)", description: `"${name}" grubu listeye eklendi. Bir sayfaya atadığınızda sıralaması kaydedilecektir.`});
  };

  const updateGroupName = async (oldNormalizedName: string, newRawName: string) => {
    const newNormalizedName = normalizeGroup(newRawName);
    if (!newNormalizedName.trim()) {
        toast({title: "Geçersiz Ad", description: "Grup adı boş olamaz.", variant: "destructive"});
        setEditingGroup(null);
        return;
    }
    
    const originalGroupItem = pages.find(p => p.menu_group && normalizeGroup(p.menu_group) === oldNormalizedName);
    const originalCaseSensitiveGroupName = originalGroupItem?.menu_group;

    if (!originalCaseSensitiveGroupName) {
        toast({title: "Hata", description: "Düzenlenecek orijinal grup bulunamadı.", variant: "destructive"});
        setEditingGroup(null);
        return;
    }

    try {
      const { error } = await supabase
        .from("Pages")
        .update({ menu_group: newNormalizedName }) 
        .eq("menu_group", originalCaseSensitiveGroupName); 
      if (error) throw error;
      
      setEditingGroup(null);
      await fetchPages(); 
      toast({ title: "Başarılı", description: `Grup adı "${newNormalizedName}" olarak güncellendi.`});
    } catch (error: any) {
        console.error("Grup adı güncelleme hatası:", error);
        toast({ title: "Hata", description: "Grup adı güncellenirken bir hata oluştu: " + error.message, variant: "destructive"});
        setEditingGroup(null);
    }
  };

  const deleteGroupConfirmation = async (normalizedGroupName: string) => {
    const originalGroupItem = pages.find(p => p.menu_group && normalizeGroup(p.menu_group) === normalizedGroupName);
    const originalCaseSensitiveGroupName = originalGroupItem?.menu_group;

    if (!originalCaseSensitiveGroupName) {
      toast({ title: "Hata", description: "Silinecek grup bulunamadı.", variant: "destructive"});
      return;
    }
    
    try {
      const { error } = await supabase
        .from("Pages")
        .update({ menu_group: null, group_sort_order: null, sort_order: null })
        .eq("menu_group", originalCaseSensitiveGroupName);
      if (error) throw error;

      toast({ title: "Başarılı", description: `"${normalizedGroupName}" grubu ve içindeki sayfaların grup bilgisi kaldırıldı.` });
      await fetchPages();
    } catch (error: any) {
        console.error("Grup silme hatası:", error);
        toast({ title: "Hata", description: "Grup silinirken bir hata oluştu: " + error.message, variant: "destructive"});
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = groupList.indexOf(String(active.id));
      const newIndex = groupList.indexOf(String(over.id));
      if (oldIndex !== -1 && newIndex !== -1) {
        const sorted = arrayMove(groupList, oldIndex, newIndex);
        updateGroupSortOrder(sorted);
      }
    }
  };
  
  // Grupsuz sayfalar için "kaldır" butonu işlevsiz olduğu için o fonksiyonu yorum satırına alabilir veya silebiliriz.
  // const handleRemoveOrphanFromList = async (pageId: string) => { ... };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-8 bg-gray-50 dark:bg-slate-900">
        <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: corporateColor }} />
        <p className="text-lg font-medium text-gray-700 dark:text-slate-300">Menü Yönetimi Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b dark:border-slate-700">
            <h1 className="text-3xl font-bold flex items-center text-gray-800 dark:text-slate-100">
                <ListTree className="w-8 h-8 mr-3" style={{color: corporateColor}}/>
                Menü Yönetimi
            </h1>
        </div>

        <Card className="mb-8 dark:bg-slate-850 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold dark:text-slate-100">Yeni Menü Grubu Ekle</CardTitle>
            <CardDescription className="dark:text-slate-400">Menüde görünecek yeni bir grup başlığı oluşturun.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Yeni grup adı (örn: Kampanyalar)"
                className="flex-grow h-10 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                style={{ "--ring-color": corporateColor } as React.CSSProperties}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNewGroup()}
              />
              <Button onClick={handleAddNewGroup} style={{backgroundColor: corporateColor}} className="text-white hover:opacity-90 h-10 px-5">
                <PlusCircle className="w-5 h-5 mr-2" /> Ekle
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-slate-200">Sıralanabilir Menü Grupları</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">Grupları sürükleyip bırakarak menüdeki sıralarını değiştirebilirsiniz.</p>

        {groupList.length === 0 && !isLoading && (
            <div className="text-center py-10 border border-dashed rounded-lg dark:border-slate-700">
                <ListTree className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-slate-500" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-slate-300 mb-2">Henüz Menü Grubu Yok</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">Yukarıdan yeni bir grup ekleyerek başlayın.</p>
            </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={groupList} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {groupList.map((group) => {
                const itemsInGroup = pages.filter(
                  (p) => p.menu_group && normalizeGroup(p.menu_group) === group
                ).sort((a,b) => (a.sort_order ?? Infinity) - (b.sort_order ?? Infinity));

                return (
                  <GroupBox
                    key={group}
                    group={group}
                    items={itemsInGroup}
                    isEditing={editingGroup === group}
                    editingValue={editingValue}
                    setEditingValue={setEditingValue}
                    onEdit={() => {
                      setEditingGroup(group);
                      const originalGroupItem = pages.find(p => p.menu_group && normalizeGroup(p.menu_group) === group);
                      setEditingValue(originalGroupItem?.menu_group || group); 
                    }}
                    onSave={(val) => updateGroupName(group, val)}
                    onDelete={() => deleteGroupConfirmation(group)}
                    fetchPages={fetchPages}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        {orphanPages.length > 0 && (
          <Card className="mt-10 dark:bg-slate-850 dark:border-slate-700">
            <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center dark:text-slate-100">
                    <Inbox className="w-5 h-5 mr-2" style={{color: corporateColor}} /> Grupsuz Sayfalar
                </CardTitle>
                <CardDescription className="dark:text-slate-400">Bu sayfalar henüz bir menü grubuna atanmamış.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-auto max-h-80 border rounded-md dark:border-slate-700">
                <ul className="divide-y divide-gray-100 dark:divide-slate-700">
                  {orphanPages.map((item) => (
                    <li key={item.id} className="px-4 py-2.5 text-sm text-gray-800 dark:text-slate-300 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800">
                      <span className="truncate" title={item.title}>• {item.title}</span>
                      {/* Grupsuz sayfalar için "kaldır" butonu işlevsiz olduğu için kaldırıldı. */}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
