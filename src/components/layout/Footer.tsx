import { GraduationCap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-zinc-100 py-6 px-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-zinc-900 rounded-lg w-7 h-7 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm text-zinc-900 tracking-tight">LectureHub</span>
        </div>
        <span className="text-xs text-zinc-400">2025 LectureHub. All rights reserved</span>
      </div>
    </footer>
  )
}
