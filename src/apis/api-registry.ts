import type { OpenAPIV3 } from 'openapi-types'

import pokeapiSpec from './pokeapi/openapi.json'
import pokeapiChangelog from './pokeapi/changelog.json'
import stubPaymentsSpec from './stub-payments/openapi.json'

export type ChangelogEntryType = 'breaking' | 'feature' | 'fix'

export interface ChangelogEntry {
  version: string
  date: string
  type: ChangelogEntryType
  title: string
  description: string
}

export interface SdkLink {
  lang: string
  install: string
  repo: string
}

export interface ApiDefinition {
  id: string
  name: string
  version: string
  spec: OpenAPIV3.Document
  docsFile?: string
  changelog?: ChangelogEntry[]
  sdks?: SdkLink[]
  baseUrl: string
}

export const API_REGISTRY: ApiDefinition[] = [
  {
    id: 'pokeapi',
    name: 'PokéAPI',
    version: '2.0.0',
    spec: pokeapiSpec as OpenAPIV3.Document,
    docsFile: './pokeapi/docs.md',
    changelog: pokeapiChangelog as ChangelogEntry[],
    baseUrl: 'https://pokeapi.co/api/v2',
  },
  {
    id: 'stub-payments',
    name: 'Payments API (Stub)',
    version: '1.0.0',
    spec: stubPaymentsSpec as OpenAPIV3.Document,
    baseUrl: 'https://api.example.com/v1',
  },
]
