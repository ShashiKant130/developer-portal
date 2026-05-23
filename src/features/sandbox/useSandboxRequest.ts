import { useMutation } from '@tanstack/react-query'
import {
  executeSandboxRequest,
  type SandboxRequestInput,
  type SandboxResult,
} from './sandbox-api.ts'

export function useSandboxRequest() {
  return useMutation<SandboxResult, Error, SandboxRequestInput>({
    mutationFn: executeSandboxRequest,
  })
}
