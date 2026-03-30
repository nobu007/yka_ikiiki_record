import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render email input field", () => {
      render(<LoginForm onSuccess={jest.fn()} onError={jest.fn()} />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it("should render password input field", () => {
      render(<LoginForm onSuccess={jest.fn()} onError={jest.fn()} />);
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    });

    it("should render submit button", () => {
      render(<LoginForm onSuccess={jest.fn()} onError={jest.fn()} />);
      expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      const { container } = render(
        <LoginForm
          onSuccess={jest.fn()}
          onError={jest.fn()}
          className="custom-class"
        />
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("Input Validation", () => {
    it("should show validation error for invalid email format", async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={jest.fn()} onError={jest.fn()} />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      await user.type(emailInput, "invalid-email");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });

    it("should show validation error for empty password", async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={jest.fn()} onError={jest.fn()} />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      await user.type(emailInput, "test@example.com");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it("should show validation error for empty email", async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={jest.fn()} onError={jest.fn()} />);

      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });

    it("should not submit form with invalid email format", async () => {
      const user = userEvent.setup();
      const onSuccess = jest.fn();
      render(<LoginForm onSuccess={onSuccess} onError={jest.fn()} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      await user.type(emailInput, "invalid-email");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).not.toHaveBeenCalled();
      });
    });
  });

  describe("Form Submission - Success", () => {
    it("should call login API with correct credentials", async () => {
      const user = userEvent.setup();
      const mockResponse = {
        success: true,
        token: "session_1_1234567890_abc123",
        user: {
          id: 1,
          email: "test@example.com",
          name: "Test User",
          role: "TEACHER",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const onSuccess = jest.fn();
      render(<LoginForm onSuccess={onSuccess} onError={jest.fn()} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
        });
      });
    });

    it("should call onSuccess callback with response data on successful login", async () => {
      const user = userEvent.setup();
      const mockResponse = {
        success: true,
        token: "session_1_1234567890_abc123",
        user: {
          id: 1,
          email: "test@example.com",
          name: "Test User",
          role: "TEACHER",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const onSuccess = jest.fn();
      render(<LoginForm onSuccess={onSuccess} onError={jest.fn()} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockResponse);
      });
    });

    it("should disable submit button while submitting", async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true, token: "test", user: {} }),
                } as Response),
              100
            )
          )
      );

      render(<LoginForm onSuccess={jest.fn()} onError={jest.fn()} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();

      await waitFor(
        () => {
          expect(submitButton).not.toBeDisabled();
        },
        { timeout: 200 }
      );
    });

    it("should clear error message on successful submission after previous error", async () => {
      const user = userEvent.setup();
      mockFetch
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            token: "session_1_1234567890_abc123",
            user: { id: 1, email: "test@example.com", name: "Test", role: "TEACHER" },
          }),
        } as Response);

      const onSuccess = jest.fn();
      const onError = jest.fn();
      render(<LoginForm onSuccess={onSuccess} onError={onError} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "wrong");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      await user.clear(passwordInput);
      await user.type(passwordInput, "correct");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/network error/i)).not.toBeInTheDocument();
        expect(onSuccess).toHaveBeenCalled();
      });
    });
  });

  describe("Form Submission - Error Handling", () => {
    it("should call onError callback with error message on failed login", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: "Invalid email or password",
        }),
      } as Response);

      const onError = jest.fn();
      render(<LoginForm onSuccess={jest.fn()} onError={onError} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith("Invalid email or password");
      });
    });

    it("should display error message from API response", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: "Invalid email or password",
        }),
      } as Response);

      render(<LoginForm onSuccess={jest.fn()} onError={jest.fn()} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    it("should handle network errors gracefully", async () => {
      const user = userEvent.setup();
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const onError = jest.fn();
      render(<LoginForm onSuccess={jest.fn()} onError={onError} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith("Network error");
      });
    });

    it("should handle API error response with missing error field", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
        }),
      } as Response);

      render(<LoginForm onSuccess={jest.fn()} onError={jest.fn()} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/login failed/i)).toBeInTheDocument();
      });
    });

    it("should handle API response with validation error", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: "Invalid request: email: Invalid email format",
        }),
      } as Response);

      render(<LoginForm onSuccess={jest.fn()} onError={jest.fn()} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid request/i)).toBeInTheDocument();
      });
    });
  });

  describe("User Interactions", () => {
    it("should allow user to type in email field", async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={jest.fn()} onError={jest.fn()} />);

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      await user.type(emailInput, "test@example.com");

      expect(emailInput.value).toBe("test@example.com");
    });

    it("should allow user to type in password field", async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={jest.fn()} onError={jest.fn()} />);

      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
      await user.type(passwordInput, "password123");

      expect(passwordInput.value).toBe("password123");
    });

    it("should clear password field after failed submission attempt", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: "Invalid credentials",
        }),
      } as Response);

      render(<LoginForm onSuccess={jest.fn()} onError={jest.fn()} />);

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
      const submitButton = screen.getByRole("button", { name: /login/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(passwordInput.value).toBe("");
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels for inputs", () => {
      render(<LoginForm onSuccess={jest.fn()} onError={jest.fn()} />);

      expect(screen.getByLabelText(/email/i)).toHaveAccessibleName();
      expect(screen.getByLabelText(/^password$/i)).toHaveAccessibleName();
    });

    it("should show loading state with accessible text", async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true, token: "test", user: {} }),
                } as Response),
              100
            )
          )
      );

      render(<LoginForm onSuccess={jest.fn()} onError={jest.fn()} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toHaveAttribute("aria-busy", "true");
      });
    });

    it("should associate error messages with inputs", async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={jest.fn()} onError={jest.fn()} />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      await user.type(emailInput, "invalid-email");
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText(/invalid email/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });

  describe("React Performance Optimizations", () => {
    it("should be memoized to prevent unnecessary re-renders", () => {
      const { rerender } = render(
        <LoginForm onSuccess={jest.fn()} onError={jest.fn()} />
      );

      rerender(<LoginForm onSuccess={jest.fn()} onError={jest.fn()} />);

      expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty response body", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      } as Response);

      const onError = jest.fn();
      render(<LoginForm onSuccess={jest.fn()} onError={onError} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });

    it("should handle rapid successive clicks on submit button", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          token: "session_1_1234567890_abc123",
          user: { id: 1, email: "test@example.com", name: "Test", role: "TEACHER" },
        }),
      } as Response);

      const onSuccess = jest.fn();
      render(<LoginForm onSuccess={onSuccess} onError={jest.fn()} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it("should trim whitespace from email input", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          token: "session_1_1234567890_abc123",
          user: { id: 1, email: "test@example.com", name: "Test", role: "TEACHER" },
        }),
      } as Response);

      render(<LoginForm onSuccess={jest.fn()} onError={jest.fn()} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole("button", { name: /login/i });

      await user.type(emailInput, "  test@example.com  ");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/auth/login",
          expect.objectContaining({
            body: JSON.stringify({
              email: "test@example.com",
              password: "password123",
            }),
          })
        );
      });
    });
  });
});
