import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseCSV, parseExcel, parseJSON, importProducts, generateCSVTemplate, generateJSONTemplate } from "@/lib/import";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(role ?? "")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls", "json"].includes(ext ?? "")) {
      return NextResponse.json({ success: false, error: "Unsupported file type. Use CSV, Excel, or JSON." }, { status: 400 });
    }

    // Create import job
    const job = await prisma.importJob.create({
      data: {
        fileName: file.name,
        fileType: ext ?? "csv",
        status: "PROCESSING",
        createdBy: session.user.id,
      },
    });

    // Parse file
    let rows;
    const buffer = await file.arrayBuffer();
    if (ext === "csv") {
      rows = parseCSV(await file.text());
    } else if (ext === "json") {
      rows = parseJSON(await file.text());
    } else {
      rows = parseExcel(buffer);
    }

    await prisma.importJob.update({ where: { id: job.id }, data: { totalRows: rows.length } });

    // Run import
    const result = await importProducts(rows, job.id);

    return NextResponse.json({
      success: true,
      data: {
        jobId: job.id,
        totalRows: rows.length,
        succeeded: result.succeeded,
        failed: result.failed,
        errors: result.errors.slice(0, 20),
      },
      message: `Import complete: ${result.succeeded} succeeded, ${result.failed} failed.`,
    });
  } catch (err) {
    console.error("[import/POST]", err);
    return NextResponse.json({ success: false, error: "Import failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(role ?? "")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const type = req.nextUrl.searchParams.get("template");

    if (type === "csv") {
      const csv = generateCSVTemplate();
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="luxe-store-import-template.csv"',
        },
      });
    }

    if (type === "json") {
      const json = generateJSONTemplate();
      return new NextResponse(json, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": 'attachment; filename="luxe-store-import-template.json"',
        },
      });
    }

    // List import jobs
    const jobs = await prisma.importJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ success: true, data: { jobs } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
  }
}
