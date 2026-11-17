import { NextResponse } from "next/server";
import { curateMediaForKeywords } from "@/lib/pipeline/media-curator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { keywords = [], preferredType = "IMAGE", page = 1, perPage = 9 } = body;

    const items = await curateMediaForKeywords({
      keywords: Array.isArray(keywords) ? keywords : [String(keywords)],
      preferredType,
      page: Number(page) || 1,
      perPage: Number(perPage) || 9,
    });

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Falha ao curar mídias" },
      { status: 500 }
    );
  }
}
