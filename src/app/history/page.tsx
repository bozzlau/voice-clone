"use client";

import { useEffect, useState, useCallback } from "react";
import { HistoryList } from "@/components/history/HistoryList";
import { toast } from "sonner";

export default function HistoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/tts-history?page=${page}&pageSize=20`);
      const data = await res.json();
      setItems(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error("Failed to load history");
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/tts-history/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        toast.success("Deleted");
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl py-8">
      <h2 className="mb-6 text-2xl font-semibold">History</h2>
      <HistoryList
        items={items}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onDelete={handleDelete}
      />
    </div>
  );
}
