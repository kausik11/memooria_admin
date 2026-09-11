export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const base =
    typeof window === "undefined"
      ? `${process.env.API_URL || "http://127.0.0.1:4000"}/api`
      : "/api";
  const response = await fetch(`${base}${path}`, {
    ...options,
    cache: "no-store",
    credentials: "include",
    headers: {
      ...(!(options.body instanceof FormData) && {
        "Content-Type": "application/json",
      }),
      ...options.headers,
    },
    signal: options.signal || AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      body.message || "Unable to connect. Please try again.",
      response.status,
    );
  }
  return response.json();
}
export const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
