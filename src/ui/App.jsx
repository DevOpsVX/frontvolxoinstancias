
import React, { useEffect, useState } from 'react'
import { listInstances, startInstance, deleteInstance, buildGhlAuthUrlFromBackend } from '../api'
import { Link } from 'react-router-dom'

export default function App(){
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [name, setName] = useState('')
  async function refresh(){ setLoading(true); const r = await listInstances(); setItems(r.data || []); setLoading(false) }
  useEffect(()=>{ refresh() },[])
  async function create(){ const r = await startInstance(name || undefined); if(r.ok){ const url = buildGhlAuthUrlFromBackend(r.instanceId, r.authUrl); window.location.href = url } }
  async function remove(id){ if(!confirm('Apagar esta instância?')) return; await deleteInstance(id); refresh() }
  return (<div className="container">
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
      <div className="brand"><div className="brand-badge">VX</div> Volxo Whatsapp Connection</div>
      <a href="#" className="pill">Tema: Dark Neon</a>
    </div>
    <div className="card" style={{marginBottom:20}}>
      <h3 style={{marginTop:0}}>Criar nova instância</h3>
      <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
        <input className="input" placeholder="Nome da instância (opcional)" value={name} onChange={e=>setName(e.target.value)} style={{maxWidth:360}}/>
        <button className="btn" onClick={create}>+ Nova Instância</button>
        <div className="muted">Você será redirecionada ao GHL para escolher a subconta e autorizar o app.</div>
      </div>
    </div>
    <div className="card">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h3 style={{margin:0}}>Minhas instâncias</h3>
        <button className="btn" onClick={refresh}>Atualizar</button>
      </div>
      {loading ? <p className="muted">Carregando...</p> : (
        <div className="grid" style={{marginTop:16}}>
          {items.length === 0 && <p className="muted">Nenhuma instância ainda.</p>}
          {items.map(i => (
            <div key={i.instanceld} className="card" style={{padding:16}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                <strong>{i.instance_name || i.instanceld}</strong>
                <span className="pill">{i.phone_number ? 'CONNECTED' : 'PENDING'}</span>
              </div>
              <div className="muted" style={{fontSize:14, marginBottom:8}}>ID: {i.instanceld}</div>
              <div className="muted" style={{fontSize:14, marginBottom:12}}>Empresa (GHL): {i.company_id || '-'}</div>
              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                <Link className="btn" to={`/instance/${i.instanceld}`}>Abrir</Link>
                <button className="btn" onClick={()=>remove(i.instanceld)}>Apagar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>)
}
