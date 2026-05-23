import type { OpenAPIV3 } from 'openapi-types'

export type OpenAPIObject = OpenAPIV3.Document

export interface SdkLink {
  lang: string
  install: string
  repo: string
}

export type ChangelogType = 'breaking' | 'feature' | 'fix'

export interface ChangelogEntry {
  version: string
  date: string
  type: ChangelogType
  title: string
  description: string
}

export interface ErrorReference {
  code: string
  httpStatus?: number
  description: string
  causes: string[]
  resolution: string
}

export interface ApiDefinition {
  id: string
  name: string
  version: string
  spec: OpenAPIObject
  docsMarkdown?: string
  changelog?: ChangelogEntry[]
  sdks?: SdkLink[]
  errors?: ErrorReference[]
  baseUrl: string
}

export interface ParameterDef {
  name: string
  in: 'path' | 'query' | 'header' | 'cookie'
  type: string
  required: boolean
  description: string
  example?: string
}

export interface RequestBodyDef {
  description: string
  contentType: string
  schema: Record<string, unknown>
  example?: string
}

export interface ResponseDef {
  status: string
  description: string
  schema?: Record<string, unknown>
}

export interface EndpointDef {
  id: string
  method: string
  path: string
  summary: string
  description: string
  operationId: string
  parameters: ParameterDef[]
  requestBody?: RequestBodyDef
  responses: ResponseDef[]
  tags: string[]
}
