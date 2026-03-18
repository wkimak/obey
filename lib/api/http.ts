import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { HttpError } from "@/lib/api/errors";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonZodError(err: ZodError) {
  return NextResponse.json(
    { error: "Invalid request", details: err.flatten() },
    { status: 400 },
  );
}

export function errorToResponse(err: unknown) {
  if (err instanceof HttpError) {
    return jsonError(err.message, err.status);
  }
  return jsonError("Internal Server Error", 500);
}

