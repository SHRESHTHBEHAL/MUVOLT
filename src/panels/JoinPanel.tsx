import { useState } from 'react'
import { join } from '../content/join'
import { audio } from '../audio/AudioManager'

type Status = 'idle' | 'sending' | 'sent' | 'failed'

export function JoinPanel() {
  const [status, setStatus] = useState<Status>('idle')

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget).entries())
    setStatus('sending')
    audio.play('click')
    try {
      const res = await fetch(join.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      setStatus(res.ok ? 'sent' : 'failed')
    } catch {
      setStatus('failed')
    }
    audio.play('dock')
  }

  return (
    <div className="stagger space-y-5">
      <ul className="space-y-2">
        {join.why.map((w, i) => (
          <li key={i} className="flex gap-3 text-[13px] text-white/70 leading-relaxed">
            <span className="text-volt shrink-0">▸</span>
            {w}
          </li>
        ))}
      </ul>

      <div className="border border-white/8 p-4">
        <div className="label mb-1">when</div>
        <p className="text-[13px] text-white/70 leading-relaxed">{join.schedule}</p>
      </div>

      {status === 'sent' || status === 'failed' ? (
        <div className="rise border border-volt/40 bg-volt/5 p-4">
          <div className="font-display font-bold text-lg text-white">Docked. We've got you.</div>
          <p className="text-[13px] text-white/70 mt-1 leading-relaxed">
            {status === 'sent'
              ? 'Someone from the crew will reply within a few days.'
              : `The form couldn't reach the server, so write to ${join.email} instead.`}
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <div className="label">interest form</div>
          <input className="field" name="name" placeholder="Name" required autoComplete="name" />
          <input className="field" name="email" type="email" placeholder="Email" required autoComplete="email" />
          <select className="field" name="year" defaultValue="" required>
            <option value="" disabled>Year</option>
            <option>First Year</option>
            <option>Second Year</option>
            <option>Third Year</option>
            <option>Final Year</option>
            <option>Other</option>
          </select>
          <textarea className="field" name="building" placeholder="What do you want to build?" rows={3} />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="relative press bracket w-full py-3 border border-volt text-volt text-xs tracking-[0.3em] uppercase hover:bg-volt hover:text-ink disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending…' : 'Join MUVOLT'}
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {join.socials.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="label hover:text-volt transition-colors">
            {s.label} ↗
          </a>
        ))}
        <a href={`mailto:${join.email}`} className="label hover:text-volt transition-colors">{join.email}</a>
      </div>
    </div>
  )
}
