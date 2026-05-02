import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 20));
  const offset = (page - 1) * pageSize;

  const totalResult = db.select({ count: count() }).from(schema.ttsHistory).get();
  const total = totalResult?.count || 0;

  const items = db
    .select()
    .from(schema.ttsHistory)
    .orderBy(desc(schema.ttsHistory.createdAt))
    .limit(pageSize)
    .offset(offset)
    .all();

  return NextResponse.json({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
