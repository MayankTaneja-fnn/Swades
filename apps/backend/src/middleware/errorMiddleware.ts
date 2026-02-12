import { Context, Next } from "hono";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

interface ErrorResponse {
  error: string;
  code: string;
  details?: any;
}

export const errorMiddleware = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (err: any) {
    console.error("Error caught by middleware:", err);

    let errorResponse: ErrorResponse;
    let statusCode = 500;

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      statusCode = 400;

      switch (err.code) {
        case "P2002":
          errorResponse = {
            error: "A record with this value already exists",
            code: "DUPLICATE_RECORD",
            details: { field: err.meta?.target },
          };
          break;

        case "P2025":
          errorResponse = {
            error: "Record not found",
            code: "NOT_FOUND",
            details: { cause: err.meta?.cause },
          };
          break;

        case "P2003":
          errorResponse = {
            error: "Foreign key constraint failed",
            code: "FOREIGN_KEY_ERROR",
            details: { field: err.meta?.field_name },
          };
          break;

        default:
          errorResponse = {
            error: "Database operation failed",
            code: "DATABASE_ERROR",
            details: { prismaCode: err.code },
          };
      }
    } else if (err instanceof ZodError) {
      statusCode = 400;
      errorResponse = {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: err.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      };
    } else if (err instanceof Prisma.PrismaClientValidationError) {
      statusCode = 400;
      errorResponse = {
        error: "Invalid data provided",
        code: "VALIDATION_ERROR",
        details: { message: err.message },
      };
    } else if (err.name === "AI_APICallError" || err.message?.includes("AI SDK")) {
      statusCode = 503;
      errorResponse = {
        error: "AI service temporarily unavailable",
        code: "AI_SERVICE_ERROR",
        details: { message: err.message },
      };
    } else {
      errorResponse = {
        error: err.message || "An unexpected error occurred",
        code: "INTERNAL_ERROR",
        details: {
          stack: err.stack,
        },
      };
    }

    return c.json(errorResponse, statusCode as any);
  }
};
