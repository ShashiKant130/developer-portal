export interface SnippetRequest {
  method: string
  url: string
  headers: Record<string, string>
  body?: string
}

/** Escape double quotes for use inside a double-quoted shell argument */
function escapeDoubleQuotes(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

/**
 * Single-line cURL for bash, cmd, and PowerShell (use `curl.exe` on Windows if `curl` is aliased).
 */
export function generateCurl(req: SnippetRequest): string {
  const method = req.method.toUpperCase()
  const parts: string[] = ['curl']

  // Prefer curl.exe on Windows — PowerShell aliases `curl` to Invoke-WebRequest
  if (typeof navigator !== 'undefined' && navigator.userAgent.includes('Windows')) {
    parts[0] = 'curl.exe'
  }

  if (method !== 'GET') {
    parts.push('-X', method)
  }

  parts.push(`"${escapeDoubleQuotes(req.url)}"`)

  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      parts.push('-H', `"${escapeDoubleQuotes(`${key}: ${value}`)}"`)
    }
  }

  if (req.body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    const compact = req.body.replace(/\s+/g, ' ').trim()
    parts.push('-d', `"${escapeDoubleQuotes(compact)}"`)
  }

  return parts.join(' ')
}

export function generateFetch(req: SnippetRequest): string {
  const headers = JSON.stringify(req.headers, null, 2)
  const hasBody =
    req.body && ['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())
  const bodyLine = hasBody ? `,\n  body: JSON.stringify(${req.body})` : ''
  return `const response = await fetch("${req.url}", {
  method: "${req.method.toUpperCase()}",
  headers: ${headers}${bodyLine}
});
const data = await response.json();`
}

export function generatePython(req: SnippetRequest): string {
  const headerLines = Object.entries(req.headers)
    .filter(([, v]) => v)
    .map(([k, v]) => `    "${k}": "${v}",`)
    .join('\n')
  const hasBody =
    req.body && ['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())
  const bodyBlock = hasBody
    ? `\njson_body = ${req.body}\nresponse = requests.${req.method.toLowerCase()}(url, headers=headers, json=json_body)`
    : `\nresponse = requests.${req.method.toLowerCase()}(url, headers=headers)`
  return `import requests

url = "${req.url}"
headers = {
${headerLines}
}${bodyBlock}
data = response.json()`
}
