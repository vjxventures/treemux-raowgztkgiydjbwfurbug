import { NextResponse } from "next/server";
import { getDatasets } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(getDatasets());
}
