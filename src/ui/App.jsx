import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listInstances, startInstance, deleteInstance } from '../api.js';

/**
 * Root page listing all existing WhatsApp instances and allowing new ones to be
 * created. This component fetches its data from the backend and keeps state
 * locally. Styling uses Tailwind classes defined in tailwind.config.cjs.
 */
export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  async function refresh() {
    setLoading(true);
    try {
      const r = await listInstances();
      setItems(r.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function create() {
    if (!name.trim()) return;
    try {
      const r = await startInstance(name.trim());
      // Immediately redirect the browser to the GHL OAuth page. The backend
      // returns the correct URL including state (instanceId) embedded.
      window.location.href = r.authUrl;
    } catch (err) {
      console.error(err);
      alert('Erro ao criar instância');
    }
  }

  async function remove(id) {
    if (!window.confirm('Apagar esta instância?')) return;
    try {
      await deleteInstance(id);
      refresh();
    } catch (err) {
      console.error(err);
      alert('Erro ao apagar instância');
    }
  }

  const total = items.length;
  const connected = items.filter((i) => i.phone_number).length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-2">Suas Instâncias</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="bg-primary/20 text-primary px-3 py-1 rounded-full">{total} instâncias</span>
          <span className="bg-green-400/20 text-green-400 px-3 py-1 rounded-full">{connected} conectadas</span>
        </div>
      </header>

      <section className="bg-card-bg p-6 rounded-xl space-y-4">
        <h2 className="text-lg font-semibold">Criar nova instância</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-transparent border border-primary/50 rounded px-3 py-2 outline-none"
            placeholder="Nome da instância"
          />
          <button
            onClick={create}
            className="bg-primary hover:bg-primary/80 text-dark-bg font-semibold px-4 py-2 rounded transition-colors"
          >
            + Nova Instância
          </button>
        </div>
        <p className="text-muted text-sm">Você será redirecionado ao GHL para escolher a subconta e autorizar o app.</p>
      </section>

      <section className="bg-card-bg p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Minhas instâncias</h2>
          <button onClick={refresh} className="text-primary underline text-sm">Atualizar</button>
        </div>
        {loading ? (
          <p>Carregando...</p>
        ) : items.length === 0 ? (
          <p className="text-muted">Nenhuma instância ainda.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {items.map((i) => (
              <div
                key={i.instanceld}
                className="bg-dark-bg border border-primary/10 rounded-lg p-4 flex justify-between"
              >
                <div>
                  <div className={`text-xs mb-2 ${i.phone_number ? 'text-green-400' : 'text-yellow-400'}`}>
                    {i.phone_number ? 'Conectado' : 'Pendente'}
                  </div>
                  <h3 className="font-semibold text-xl break-all">
                    {i.instance_name || i.instanceld}
                  </h3>
                  <div className="text-sm text-muted break-all">
                    {i.phone_number || 'Sem número'}
                  </div>
                  <div className="text-xs text-muted break-all">
                    ID Empresa (GHL): {i.company_id || '-'}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => navigate(`/instance/${i.instanceld}`)}
                    className="text-primary underline text-sm"
                  >
                    Abrir
                  </button>
                  <button
                    onClick={() => remove(i.instanceld)}
                    className="text-red-400 underline text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}