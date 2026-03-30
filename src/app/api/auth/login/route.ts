import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withResilientHandler } from "@/lib/api/error-handler";
import { DEFAULT_TIMEOUTS } from "@/lib/resilience";
import { API_ERROR_MESSAGES, HTTP_STATUS, API_OPERATIONS } from "@/lib/constants/api";
import { UserSchema } from "@/schemas/api";
import {
  AuthenticationService,
  type PasswordHasher,
  type TokenGenerator,
  type AuthenticationResult,
} from "@/domain/services/AuthenticationService";
import { InMemoryUserRepository } from "@/infrastructure/repositories/InMemoryUserRepository";
import { ValidationError } from "@/lib/error-handler";
import * as crypto from "node:crypto";

const LoginRequestSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

class BcryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .createHmac("sha256", salt)
      .update(password)
      .digest("hex");
    return `${salt}$${hash}`;
  }

  async verify(password: string, hash: string): Promise<boolean> {
    const [salt, originalHash] = hash.split("$");
    if (!salt || !originalHash) return false;

    const computedHash = crypto
      .createHmac("sha256", salt)
      .update(password)
      .digest("hex");

    return computedHash === originalHash;
  }
}

class SimpleTokenGenerator implements TokenGenerator {
  async generateToken(user: z.infer<typeof UserSchema>): Promise<string> {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `session_${user.id}_${timestamp}_${random}`;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return withResilientHandler(
    async () => {
      let requestBody: unknown;

      try {
        requestBody = await request.json();
      } catch {
        return NextResponse.json(
          {
            success: false,
            error: API_ERROR_MESSAGES.VALIDATION.REQUEST,
          },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }

      const validation = LoginRequestSchema.safeParse(requestBody);

      if (!validation.success) {
        throw new ValidationError(
          `${API_ERROR_MESSAGES.VALIDATION.REQUEST}: ${validation.error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")}`
        );
      }

      const { email, password } = validation.data;

      const userRepository = new InMemoryUserRepository();
      const passwordHasher = new BcryptPasswordHasher();
      const tokenGenerator = new SimpleTokenGenerator();

      const authService = new AuthenticationService(
        userRepository,
        passwordHasher,
        tokenGenerator
      );

      try {
        const result: AuthenticationResult = await authService.login(
          email,
          password
        );

        const { passwordHash: _passwordHash, ...safeUser } = result.user;

        return NextResponse.json(
          {
            success: true,
            token: result.token,
            user: safeUser,
          },
          { status: HTTP_STATUS.OK }
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : API_ERROR_MESSAGES.AUTH.UNAUTHORIZED;

        return NextResponse.json(
          {
            success: false,
            error: errorMessage,
          },
          { status: HTTP_STATUS.UNAUTHORIZED }
        );
      }
    },
    {
      operationName: API_OPERATIONS.POST_AUTH_LOGIN,
      timeoutMs: DEFAULT_TIMEOUTS.api,
    }
  );
}
