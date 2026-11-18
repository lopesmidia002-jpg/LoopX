import { NextResponse } from "next/server";
import { curateMediaForKeywords } from "@/lib/pipeline/media-curator";
import { MediaType } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawKeywords = body.keywords || (body.query ? body.query.split(" ") : []);
    const keywords = Array.isArray(rawKeywords) ? rawKeywords : [String(rawKeywords)];
    const preferredType: MediaType = (body.preferredType || body.mediaType || "IMAGE") as MediaType;
    const page = Number(body.page) || 1;
    const perPage = Number(body.perPage) || 9;

    const items = await curateMediaForKeywords({
      keywords,
      preferredType,
      page,
      perPage,
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
