import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Bell, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, CreditCard, Download, LayoutDashboard, Menu, Plus, Search, Settings, Sparkles, Tag, Target, TrendingUp, Wallet, X } from 'lucide-react'
import { hasSupabaseConfig, supabase } from './supabase'

const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const initialTransactions = [
  { id: 1, name: 'Gaji bulanan', category: 'Pekerjaan', date: '2026-10-01', amount: 12500000, type: 'income', icon: '💼', color: 'blue' },
  { id: 2, name: 'Belanja bulanan', category: 'Belanja', date: '2026-10-02', amount: 685000, type: 'expense', icon: '🛒', color: 'orange' },
  { id: 3, name: 'Kopi & brunch', category: 'Makanan', date: '2026-10-03', amount: 124000, type: 'expense', icon: '☕', color: 'yellow' },
  { id: 4, name: 'Tagihan internet', category: 'Tagihan', date: '2026-10-04', amount: 365000, type: 'expense', icon: '🌐', color: 'purple' },
  { id: 5, name: 'Freelance design', category: 'Freelance', date: '2026-10-05', amount: 2250000, type: 'income', icon: '✦', color: 'green' },
  { id: 6, name: 'Transportasi', category: 'Transportasi', date: '2026-10-06', amount: 185000, type: 'expense', icon: '🚕', color: 'pink' },
  { id: 7, name: 'Makan malam', category: 'Makanan', date: '2026-10-07', amount: 248000, type: 'expense', icon: '🍜', color: 'yellow' },
  { id: 8, name: 'Langganan streaming', category: 'Hiburan', date: '2026-10-08', amount: 99000, type: 'expense', icon: '🎬', color: 'purple' },
]
const starterChart = [
  { day: '01', expense: 420000, income: 0 }, { day: '03', expense: 180000, income: 0 }, { day: '05', expense: 690000, income: 2250000 },
  { day: '07', expense: 310000, income: 0 }, { day: '09', expense: 470000, income: 0 }, { day: '11', expense: 280000, income: 0 },
  { day: '13', expense: 510000, income: 0 }, { day: '15', expense: 390000, income: 0 }, { day: '17', expense: 620000, income: 0 },
  { day: '19', expense: 240000, income: 0 }, { day: '21', expense: 460000, income: 0 }, { day: '23', expense: 330000, income: 0 },
  { day: '25', expense: 570000, income: 0 }, { day: '27', expense: 350000, income: 0 }, { day: '29', expense: 440000, income: 0 },
]
const seedKey = 'ruangdana-seeded-v1'
function getInitialTransactions() {
  try {
    const saved = JSON.parse(localStorage.getItem('ruangdana-transactions') || 'null')
    if (saved) return saved
    if (!localStorage.getItem(seedKey)) return initialTransactions
    return []
  } catch { return initialTransactions }
}
function rupiah(value) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value) }
function shortRupiah(value) { return `Rp ${(value / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt` }
function categoryIcon(category, type) { return category === 'Makanan' ? '🍜' : category === 'Belanja' ? '🛒' : category === 'Transportasi' ? '🚕' : category === 'Tagihan' ? '💡' : type === 'income' ? '💼' : '✨' }
function AuthScreen({ email, setEmail, password, setPassword, authMode, setAuthMode, handleAuth, authLoading, authError, authMessage }) {
  return <main className="auth-screen"><form className="auth-card" onSubmit={handleAuth}>
    <a className="brand auth-brand" href="#top"><span className="brand-mark"><Wallet size={19}/></span><span>ruang<span className="brand-light">dana</span></span></a>
    <div className="eyebrow"><span/> DATA KEUANGAN PRIBADI</div>
    <h1>{authMode === 'signin' ? 'Selamat datang' : 'Buat akun RuangDana'}</h1>
    <p className="auth-subtitle">Masuk untuk menyimpan dan membuka transaksi di semua perangkatmu.</p>
    <label className="form-label">Email<input type="email" autoComplete="email" required placeholder="nama@email.com" value={email} onChange={e=>setEmail(e.target.value)}/></label>
    <label className="form-label">Password<input type="password" autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'} minLength="6" required placeholder="Minimal 6 karakter" value={password} onChange={e=>setPassword(e.target.value)}/></label>
    {authError && <div className="auth-alert error-alert">{authError}</div>}{authMessage && <div className="auth-alert success-alert">{authMessage}</div>}
    <button className="button button-primary auth-submit" disabled={authLoading}>{authLoading ? 'Memproses…' : authMode === 'signin' ? 'Masuk' : 'Buat akun'}</button>
    <p className="auth-switch">{authMode === 'signin' ? 'Belum punya akun?' : 'Sudah punya akun?'} <button type="button" onClick={()=>setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}>{authMode === 'signin' ? 'Daftar' : 'Masuk'}</button></p>
    <small className="auth-privacy">Transaksi hanya dapat dibaca oleh akun yang membuatnya.</small>
  </form></main>
}
function App() {
  const [transactions, setTransactions] = useState(() => hasSupabaseConfig ? [] : getInitialTransactions())
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(!hasSupabaseConfig)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [authMode, setAuthMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState('')
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())
  const [modal, setModal] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [filter, setFilter] = useState('Semua')
  const [query, setQuery] = useState('')
  const [form, setForm] = useState({ name: '', category: 'Makanan', amount: '', type: 'expense', date: new Date().toISOString().slice(0, 10) })
  useEffect(() => {
    if (!hasSupabaseConfig) return undefined
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setAuthError(error.message)
      setSession(data?.session ?? null)
      setAuthReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthError('')
      setAuthMessage('')
    })
    return () => subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (!hasSupabaseConfig || !session?.user) return
    let cancelled = false
    setDataLoading(true)
    setDataError('')
    supabase.from('transactions').select('id,name,category,amount,type,transaction_date').order('transaction_date', { ascending: false }).then(({ data, error }) => {
      if (cancelled) return
      if (error) setDataError(`Gagal memuat transaksi: ${error.message}`)
      else setTransactions(data.map(row => ({ id: row.id, name: row.name, category: row.category, amount: Number(row.amount), type: row.type, date: row.transaction_date, icon: categoryIcon(row.category, row.type), color: row.type === 'income' ? 'green' : 'orange' })))
      setDataLoading(false)
    })
    return () => { cancelled = true }
  }, [session?.user?.id])
  const monthTransactions = useMemo(() => transactions.filter(t => { const d = new Date(`${t.date}T00:00:00`); return d.getMonth() === month && d.getFullYear() === year }), [transactions, month, year])
  const income = monthTransactions.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0)
  const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0)
  const balance = income - expenses
  const shown = monthTransactions.filter(t => (filter === 'Semua' || (filter === 'Pemasukan' ? t.type === 'income' : t.type === 'expense')) && t.name.toLowerCase().includes(query.toLowerCase()))
  function moveMonth(delta) { let m = month + delta, y = year; if (m < 0) { m = 11; y-- } if (m > 11) { m = 0; y++ } setMonth(m); setYear(y) }
  async function handleAuth(e) {
    e.preventDefault(); setAuthLoading(true); setAuthError(''); setAuthMessage('')
    const result = authMode === 'signin'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    if (result.error) setAuthError(result.error.message)
    else if (authMode === 'signup' && !result.data.session) setAuthMessage('Akun berhasil dibuat. Periksa email untuk konfirmasi sebelum masuk.')
    setAuthLoading(false)
  }
  async function handleSignOut() { await supabase.auth.signOut(); setTransactions([]) }
  async function saveTransaction(e) {
    e.preventDefault()
    if (!form.name.trim() || Number(form.amount) <= 0) return
    const item = { name: form.name.trim(), category: form.category, amount: Number(form.amount), type: form.type, date: form.date, icon: categoryIcon(form.category, form.type), color: form.type === 'income' ? 'green' : 'orange' }
    if (hasSupabaseConfig) {
      const { data, error } = await supabase.from('transactions').insert({ name: item.name, category: item.category, amount: item.amount, type: item.type, transaction_date: item.date }).select('id,name,category,amount,type,transaction_date').single()
      if (error) { setDataError(`Transaksi gagal disimpan: ${error.message}`); return }
      item.id = data.id
    } else {
      item.id = Date.now()
      const next = [item, ...transactions]
      localStorage.setItem('ruangdana-transactions', JSON.stringify(next))
      localStorage.setItem(seedKey, 'true')
    }
    setTransactions(current => [item, ...current]); setDataError(''); setModal(false); setForm(current => ({ ...current, name: '', amount: '' }))
  }
  function exportCsv() { const rows = [['Tanggal','Nama','Kategori','Tipe','Jumlah'], ...monthTransactions.map(t => [t.date,t.name,t.category,t.type,t.amount])]; const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(',')).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff'+csv], {type:'text/csv;charset=utf-8'})); a.download = `ruangdana-${year}-${String(month+1).padStart(2,'0')}.csv`; a.click(); URL.revokeObjectURL(a.href) }
  const dailyTotals = new Map()
  monthTransactions.forEach(t => {
    const day = String(new Date(`${t.date}T00:00:00`).getDate()).padStart(2, '0')
    const current = dailyTotals.get(day) || { day, expense: 0, income: 0 }
    current[t.type] += t.amount
    dailyTotals.set(day, current)
  })
  const chartData = monthTransactions.length
    ? [...dailyTotals.values()].sort((a, b) => a.day.localeCompare(b.day)).map(p => ({ ...p, expense: p.expense / 1000000, income: p.income / 1000000 }))
    : starterChart.map(p => ({ ...p, expense: p.expense / 1000000, income: p.income / 1000000 }))
  const budgetLimits = { Makanan: 2000000, Belanja: 2500000, Transportasi: 1500000 }
  const budgetTotal = Object.values(budgetLimits).reduce((sum, value) => sum + value, 0)
  const categorySpending = Object.keys(budgetLimits).map(category => ({
    category,
    amount: monthTransactions.filter(t => t.type === 'expense' && t.category === category).reduce((sum, t) => sum + t.amount, 0),
    limit: budgetLimits[category],
    icon: category === 'Makanan' ? '🍜' : category === 'Belanja' ? '🛍️' : '🚕',
    mark: category === 'Makanan' ? 'food-mark' : category === 'Belanja' ? 'shop-mark' : 'transport-mark',
    color: category === 'Makanan' ? '#ffb36a' : category === 'Belanja' ? '#a19cf8' : '#67cdb0',
  }))
  const spentBudget = categorySpending.reduce((sum, category) => sum + category.amount, 0)
  if (hasSupabaseConfig && !authReady) return <main className="auth-screen"><div className="auth-loading">Menghubungkan ke RuangDana…</div></main>
  if (hasSupabaseConfig && !session) return <AuthScreen email={email} setEmail={setEmail} password={password} setPassword={setPassword} authMode={authMode} setAuthMode={setAuthMode} handleAuth={handleAuth} authLoading={authLoading} authError={authError} authMessage={authMessage}/>
  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <a className="brand" href="#top"><span className="brand-mark"><Wallet size={19}/></span><span>ruang<span className="brand-light">dana</span></span><button className="close-nav" onClick={()=>setMobileNav(false)}><X size={20}/></button></a>
      <div className="workspace"><div className="avatar">M</div><div><b>Mario's workspace</b><small>Personal account</small></div><ChevronDown size={15} className="muted-icon"/></div>
      <span className="nav-label">MENU UTAMA</span><nav><a className="nav-item active" href="#overview"><LayoutDashboard size={18}/> Ringkasan</a><a className="nav-item" href="#transactions"><ArrowLeftRight size={18}/> Transaksi</a><a className="nav-item" href="#budget"><Target size={18}/> Anggaran <span className="nav-count">3</span></a><a className="nav-item" href="#reports"><TrendingUp size={18}/> Laporan</a></nav>
      <div className="sidebar-bottom"><div className="upgrade-card"><div className="upgrade-spark"><Sparkles size={16}/></div><b>Kenali pola uangmu</b><p>Lihat insight personal dari kebiasaan finansialmu.</p><a href="#reports">Jelajahi insight <span>↗</span></a></div><a className="nav-item" href="#settings"><Settings size={18}/> Pengaturan</a><a className="nav-item" href="#help"><CircleHelp size={18}/> Pusat bantuan</a><div className="profile"><div className="avatar avatar-profile">M</div><div><b>Mario Pratama</b><small>Personal plan</small></div><ChevronDown size={15} className="muted-icon"/></div></div>
    </aside>
    {mobileNav && <button aria-label="Tutup menu" className="mobile-backdrop" onClick={()=>setMobileNav(false)}/>}
    <main className="main-content" id="top">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-button" aria-label="Buka menu" onClick={()=>setMobileNav(true)}><Menu size={20}/></button><span className="breadcrumb">Workspace <ChevronRight size={14}/> <b>Ringkasan</b></span></div><div className="topbar-actions"><button className="icon-button" aria-label="Cari"><Search size={18}/></button><button className="icon-button notification" aria-label="Notifikasi"><Bell size={18}/><i/></button><span className="topbar-divider"/>{hasSupabaseConfig ? <><span className="signed-email">{session.user.email}</span><button className="button button-secondary signout-button" onClick={handleSignOut}>Keluar</button></> : <button className="avatar avatar-top">M</button>}</div></header>
      <section className="page-wrap" id="overview">{hasSupabaseConfig && (dataLoading || dataError) && <div className={`data-notice ${dataError ? 'error-notice' : ''}`}>{dataError || 'Memuat transaksi dari Supabase…'}</div>}{!hasSupabaseConfig && <div className="data-notice demo-notice">Mode demo lokal — atur kredensial Supabase untuk login dan sinkronisasi antarperangkat.</div>}<div className="page-heading"><div><div className="eyebrow"><span/> RUANG KONTROL FINANSIALMU</div><h1>Ringkasan</h1><p>Pantau perjalanan uangmu, satu keputusan baik setiap hari.</p></div><div className="heading-actions"><button className="button button-secondary month-select"><CalendarDays size={16}/>{monthNames[month]} {year}<ChevronDown size={15}/></button><button className="button button-primary" onClick={()=>setModal(true)}><Plus size={17}/> Tambah transaksi</button></div></div>
      <div className="period-bar"><button className="period-arrow" aria-label="Bulan sebelumnya" onClick={()=>moveMonth(-1)}><ChevronLeft size={17}/></button><span>{monthNames[month]} <b>{year}</b></span><button className="period-arrow" aria-label="Bulan berikutnya" onClick={()=>moveMonth(1)}><ChevronRight size={17}/></button><span className="period-dot"/><span className="period-caption">Data bulan ini</span></div>
      <div className="stats-grid">
        <article className="stat-card balance-card"><div className="stat-top"><span className="stat-label">Total saldo bersih</span><span className="stat-icon balance-icon"><Wallet size={18}/></span></div><div className="stat-value">{rupiah(balance)}</div><div className="stat-foot"><span className="trend-pill"><TrendingUp size={13}/> 12,8%</span><span>dibanding bulan lalu</span></div><div className="balance-orb orb-one"/><div className="balance-orb orb-two"/></article>
        <article className="stat-card"><div className="stat-top"><span className="stat-label">Total pemasukan</span><span className="stat-icon income-icon"><ArrowDownLeft size={19}/></span></div><div className="stat-value">{rupiah(income)}</div><div className="stat-foot"><span className="trend-text positive"><TrendingUp size={13}/> 8,2%</span><span>dibanding bulan lalu</span></div><div className="mini-bars income-bars"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article>
        <article className="stat-card"><div className="stat-top"><span className="stat-label">Total pengeluaran</span><span className="stat-icon expense-icon"><ArrowUpRight size={19}/></span></div><div className="stat-value">{rupiah(expenses)}</div><div className="stat-foot"><span className="trend-text positive"><TrendingDownIcon/> 4,6%</span><span>lebih hemat bulan ini</span></div><div className="mini-bars expense-bars"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article>
      </div>
      <div className="content-grid"><section className="panel spending-panel"><div className="panel-header"><div><h2>Arus kas</h2><p>Lihat pola pemasukan dan pengeluaranmu</p></div><button className="select-small">30 hari terakhir <ChevronDown size={14}/></button></div><div className="chart-legend"><span><i className="legend-dot income-dot"/> Pemasukan</span><span><i className="legend-dot expense-dot"/> Pengeluaran</span><span className="chart-total">Saldo bersih <b>{rupiah(balance)}</b></span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{top: 12, right: 6, left: -20, bottom: 0}}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#13b89a" stopOpacity={0.16}/><stop offset="100%" stopColor="#13b89a" stopOpacity={0}/></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9295f7" stopOpacity={0.2}/><stop offset="100%" stopColor="#9295f7" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#eef0f5" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize:11,fill:'#9aa0af'}} tickMargin={12}/><YAxis axisLine={false} tickLine={false} tick={{fontSize:11,fill:'#9aa0af'}} tickFormatter={v=>`${v} jt`} tickCount={4}/><Tooltip formatter={(v,n)=>[`${v.toLocaleString('id-ID')} jt`,n==='income'?'Pemasukan':'Pengeluaran']} labelFormatter={v=>`Tanggal ${v} ${monthNames[month]}`} contentStyle={{border:'1px solid #edf0f5',borderRadius:12,fontSize:12,boxShadow:'0 8px 24px #1b254012'}}/><Area type="monotone" dataKey="income" stroke="#13b89a" strokeWidth={2.5} fill="url(#incomeFill)"/><Area type="monotone" dataKey="expense" stroke="#9295f7" strokeWidth={2.5} fill="url(#expenseFill)"/></AreaChart></ResponsiveContainer></div><div className="chart-insight"><span className="insight-icon"><Sparkles size={14}/></span><span><b>Insight bulan ini:</b> Pengeluaran paling tinggi terjadi di kategori makanan.</span><a href="#reports">Lihat detail <span>→</span></a></div></section>
      <section className="panel budget-panel" id="budget"><div className="panel-header"><div><h2>Anggaran</h2><p>Penggunaan batas bulanan</p></div><button className="more-button" aria-label="Opsi anggaran">•••</button></div><div className="budget-total"><div><span>Total terpakai</span><b>{shortRupiah(spentBudget)}</b></div><div className="budget-limit"><span>dari</span><b>{shortRupiah(budgetTotal)}</b></div></div><div className="budget-progress"><span style={{width:`${Math.min(spentBudget / budgetTotal * 100, 100)}%`}}/></div><div className="budget-meta"><span>{(spentBudget / budgetTotal * 100).toLocaleString('id-ID',{maximumFractionDigits:1})}% anggaran terpakai</span><span><b>{shortRupiah(Math.max(budgetTotal - spentBudget, 0))}</b> tersisa</span></div><div className="budget-divider"/><div className="category-list">{categorySpending.map(c=><div className="category-row" key={c.category}><span className={`category-mark ${c.mark}`}>{c.icon}</span><div className="category-info"><div><b>{c.category}</b><span>{shortRupiah(c.amount)} <i>/ {shortRupiah(c.limit)}</i></span></div><div className="category-track"><i style={{width:`${Math.min(c.amount / c.limit * 100, 100)}%`,background:c.color}}/></div></div></div>)}</div><a className="budget-link" href="#reports">Kelola semua anggaran <span>→</span></a></section></div>
      <section className="panel transactions-panel" id="transactions"><div className="panel-header transaction-heading"><div><h2>Transaksi terbaru</h2><p>Semua aktivitas uangmu di satu tempat</p></div><div className="transaction-actions"><button className="button button-secondary export-button" onClick={exportCsv}><Download size={15}/> Ekspor</button><button className="view-all" onClick={()=>setFilter('Semua')}>Lihat semua <span>→</span></button></div></div><div className="table-toolbar"><div className="filter-tabs">{['Semua','Pemasukan','Pengeluaran'].map(f=><button key={f} className={filter===f?'selected':''} onClick={()=>setFilter(f)}>{f}{f==='Semua'&&<span className="tab-count">{monthTransactions.length}</span>}</button>)}</div><label className="table-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari transaksi..."/></label></div><div className="transaction-table"><div className="table-head"><span>TRANSAKSI</span><span>KATEGORI</span><span>TANGGAL</span><span>JUMLAH</span></div>{shown.length ? shown.slice(0,7).map(t=><div className="table-row" key={t.id}><div className="transaction-name"><span className={`transaction-icon ${t.color}`}>{t.icon}</span><div><b>{t.name}</b><small>{t.type==='income'?'Pemasukan':'Pengeluaran'}</small></div></div><span className="category-chip"><Tag size={12}/>{t.category}</span><span className="transaction-date">{new Date(`${t.date}T00:00:00`).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}</span><b className={`transaction-amount ${t.type}`}>{t.type==='income'?'+':'−'} {rupiah(t.amount)}</b></div>) : <div className="empty-state">Belum ada transaksi untuk filter ini.</div>}</div><div className="table-footer"><span>Menampilkan <b>{Math.min(shown.length,7)}</b> dari <b>{shown.length}</b> transaksi</span><button onClick={exportCsv}>Unduh laporan <Download size={13}/></button></div></section>
      <footer className="footer"><span>© 2026 RuangDana</span><span>Dibuat untuk keputusan finansial yang lebih baik <span className="footer-heart">♥</span></span><a href="#help">Butuh bantuan?</a></footer>
    </section></main>
    {modal && <div className="modal-overlay" onMouseDown={e=>e.target===e.currentTarget&&setModal(false)}><form className="modal-card" onSubmit={saveTransaction}><div className="modal-head"><div><h2>Tambah transaksi</h2><p>Catat uang masuk atau keluar</p></div><button type="button" className="icon-button" onClick={()=>setModal(false)}><X size={19}/></button></div><div className="type-toggle"><button type="button" className={form.type==='expense'?'active expense-active':''} onClick={()=>setForm({...form,type:'expense'})}><ArrowUpRight size={16}/> Pengeluaran</button><button type="button" className={form.type==='income'?'active income-active':''} onClick={()=>setForm({...form,type:'income'})}><ArrowDownLeft size={16}/> Pemasukan</button></div><label className="form-label">Nama transaksi<input autoFocus required placeholder="Contoh: Belanja mingguan" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label className="form-label">Jumlah (Rp)<input required type="number" min="1" placeholder="0" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></label><div className="form-two"><label className="form-label">Kategori<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Makanan</option><option>Belanja</option><option>Transportasi</option><option>Tagihan</option><option>Hiburan</option><option>Kesehatan</option><option>Pekerjaan</option><option>Freelance</option><option>Lainnya</option></select></label><label className="form-label">Tanggal<input required type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label></div><div className="modal-actions"><button type="button" className="button button-secondary" onClick={()=>setModal(false)}>Batal</button><button type="submit" className="button button-primary"><Plus size={16}/> Simpan transaksi</button></div></form></div>}
  </div>
}
function TrendingDownIcon() { return <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 4.5 6.1 8.6l3-3 4.9 4.9M10.5 10.5H14v-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> }
export default App
