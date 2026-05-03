interface RoleToggleProps {
  roles: string[]
  activeRole: string
  onChange: (role: string) => void
}

export default function RoleToggle({ roles, activeRole, onChange }: RoleToggleProps) {
  return (
    <div className="bg-zinc-100 rounded-full p-1 flex w-full">
      {roles.map((role) => (
        <button
          key={role}
          type="button"
          onClick={() => onChange(role)}
          className={`
            flex-1 py-2 px-8 rounded-full text-sm font-medium transition-all
            ${activeRole === role
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-700'
            }
          `}
        >
          {role}
        </button>
      ))}
    </div>
  )
}
