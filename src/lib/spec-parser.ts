import type { OpenAPIV3 } from 'openapi-types'
import type {
  EndpointDef,
  ParameterDef,
  RequestBodyDef,
  ResponseDef,
} from '@/apis/types'

function resolveRef(
  doc: OpenAPIV3.Document,
  ref: string,
): OpenAPIV3.SchemaObject | undefined {
  if (!ref.startsWith('#/')) return undefined
  const parts = ref.slice(2).split('/')
  let current: unknown = doc
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return current as OpenAPIV3.SchemaObject | undefined
}

function schemaToJson(schema: OpenAPIV3.SchemaObject | undefined): Record<string, unknown> {
  if (!schema) return {}
  if (schema.type === 'object' && schema.properties) {
    const result: Record<string, unknown> = {}
    for (const [key, prop] of Object.entries(schema.properties)) {
      const p = prop as OpenAPIV3.SchemaObject
      result[key] = p.example ?? (p.type === 'string' ? '' : p.type === 'number' ? 0 : {})
    }
    return result
  }
  if (schema.example !== undefined) return { example: schema.example }
  return { type: schema.type ?? 'object' }
}

function paramType(param: OpenAPIV3.ParameterObject): string {
  const schema = param.schema as OpenAPIV3.SchemaObject | undefined
  return schema?.type ?? 'string'
}

export function parseOpenApiSpec(doc: OpenAPIV3.Document): EndpointDef[] {
  const endpoints: EndpointDef[] = []

  if (!doc.paths) return endpoints

  for (const [path, pathItem] of Object.entries(doc.paths)) {
    if (!pathItem) continue
    const methods = ['get', 'post', 'put', 'patch', 'delete'] as const

    for (const method of methods) {
      const operation = pathItem[method] as OpenAPIV3.OperationObject | undefined
      if (!operation) continue

      const parameters: ParameterDef[] = (operation.parameters ?? []).map((p) => {
        const param = p as OpenAPIV3.ParameterObject
        return {
          name: param.name,
          in: param.in as ParameterDef['in'],
          type: paramType(param),
          required: param.required ?? false,
          description: param.description ?? '',
          example: String(
            (param.schema as OpenAPIV3.SchemaObject | undefined)?.example ?? '',
          ),
        }
      })

      let requestBody: RequestBodyDef | undefined
      if (operation.requestBody) {
        const rb = operation.requestBody as OpenAPIV3.RequestBodyObject
        const jsonContent = rb.content?.['application/json']
        let schema: OpenAPIV3.SchemaObject | undefined =
          jsonContent?.schema as OpenAPIV3.SchemaObject | undefined
        if (schema && '$ref' in schema && typeof schema.$ref === 'string') {
          schema = resolveRef(doc, schema.$ref)
        }
        const exampleObj = schemaToJson(schema)
        requestBody = {
          description: rb.description ?? '',
          contentType: 'application/json',
          schema: exampleObj,
          example: JSON.stringify(exampleObj, null, 2),
        }
      }

      const responses: ResponseDef[] = Object.entries(operation.responses ?? {}).map(
        ([status, resp]) => {
          const response = resp as OpenAPIV3.ResponseObject
          const jsonContent = response.content?.['application/json']
          let schema = jsonContent?.schema as OpenAPIV3.SchemaObject | undefined
          if (schema && '$ref' in schema && typeof schema.$ref === 'string') {
            schema = resolveRef(doc, schema.$ref)
          }
          return {
            status,
            description: response.description ?? '',
            schema: schema ? schemaToJson(schema) : undefined,
          }
        },
      )

      const operationId =
        operation.operationId ?? `${method}_${path.replace(/[{}]/g, '').replace(/\//g, '_')}`

      endpoints.push({
        id: `${method.toUpperCase()}:${path}`,
        method: method.toUpperCase(),
        path,
        summary: operation.summary ?? operationId,
        description: operation.description ?? '',
        operationId,
        parameters,
        requestBody,
        responses,
        tags: operation.tags ?? ['default'],
      })
    }
  }

  return endpoints
}
