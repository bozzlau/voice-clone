import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/settings - Return whether API key exists (never return full key)
export async function GET() {
  const row = db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.key, "api_key"))
    .get();

  const apiKey = row?.value || null;
  return NextResponse.json({
    exists: !!apiKey,
    prefix: apiKey ? apiKey.substring(0, 4) + "..." : null,
  });
}

// PUT /api/settings - Save a setting
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { key, value } = body;

  if (!key || value === undefined) {
    return NextResponse.json(
      { error: "key and value are required" },
      { status: 400 }
    );
  }

  db.insert(schema.settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value } })
    .run();

  return NextResponse.json({ success: true });
}
