"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { GripVertical, Pencil } from "lucide-react";
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

// 🧠 Her kelimenin baş harfini büyüten fonksiyon
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

export default function MenuManagementPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [groupList, setGroupList] = useState<string[]>([]);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  const [newGroupName, setNewGroupName] = useState("");
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    const { data } = await supabase
      .from("Pages")
      .select("id, title, menu_group, parent, sort_order, group_sort_order");

    if (data) {
      setPages(data);
      const uniqueGroups = Array.from(
        new Set(
          data
            .filter((p) => p.menu_group)
            .map((p) => normalizeGroup(p.menu_group!))
        )
      );
      setGroupList(uniqueGroups);
    }
  };

  const updateGroupSortOrder = async (sortedGroups: string[]) => {
    for (let i = 0; i < sortedGroups.length; i++) {
      const group = sortedGroups[i];
      const realGroup = pages.find((p) => normalizeGroup(p.menu_group || "") === group)?.menu_group;
      if (realGroup) {
        await supabase
          .from("Pages")
          .update({ group_sort_order: i })
          .eq("menu_group", realGroup);
      }
    }
    fetchPages();
  };

  const updateGroupName = async (oldName: string, newName: string) => {
    const normalized = normalizeGroup(newName);
    const realGroup = pages.find((p) => normalizeGroup(p.menu_group || "") === oldName)?.menu_group;
    if (realGroup) {
      await supabase
        .from("Pages")
        .update({ menu_group: normalized })
        .eq("menu_group", realGroup);
      fetchPages();
      setEditingGroup(null);
    }
  };

  const deleteGroup = async (groupName: string) => {
    const realGroup = pages.find((p) => normalizeGroup(p.menu_group || "") === groupName)?.menu_group;
    if (!realGroup) return alert("Grup bulunamadı.");
    if (!confirm(`"${groupName}" grubunu silmek istiyor musun?`)) return;

    await supabase
      .from("Pages")
      .update({ menu_group: null, group_sort_order: 0 })
      .eq("menu_group", realGroup);
    fetchPages();
  };

  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = groupList.indexOf(active.id);
      const newIndex = groupList.indexOf(over.id);
      const sorted = arrayMove(groupList, oldIndex, newIndex);
      setGroupList(sorted);
      updateGroupSortOrder(sorted);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Menü Yönetimi</h1>

      <div className="mb-6 flex gap-2">
        <input
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="Yeni grup adı"
          className="border p-2 rounded w-64"
        />
        <button
          onClick={async () => {
            const name = normalizeGroup(newGroupName);
            if (!name || groupList.includes(name)) return;
            await supabase
              .from("Pages")
              .update({ group_sort_order: groupList.length })
              .eq("menu_group", name);
            setNewGroupName("");
            fetchPages();
          }}
          className="bg-[#6A3C96] text-white px-4 py-2 rounded"
        >
          ➕ Ekle
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={groupList} strategy={verticalListSortingStrategy}>
          <div className="space-y-6">
            {groupList.map((group) => {
              const items = pages.filter(
                (p) => normalizeGroup(p.menu_group || "") === group
              );

              return (
                <GroupBox
                  key={group}
                  group={group}
                  items={items}
                  isEditing={editingGroup === group}
                  editingValue={editingValue}
                  setEditingValue={setEditingValue}
                  onEdit={() => {
                    setEditingGroup(group);
                    setEditingValue(group);
                  }}
                  onSave={(val) => updateGroupName(group, val)}
                  onDelete={() => deleteGroup(group)}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
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
}: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: group,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="border rounded shadow-sm">
      <div className="bg-[#6A3C96] text-white px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span {...attributes} {...listeners} className="cursor-move">
            <GripVertical size={16} />
          </span>
          {isEditing ? (
            <input
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={() => onSave(editingValue)}
              onKeyDown={(e) => e.key === "Enter" && onSave(editingValue)}
              className="bg-white text-black px-2 py-1 rounded text-sm"
              autoFocus
            />
          ) : (
            <span className="font-semibold">{group}</span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit}>
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} className="text-red-300 hover:text-red-500 text-sm">
            Kaldır
          </button>
        </div>
      </div>

      <ul className="divide-y divide-gray-100">
        {items.map((item: PageItem) => (
          <li key={item.id} className="px-6 py-2 text-gray-800 flex justify-between">
            <div>• {item.title}</div>
            <button
              onClick={async () => {
                await supabase
                  .from("Pages")
                  .update({ menu_group: null, group_sort_order: 0 })
                  .eq("id", item.id);
                location.reload();
              }}
              className="text-xs text-red-400 hover:text-red-600"
            >
              gruptan çıkar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
