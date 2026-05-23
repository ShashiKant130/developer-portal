export interface SandboxRequestInput {
    url: string
    method: string
    headers: Record<string, string>
    body?: string
  }
  
  export interface SandboxResult {
    status: number
    body: string
    latencyMs: number
  }
  
  export async function executeSandboxRequest(
    input: SandboxRequestInput,
  ): Promise<SandboxResult> {
    const start = performance.now()
    const init: RequestInit = {
      method: input.method,
      headers: input.headers,
    }
    if (input.body && ['POST', 'PUT', 'PATCH'].includes(input.method.toUpperCase())) {
      init.body = input.body
    }
  
    const res = await fetch(input.url, init)
    const text = await res.text()
    let formatted = text
    try {
      formatted = JSON.stringify(JSON.parse(text), null, 2)
    } catch {
      /* keep raw */
    }
  
    return {
      status: res.status,
      body: formatted,
      latencyMs: Math.round(performance.now() - start),
    }
  }
  