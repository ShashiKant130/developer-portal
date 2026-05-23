import { CopyButton } from './CopyButton.tsx'

interface CodeBlockProps {
  code: string
  language?: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
      <div className="flex items-start justify-between gap-3 border-b border-slate-700 px-3 py-2">
        {language ? (
          <span className="pt-1 text-xs text-slate-500">{language}</span>
        ) : (
          <span className="pt-1 text-xs text-slate-600">snippet</span>
        )}
        <CopyButton text={code} className="shrink-0 items-end" />
      </div>
      <pre className="overflow-x-auto p-4 text-sm text-slate-300">
        <code>{code}</code>
      </pre>
    </div>
  )
}
