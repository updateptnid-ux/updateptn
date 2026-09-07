import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate data is array
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Data must be an array" },
        { status: 400 }
      );
    }

    // Save to public/data_snbp.json
    const filePath = join(process.cwd(), "public", "data_snbp.json");
    await writeFile(filePath, JSON.stringify(data, null, 2));

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${data.length} SNBP records`,
      count: data.length,
    });
  } catch (error: any) {
    console.error("Error uploading SNBP data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload data" },
      { status: 500 }
    );
  }
}
