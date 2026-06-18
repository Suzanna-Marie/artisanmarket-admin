'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, Users, Package, AlertTriangle, Store, Loader2 } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL

type Notif = {
  id: string
  type: 'USER' | 'PRODUIT' | 'LITIGE' | 'ARTISAN'
  message: string
  date: string
  lien: string
}

const icones = {
  USER: <Users className="w-4 h-4" />,
  PRODUIT: <Package className="w-4 h-4" />,
  LITIGE: <AlertTriangle className="w-4 h-4" />,
  ARTISAN: <Store className="w-4 h-4" />,
}

const couleurs = {
  USER: 'bg-blue-100 text-blue-600',
  PRODUIT: 'bg-green-100 text-green-600',
  LITIGE: 'bg-red-100 text-red-600',
  ARTISAN: 'bg-amber-100 text-amber-600',
}

export default function PageNotifications() {
  const [notifications, setNotifications] = useState<Notif[]>([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    fetch(`${API}/admin/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setNotifications(d.notifications || []))
      .finally(() => setChargement(false))
  }, [])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-slate-700" />
        <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
        {notifications.length > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {notifications.length}
          </span>
        )}
      </div>

      {chargement ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-foret" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Aucune notification récente</p>
          <p className="text-slate-400 text-sm mt-1">Les 7 derniers jours sont affichés</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <Link key={n.id} href={n.lien}
              className="flex items-start gap-4 bg-white rounded-xl border border-slate-200 p-4 hover:border-foret/40 hover:shadow-sm transition-all">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${couleurs[n.type]}`}>
                {icones[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{n.message}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(n.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
