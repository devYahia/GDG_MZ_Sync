import { NextResponse } from "next/server";
import { container } from "@/infrastructure/container";
import { sql } from "drizzle-orm";

export async function GET() {
    try {
        // Check DB connection
        await container.db.execute(sql`SELECT 1`);

        return NextResponse.json({
            status: "ok",
            database: "connected",
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            status: "unhealthy",
            error: error.message
        }, { status: 503 });
    }
}
