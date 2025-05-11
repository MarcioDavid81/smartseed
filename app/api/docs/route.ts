import { getSwaggerSpec } from "@/lib/swagger";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  const spec = getSwaggerSpec();
  return NextResponse.json(spec);
}
