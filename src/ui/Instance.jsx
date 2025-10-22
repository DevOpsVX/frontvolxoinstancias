
import React, { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000'
const WS_URL = import.meta.env.VITE_WS_URL || API_URL.replace('http', 'ws')
export default function Instance(){
  const { id } = useParams(); const [qr, setQr] = useState(null); const [status, setStatus] = useState('READY_TO_LINK'); const wsRef = useRef(null)
  useEffect(()=>{
    const wsEndpoint = `${WS_URL}/ws/${id}`; const ws = new WebSocket(wsEndpoint); wsRef.current = ws;
    ws.onmessage = (ev)=>{ const msg = JSON.parse(ev.data); if(msg.type==='qr') setQr(msg.data); if(msg.type==='status') setStatus(msg.data) }
    return () => ws.close()
  }, [id])
  return (<div className="container">
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
      <div className="brand"><div className="brand-badge">VX</div> Volxo Whatsapp Connection</div>
      <Link to="/" className="pill">← Voltar</Link>
    </div>
    <div className="card" style={{textAlign:'center'}}>
      <h2 style={{marginTop:0}}>Instância</h2>
      <div className="muted" style={{marginBottom:18}}>Status: <b style={{color:'#2effb8'}}>{status}</b></div>
      {qr ? (<img src={qr} alt="QR Code" style={{width:320, height:320, margin:'0 auto', borderRadius:16, border:'1px solid rgba(0,229,255,.25)', boxShadow:'0 0 24px rgba(0,229,255,.25)'}}/>) : (<p className="muted">Aguardando QR...</p>)}
      <div className="muted" style={{marginTop:16}}>Escaneie o QR com o WhatsApp para conectar.</div>
    </div>
  </div>)
}
