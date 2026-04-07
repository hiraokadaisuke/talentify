import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const offers = await prisma.offers.findMany({
      take: 10,
      orderBy: {
        created_at: "desc",
      },
    });

    console.log("[prisma-check] offers:", offers);

    return NextResponse.json({
      ok: true,
      count: offers.length,
      offers,
    });
  } catch (error: unknown) {
    console.error("[prisma-check] failed:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch offers with Prisma",
      },
      { status: 500 },
    );
  }
}
