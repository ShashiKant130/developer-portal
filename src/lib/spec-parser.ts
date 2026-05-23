import type { OpenAPIV3 } from 'openapi-types'

export interface EndpointParam {
  name: string
  in: 'path' | 'query' | 'header' | 'cookie'
  required: boolean
  description?: string
  schema?: OpenAPIV3.SchemaObject
}

export interface EndpointDef {
  id: string
  method: string
  path: string
  summary?: string
  description?: string
  parameters: EndpointParam[]
}

/** Parse an OpenAPI 3.x document into a flat list of endpoints. */
export function parseOpenApiSpec(spec: OpenAPIV3.Document): EndpointDef[] {
  const endpoints: EndpointDef[] = []
  const httpMethods = [
    'get',
    'post',
    'put',
    'patch',
    'delete',
    'options',
    'head',
  ] as const

  for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
    if (!pathItem) continue

    for (const method of httpMethods) {
      const operation = pathItem[method]
      if (!operation) continue

      endpoints.push({
        id: `${method.toUpperCase()} ${path}`,
        method: method.toUpperCase(),
        path,
        summary: operation.summary,
        description: operation.description,
        parameters: (operation.parameters ?? []).map((param) => {
          if ('$ref' in param) {
            return {
              name: param.$ref,
              in: 'query' as const,
              required: false,
            }
          }
          return {
            name: param.name,
            in: param.in as EndpointParam['in'],
            required: Boolean(param.required),
            description: param.description,
            schema: param.schema as OpenAPIV3.SchemaObject | undefined,
          }
        }),
      })
    }
  }

  return endpoints
}
