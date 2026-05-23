import type { ApiDefinition, ChangelogEntry, OpenAPIObject } from './types'
import pokeapiSpec from './pokeapi/openapi.json'
import pokeapiChangelog from './pokeapi/changelog.json'
import pokeapiDocs from './pokeapi/docs.md?raw'
import stubPaymentsSpec from './stub-payments/openapi.json'

const POKEAPI_ERRORS = [
  {
    code: 'POKEMON_NOT_FOUND',
    httpStatus: 404,
    description: 'The requested Pokémon does not exist.',
    causes: ['Invalid name or ID', 'Typo in path parameter'],
    resolution: 'Verify the name against the Pokémon list endpoint.',
  },
  {
    code: 'RATE_LIMITED',
    httpStatus: 429,
    description: 'Too many requests in a short period.',
    causes: ['Exceeded fair-use limits'],
    resolution: 'Backoff exponentially and retry after the Retry-After header.',
  },
]

const PAYMENTS_ERRORS = [
  {
    code: 'INVALID_AMOUNT',
    httpStatus: 400,
    description: 'Payment amount is invalid.',
    causes: ['Negative amount', 'Exceeds account limit'],
    resolution: 'Ensure amount is a positive integer in minor units.',
  },
  {
    code: 'PAYMENT_NOT_FOUND',
    httpStatus: 404,
    description: 'Payment ID does not exist.',
    causes: ['Stale ID', 'Wrong environment'],
    resolution: 'Confirm you are using the correct environment API key.',
  },
]

export const API_REGISTRY: ApiDefinition[] = [
  {
    id: 'pokeapi',
    name: 'PokéAPI',
    version: '2.0.0',
    spec: pokeapiSpec as OpenAPIObject,
    docsMarkdown: pokeapiDocs,
    changelog: pokeapiChangelog as ChangelogEntry[],
    sdks: [
      {
        lang: 'JavaScript',
        install: 'npm install pokeapi-js-wrapper',
        repo: 'https://github.com/PokeAPI/pokeapi-js-wrapper',
      },
      {
        lang: 'Python',
        install: 'pip install pokebase',
        repo: 'https://github.com/pokeapi/pokebase',
      },
    ],
    errors: POKEAPI_ERRORS,
    baseUrl: 'https://pokeapi.co/api/v2',
  },
  {
    id: 'stub-payments',
    name: 'Payments API',
    version: '1.0.0',
    spec: stubPaymentsSpec as OpenAPIObject,
    changelog: [
      {
        version: '1.0.0',
        date: '2025-01-01',
        type: 'feature',
        title: 'Initial release',
        description: 'Payments API stub for portal extensibility testing.',
      },
    ],
    sdks: [
      {
        lang: 'Node.js',
        install: 'npm install @example/payments-sdk',
        repo: 'https://github.com/example/payments-sdk',
      },
    ],
    errors: PAYMENTS_ERRORS,
    baseUrl: 'https://api.example.com/v1',
  },
]