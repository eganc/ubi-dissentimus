import { copy } from "@/lib/copy";

interface ErrorBody {
  error?: string;
}

// A failed fetch's error message: the server's own message when it sent
// one, otherwise a message that's honest about whether this was a bad
// request (4xx) or an unexpected failure (5xx) — never one mistaken for
// the other.
export function errorMessageFrom(response: Response, body: ErrorBody | null): string {
  if (body?.error) return body.error;
  return response.status >= 500 ? copy.errors.serverError : copy.errors.invalidRequest;
}
