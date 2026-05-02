import { NextRequest, NextResponse } from "next/server";

// POST /api/settings/validate - Test if API key is valid
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { apiKey } = body;

  if (!apiKey) {
    return NextResponse.json(
      { valid: false, message: "API key is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch("https://api.fish.audio/model", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return NextResponse.json({ valid: true, message: "API key is valid" });
    } else if (response.status === 401) {
      return NextResponse.json({
        valid: false,
        message: "Invalid API key (unauthorized)",
      });
    } else if (response.status === 402) {
      return NextResponse.json({
        valid: true,
        message: "API key is valid but payment required",
      });
    } else {
      const errorBody = await response.text();
      return NextResponse.json({
        valid: false,
        message: `Unexpected response (${response.status}): ${errorBody}`,
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        valid: false,
        message: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}
