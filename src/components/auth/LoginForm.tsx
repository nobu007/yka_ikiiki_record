import { memo, useState, useCallback } from "react";
import { LoadingSpinner } from "@/components/common";
import { z } from "zod";

const LoginFormDataSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof LoginFormDataSchema>;

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    email: string;
    name: string;
    role: "TEACHER" | "ADMIN";
  };
  error?: string;
}

interface LoginFormProps {
  onSuccess: (response: LoginResponse) => void;
  onError: (error: string) => void;
  className?: string;
}

const LoginFormComponent = memo<LoginFormProps>(function LoginForm({
  onSuccess,
  onError,
  className,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback((): string | null => {
    const errors: string[] = [];

    const emailResult = z.string().email().safeParse(email);
    if (!emailResult.success) {
      errors.push("Invalid email format");
    }

    if (!password || password.trim().length === 0) {
      errors.push("Password is required");
    }

    return errors.length > 0 ? errors.join(", ") : null;
  }, [email, password]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        setPassword("");
        return;
      }

      setError("");
      setIsSubmitting(true);

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        });

        const data: LoginResponse = await response.json();

        if (response.ok && data.success) {
          setError("");
          setPassword("");
          onSuccess(data);
        } else {
          const errorMessage = data.error || "Login failed";
          setError(errorMessage);
          onError(errorMessage);
          setPassword("");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        onError(errorMessage);
        setPassword("");
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, validateForm, onSuccess, onError]
  );

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError("");
  }, [error]);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError("");
  }, [error]);

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          disabled={isSubmitting}
          aria-label="Email"
          aria-invalid={!!error}
          aria-describedby={error ? "email-error" : undefined}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginTop: "0.25rem",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          disabled={isSubmitting}
          aria-label="Password"
          aria-invalid={!!error}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginTop: "0.25rem",
            boxSizing: "border-box",
          }}
        />
      </div>

      {error && (
        <div
          id="email-error"
          role="alert"
          style={{ color: "red", marginBottom: "1rem", fontSize: "0.875rem" }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        style={{
          width: "100%",
          padding: "0.75rem 1.5rem",
          backgroundColor: isSubmitting ? "#9CA3AF" : "#2563EB",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          fontWeight: "500",
          cursor: isSubmitting ? "not-allowed" : "pointer",
          transition: "background-color 0.2s",
        }}
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" color="white" />
            {" Logging in..."}
          </>
        ) : (
          "Login"
        )}
      </button>
    </form>
  );
});

export const LoginForm = LoginFormComponent;
LoginForm.displayName = "LoginForm";
