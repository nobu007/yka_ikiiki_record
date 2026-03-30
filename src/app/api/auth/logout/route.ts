import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withResilientHandler } from "@/lib/api/error-handler";
import { DEFAULT_TIMEOUTS } from "@/lib/resilience";
import { API_ERROR_MESSAGES, HTTP_STATUS } from "@/lib/constants/api";

type LogoutResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  return withResilientHandler(
    async () => {
      const authHeader = request.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          {
            success: false,
            error: API_ERROR_MESSAGES.AUTH.UNAUTHORIZED,
          },
          { status: HTTP_STATUS.UNAUTHORIZED }
        );
      }

      void authHeader.substring(7);

      return NextResponse.json(
        {
          success: true,
          message: "Logged out successfully",
        },
        { status: HTTP_STATUS.OK }
      );
    },
    {
      operationName: "POST /api/auth/logout",
      timeoutMs: DEFAULT_TIMEOUTS.api,
    }
  );
}
