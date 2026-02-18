import { NextRequest, NextResponse } from "next/server";
import { serviceStore } from "@/lib/store";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  const category = req.nextUrl.searchParams.get("category");

  if (q) return NextResponse.json(serviceStore.search(q));
  if (category) return NextResponse.json(serviceStore.getByCategory(category));
  return NextResponse.json(serviceStore.getAll());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const service = serviceStore.create(body);
  return NextResponse.json(service, { status: 201 });
}
