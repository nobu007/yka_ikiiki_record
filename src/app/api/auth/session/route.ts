import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withResilientHandler } from "@/lib/api/error-handler";
import { DEFAULT_TIMEOUTS } from "@/lib/resilience";
import { API_ERROR_MESSAGES, HTTP_STATUS } from "@/lib/constants/api";
import { UserSchema } from "@/schemas/api";
import { InMemoryUserRepository } from "@/infrastructure/repositories/InMemoryUserRepository";

const SafeUserSchema = UserSchema.omit({ passwordHash: true });

const SessionResponseSchema = z.object({
  success: z.boolean(),
  authenticated: z.boolean().optional(),
  user: SafeUserSchema.optional(),
  error: z.string().optional(),
});

type SessionResponse = z.infer<typeof SessionResponseSchema>;

export async function GET(request: NextRequest): Promise<NextResponse> {
  return withResilientHandler(
    async () => {
      const authHeader = request.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          {
            success: true,
            authenticated: false,
          } satisfies SessionResponse,
          { status: HTTP_STATUS.OK }
        );
      }

      const token = authHeader.substring(7);

      const tokenMatch = token.match(/^session_(\d+)_/);
      if (!tokenMatch) {
        return NextResponse.json(
          {
            success: true,
            authenticated: false,
          } satisfies SessionResponse,
          { status: HTTP_STATUS.OK }
        );
      }

      const userId = parseInt(tokenMatch[1], 10);

      const userRepository = new InMemoryUserRepository();
      const user = await userRepository.findById(userId);

      if (!user) {
        return NextResponse.json(
          {
            success: true,
            authenticated: false,
          } satisfies SessionResponse,
          { status: HTTP_STATUS.OK }
        );
      }

      const { passwordHash: _, ...safeUser } = user;

      return NextResponse.json(
        {
          success: true,
          authenticated: true,
          user: safeUser,
        } satisfies SessionResponse,
        { status: HTTP_STATUS.OK }
      );
    },
    {
      operationName: "GET /api/auth/session",
      timeoutMs: DEFAULT_TIMEOUTS.api,
    }
  );
}
