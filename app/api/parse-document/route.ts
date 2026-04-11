import { NextRequest, NextResponse } from "next/server";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TEXT_LENGTH = 15000; // Token limit safety

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
]);

const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx", ".txt", ".md"]);

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot !== -1 ? filename.slice(lastDot).toLowerCase() : "";
}

function cleanText(text: string): string {
  return text
    // Normalize unicode
    .normalize("NFKD")
    // Replace multiple whitespace/newlines with single space or newline
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    // Remove null bytes and control characters (keep newlines, tabs)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    // Trim to max length
    .slice(0, MAX_TEXT_LENGTH);
}

async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    // Use the legacy build for Node.js environments
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
    });
    
    const pdf = await loadingTask.promise;
    let fullText = "";
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item): item is TextItem => 'str' in item)
        .map((item) => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }
    
    return fullText.trim();
  } catch (err) {
    console.error("PDF parsing error details:", err);
    throw err;
  }
}

async function parseDocx(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (err) {
    console.error("DOCX parsing error details:", err);
    throw err;
  }
}

function parseText(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "NO_FILE", message: "No file provided in the request." },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "FILE_TOO_LARGE",
          message: `File size exceeds the 10MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
        },
        { status: 400 }
      );
    }

    // Check file type
    const extension = getFileExtension(file.name);
    const mimeType = file.type;

    if (!ALLOWED_TYPES.has(mimeType) && !ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        {
          error: "INVALID_TYPE",
          message: `Unsupported file type "${extension || mimeType}". Allowed: .pdf, .docx, .txt, .md`,
        },
        { status: 400 }
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Route to correct parser
    let rawText = "";

    if (mimeType === "application/pdf" || extension === ".pdf") {
      rawText = await parsePdf(buffer);
    } else if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      extension === ".docx"
    ) {
      rawText = await parseDocx(buffer);
    } else if (
      mimeType === "text/plain" ||
      mimeType === "text/markdown" ||
      extension === ".txt" ||
      extension === ".md"
    ) {
      rawText = parseText(buffer);
    } else {
      return NextResponse.json(
        {
          error: "INVALID_TYPE",
          message: "Could not determine file type for parsing.",
        },
        { status: 400 }
      );
    }

    // Clean extracted text
    const extractedText = cleanText(rawText);

    if (!extractedText || extractedText.length < 5) {
      return NextResponse.json(
        {
          error: "EMPTY_DOCUMENT",
          message:
            "The document appears to be empty or contains no extractable text.",
        },
        { status: 422 }
      );
    }

    const wordCount = extractedText
      .split(/\s+/)
      .filter((w) => w.length > 0).length;

    return NextResponse.json({
      extractedText,
      wordCount,
      fileName: file.name,
    });
  } catch (err) {
    console.error("Document parse error:", err);
    return NextResponse.json(
      {
        error: "PARSE_FAILED",
        message:
          err instanceof Error
            ? err.message
            : "Failed to parse the uploaded document.",
      },
      { status: 500 }
    );
  }
}
