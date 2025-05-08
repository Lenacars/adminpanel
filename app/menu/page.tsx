"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { GripVertical } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PageItem {
  id: string;
  title: string;
  menu_group: string | null;
  parent: string | null;
  sort_order: number | null;
}

export default function MenuManagementPage() {
  const [activeTab, setActiveTab] = useState<"görünüm" | "düzenle">("görünüm");
  const [pages, setPages] = useState<PageItem[]>([]);
  const [menuGroups, setMenuGroups] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetchPages();
  }, []);

  const normalizeGroup = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const fetchPages = async () => {
    const { data, error } = await supabase
      .from("Pages")
      .select("id, title, menu_group, parent, sort_order")
      .order("sort_order", { ascending: true });

    if (!error && data) {
      setPages(data);
      const groups = Array.from(
        new Set(
          data
            .map((p) => p.menu_group?.trim())
            .filter(Boolean)
            .map((g) => normalizeGroup(g!))
        )
      );
      setMenuGroups(groups);
    }
  };

  const updateMenuGroup = async (pageId: string, newGroup: string) => {
    await supabase.from("Pages").update({ menu_group: newGroup }).eq("id", pageId);
    fetchPages();
  };

  const updateParentPage = async (pageId: string, parentId: string | null) => {
    await supabase.from("Pages").update({ parent: parentId }).eq("id", pageId);
    fetchPages();
  };

  const updateSortOrder = async (sortedItems: PageItem[]) => {
    for (let i = 0; i < sortedItems.length; i++) {
      await supabase.from("Pages").update({ sort_order: i }).eq("id", sortedItems[i].id);
    }
    fetchPages();
  };

  const addNewGroup = () => {
    const name = normalizeGroup(newGroupName.trim());
    if (name !== "" && !menuGroups.includes(name)) {
      setMenuGroups((prev) => [...prev, name]);
      setNewGroupName("");
    }
  };

  const deleteGroup = async (groupName: string) => {
    if (!window.confirm(`"${groupName}" grubunu kaldırmak istiyor musun?`)) return;
    await supabase.from("Pages").update({ menu_group: null }).eq("menu_group", groupName);
    fetchPages();
  };

  const removeSinglePageFromGroup = async (pageId: string) => {
    await supabase.from("Pages").update({ menu_group: null }).eq("id", pageId);
    fetchPages();
  };

  const renderOverview = () => {
    const grouped: { [key: string]: PageItem[] } = {};
    pages.forEach((page) => {
      const rawGroup = page.menu_group?.trim() || "Menüsüz";
      const group = normalizeGroup(rawGroup);
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(page);
    });

    return (
      <div className="space-y-6">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} className="border border-gray-200 rounded-md shadow-sm">
            <div className="bg-[#6A3C96] text-white px-4 py-2 rounded-t-md flex justify-between items-center">
              <span className="text-lg font-semibold">🟪 {group}</span>
              {group !== "Menüsüz" && (
                <button
                  onClick={() => deleteGroup(group)}
                  className="text-red-300 hover:text-red-500 text-sm"
                >
                  Kaldır
                </button>
              )}
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={({ active, over }) => {
                if (active.id !== over?.id) {
                  const oldIndex = items.findIndex((i) => i.id === active.id);
                  const newIndex = items.findIndex((i) => i.id === over?.id);
                  const sorted = arrayMove(items, oldIndex, newIndex);
                  updateSortOrder(sorted);
                }
              }}
            >
              <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <ul className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      onRemove={() => removeSinglePageFromGroup(item.id)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </div>
        ))}
      </div>
    );
  };

  const renderEditor = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="Yeni menü grubu"
          className="border border-gray-300 p-2 rounded-md w-60"
        />
        <button
          onClick={addNewGroup}
          className="bg-[#6A3C96] text-white px-4 py-2 rounded-md hover:bg-purple-700"
        >
          ➕ Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((page) => (
          <div
            key={page.id}
            className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white flex flex-col gap-3"
          >
            <div className="font-semibold text-gray-800 text-sm">
              📄 <span className="text-lg">{page.title}</span>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">📂 Menü Grubu</label>
              <select
                value={page.menu_group || ""}
                onChange={(e) => updateMenuGroup(page.id, e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="">- Seçiniz -</option>
                {menuGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">👪 Ebeveyn Sayfa</label>
              <select
                value={page.parent || ""}
                onChange={(e) => updateParentPage(page.id, e.target.value || null)}
                className="border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="">- Yok -</option>
                {pages
                  .filter((p) => p.id !== page.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
              </select>
            </div>

            <div className="text-xs text-gray-500">🔢 Sıra: {page.sort_order ?? 0}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Menü Yönetimi</h1>
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab("görünüm")}
          className={`px-4 py-2 rounded-md font-medium ${
            activeTab === "görünüm" ? "bg-[#6A3C96] text-white" : "bg-gray-100 text-gray-800"
          }`}
        >
          Menü Görünümü
        </button>
        <button
          onClick={() => setActiveTab("düzenle")}
          className={`px-4 py-2 rounded-md font-medium ${
            activeTab === "düzenle" ? "bg-[#6A3C96] text-white" : "bg-gray-100 text-gray-800"
          }`}
        >
          Menü Düzenleme
        </button>
      </div>
      {activeTab === "görünüm" ? renderOverview() : renderEditor()}
    </div>
  );
}

function SortableItem({ item, onRemove }: { item: PageItem; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="px-6 py-2 text-gray-800 hover:bg-gray-50 flex justify-between items-center"
    >
      <div className="flex items-center gap-2">
        <span {...listeners} className="cursor-move text-gray-400">
          <GripVertical size={16} />
        </span>
        • {item.title}
      </div>
      <button onClick={onRemove} className="text-xs text-red-400 hover:text-red-600">
        gruptan çıkar
      </button>
    </li>
  );
}
