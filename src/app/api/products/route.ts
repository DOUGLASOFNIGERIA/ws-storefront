import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";
import { isCategory } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const rawCategory = params.get("category");
  const category = rawCategory && isCategory(rawCategory) ? rawCategory : undefined;
  const limit = Number(params.get("limit"));

  const products = await getProducts({
    category,
    search: params.get("q") ?? undefined,
    featured: params.get("featured") === "1",
    limit: Number.isFinite(limit) && limit > 0 ? limit : undefined,
  });

  return NextResponse.json({ products });
}
