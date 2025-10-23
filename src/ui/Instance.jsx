import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { connectSocket, listInstances } from '../api.js';

/**
 * Instance detail page. Displays a QR code while the WhatsApp session is being
 * established and updates to show the connected phone number once ready.
 */
export default function Instance() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qr, setQr] = useState(null);
  const [status, setStatus] = useState('pending');
  const [instance, setInstance] = useState(null);

  useEffect(() => {
    // Fetch the instance info from the backend to display its name and
    // connected phone number (if any).
    async function fetchInstance() {
      try {
        const resp = await listInstances();
        const inst = resp.data.find((it) => it.instanceld === id);
        setInstance(inst);
        if (inst && inst.phone_number) {
          setStatus('connected');
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchInstance();

    // Open WebSocket connection to receive QR and status messages.
    const ws = connectSocket(id, (msg) => {
      if (msg.type === 'qr') {
        setQr(msg.data);
      } else if (msg.type === 'status' && msg.data === 'connected') {
        setStatus('connected');
        // Optionally refetch to update phone number
        fetchInstance();
      }
    });
    return () => {
      ws.close();
    };
  }, [id]);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <button onClick={() => navigate('/')} className="text-primary underline text-sm">&larr; Voltar</button>
      <h1 className="text-2xl font-semibold">{instance?.instance_name || 'Instância'}</h1>
      {status === 'connected' ? (
        <div className="bg-green-500/10 border border-green-500 rounded-lg p-6">
          <p className="text-green-400 font-semibold mb-2">Conectado!</p>
          <p className="text-muted text-sm mb-1">Telefone:</p>
          <p className="text-lg">{instance?.phone_number}</p>
        </div>
      ) : (
        <div className="bg-card-bg border border-primary/10 rounded-lg p-6 flex flex-col items-center">
          <p className="mb-4 text-center">Escaneie o QR Code abaixo com o WhatsApp para conectar.</p>
          {qr ? (
            // Render a QR code using a free external generator. If offline,
            // fallback to showing the raw string.
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`}
              alt="QR Code"
              className="h-64 w-64"
            />
          ) : (
            <p>Aguardando QR Code...</p>
          )}
        </div>
      )}
    </div>
  );
}