'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Shield, Eye, EyeOff } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL

export default function PageProfilAdmin() {
  const router = useRouter()
  const [user, setUser] = useState<{ nom: string; prenom: string; email: string } | null>(null)
  const [form, setForm] = useState({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmation: '' })
  const [voir, setVoir] = useState({ ancien: false, nouveau: false, confirm: false })
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')
  const [chargement, setChargement] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('admin_user')
    if (!userData) { router.push('/login'); return }
    setUser(JSON.parse(userData))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur('')
    setSucces('')
    if (form.nouveauMotDePasse !== form.confirmation) {
      setErreur('Les mots de passe ne correspondent pas.')
      return
    }
    if (form.nouveauMotDePasse.length < 8) {
      setErreur('Le nouveau mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setChargement(true)
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch(`${API}/auth/mot-de-passe`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ancienMotDePasse: form.ancienMotDePasse, nouveauMotDePasse: form.nouveauMotDePasse }),
      })
      const data = await res.json()
      if (!res.ok) { setErreur(data.message || 'Erreur.'); return }
      setSucces('Mot de passe modifié avec succès.')
      setForm({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmation: '' })
    } catch {
      setErreur('Erreur serveur. Réessayez.')
    } finally {
      setChargement(false)
    }
  }

  if (!user) return null

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Mon profil</h1>

      {/* Infos admin */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-foret flex items-center justify-center text-white text-xl font-bold">
            {user.prenom?.[0]}{user.nom?.[0]}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-lg">{user.prenom} {user.nom}</p>
            <p className="text-slate-500 text-sm">{user.email}</p>
          </div>
          <div className="ml-auto">
            <span className="flex items-center gap-1.5 bg-foret/10 text-foret text-xs font-semibold px-3 py-1.5 rounded-full">
              <Shield className="w-3.5 h-3.5" /> Super Admin
            </span>
          </div>
        </div>
      </div>

      {/* Changer mot de passe */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Changer le mot de passe</h2>

        {erreur && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-4 border border-red-200">{erreur}</div>}
        {succes && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl mb-4 border border-green-200">{succes}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {(['ancien', 'nouveau', 'confirm'] as const).map((champ) => {
            const labels = { ancien: 'Ancien mot de passe', nouveau: 'Nouveau mot de passe', confirm: 'Confirmer le nouveau mot de passe' }
            const keys = { ancien: 'ancienMotDePasse', nouveau: 'nouveauMotDePasse', confirm: 'confirmation' } as const
            return (
              <div key={champ}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{labels[champ]} *</label>
                <div className="relative">
                  <input
                    type={voir[champ] ? 'text' : 'password'}
                    value={form[keys[champ]]}
                    onChange={e => setForm(f => ({ ...f, [keys[champ]]: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-foret/30 focus:border-foret text-sm"
                  />
                  <button type="button" onClick={() => setVoir(v => ({ ...v, [champ]: !v[champ] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {voir[champ] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )
          })}
          <button type="submit" disabled={chargement}
            className="w-full bg-foret text-white py-3 rounded-xl font-semibold hover:bg-foret/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {chargement && <Loader2 className="w-4 h-4 animate-spin" />}
            Modifier le mot de passe
          </button>
        </form>
      </div>
    </div>
  )
}
