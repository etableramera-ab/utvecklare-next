'use client'

interface Props {
  text: string
  label?: string
}

export function AnswerBlock({ text, label = "Snabbsvar" }: Props) {
  return (
    <div className="bg-[#6366F1]/5 border-l-4 border-[#6366F1] rounded-r-lg p-4 mb-6">
      <p className="text-xs text-[#6366F1] uppercase font-semibold mb-1 tracking-wide">{label}</p>
      <p className="text-sm text-foreground leading-relaxed">{text}</p>
    </div>
  )
}
