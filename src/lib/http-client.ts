export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export interface HttpClient {
  request<TResponse>(path: string, options?: HttpRequestOptions): Promise<TResponse>
}

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 10_000

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: unknown }
    if (typeof payload.error === 'string') return payload.error
  } catch {
    // Fall through to the status text below.
  }

  return response.statusText || `Request failed with status ${response.status}`
}

/**
 * Minimal JSON client. It stays free of feature types so shared code never
 * depends on a feature implementation.
 */
export function createHttpClient(baseUrl: string): HttpClient {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '')

  return {
    async request<TResponse>(path: string, options: HttpRequestOptions = {}): Promise<TResponse> {
      const { method = 'GET', body, headers = {}, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = options

      const timeoutSignal = AbortSignal.timeout(timeoutMs)
      const response = await fetch(`${normalizedBaseUrl}${path}`, {
        method,
        headers: {
          ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
          ...headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal,
      })

      if (!response.ok) {
        throw new HttpError(response.status, await readErrorMessage(response))
      }

      if (response.status === 204) {
        return undefined as TResponse
      }

      return (await response.json()) as TResponse
    },
  }
}
