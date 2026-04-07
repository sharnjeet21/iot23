import React, { useState } from 'react'

const ProfileModal = ({ onClose }) => {
  const [name, setName] = useState('System Administrator')
  const [email, setEmail] = useState('admin@cybershield.local')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 1500)
  }

  const stats = [
    { label: 'Clearance Level', value: 'Level 4' },
    { label: 'Role',            value: 'SOC Analyst' },
    { label: 'Session',         value: new Date().toLocaleDateString() },
    { label: 'Access',          value: 'Full System' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-surface rounded-xl border border-outline-variant shadow-2xl p-6 w-96 max-w-full" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline font-bold text-on-surface uppercase tracking-widest">👤 Profile</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-tertiary text-xl transition-colors">✕</button>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-3xl ring-2 ring-primary/20">👤</div>
          <div>
            <p className="font-headline font-bold text-on-surface">{name}</p>
            <p className="text-xs text-on-surface-variant font-mono">{email}</p>
            <span className="text-[9px] bg-secondary-container text-on-secondary px-2 py-0.5 rounded font-bold uppercase mt-1 inline-block">
              Level 4 Clearance
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {stats.map(({ label, value }) => (
            <div key={label} className="bg-surface-dim rounded-lg p-2 border border-outline-variant">
              <div className="text-[9px] text-on-surface-variant uppercase font-headline font-bold tracking-widest">{label}</div>
              <div className="text-xs font-bold text-on-surface mt-0.5">{value}</div>
            </div>
          ))}
        </div>

        {/* Edit fields */}
        <div className="space-y-3 mb-5">
          <div>
            <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-1 tracking-widest">Display Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-surface-dim border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:border-primary text-on-surface" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-on-surface-variant mb-1 tracking-widest">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-surface-dim border border-outline-variant rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-primary text-on-surface" />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-outline-variant rounded-lg text-xs font-bold uppercase text-on-surface-variant hover:bg-surface-container transition-colors">
            Cancel
          </button>
          <button onClick={handleSave}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase transition-all ${saved ? 'bg-secondary text-on-primary' : 'bg-primary text-on-primary hover:brightness-110 active:scale-95'}`}>
            {saved ? '✅ Saved!' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileModal
