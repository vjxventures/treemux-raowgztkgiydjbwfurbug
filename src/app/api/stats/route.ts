import { NextResponse } from "next/server";
import { getMarketplaceStats } from "@/lib/store";

export async function GET() {
  return NextResponse.json(getMarketplaceStats());
}
