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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, connected, pending
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

  // Filtrar instâncias
  const filteredItems = items.filter((i) => {
    const matchesSearch = 
      (i.instance_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.instanceId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.phone_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'connected' && i.phone_number) ||
      (filterStatus === 'pending' && !i.phone_number);
    
    return matchesSearch && matchesStatus;
  });

  const total = items.length;
  const connected = items.filter((i) => i.phone_number).length;
  const pending = total - connected;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-bg to-card-bg">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-500 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Volxo WhatsApp Manager
            </h1>
          </div>
          <p className="text-muted text-lg">Gerencie suas conexões WhatsApp com GoHighLevel</p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-card-bg to-dark-bg border border-primary/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm mb-1">Total de Instâncias</p>
                <p className="text-3xl font-bold text-white">{total}</p>
              </div>
              <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-card-bg to-dark-bg border border-green-500/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm mb-1">Conectadas</p>
                <p className="text-3xl font-bold text-green-400">{connected}</p>
              </div>
              <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-card-bg to-dark-bg border border-yellow-500/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm mb-1">Pendentes</p>
                <p className="text-3xl font-bold text-yellow-400">{pending}</p>
              </div>
              <div className="w-14 h-14 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Create New Instance */}
        <section className="bg-gradient-to-br from-card-bg to-dark-bg border border-primary/20 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold">Criar Nova Instância</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1 w-full">
              <label className="text-sm text-muted mb-2 block">Nome da Instância</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark-bg/50 border border-primary/30 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-white placeholder-muted"
                placeholder="Ex: Atendimento Principal"
                onKeyPress={(e) => e.key === 'Enter' && create()}
              />
            </div>
            <button
              onClick={create}
              className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-primary/50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Criar Instância
            </button>
          </div>
          <p className="text-muted text-sm mt-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Você será redirecionado ao GHL para escolher a subconta e autorizar o app.
          </p>
        </section>

        {/* Instances List */}
        <section className="bg-gradient-to-br from-card-bg to-dark-bg border border-primary/20 rounded-2xl p-8 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold">Minhas Instâncias</h2>
            </div>
            <button 
              onClick={refresh} 
              className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <svg className="w-5 h-5 text-muted absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, ID ou número..."
                  className="w-full bg-dark-bg/50 border border-primary/30 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary transition-colors text-white placeholder-muted"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-dark-bg/50 text-muted hover:bg-dark-bg'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterStatus('connected')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'connected'
                    ? 'bg-green-500 text-white'
                    : 'bg-dark-bg/50 text-muted hover:bg-dark-bg'
                }`}
              >
                Conectadas
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-dark-bg/50 text-muted hover:bg-dark-bg'
                }`}
              >
                Pendentes
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-muted text-lg">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Nenhuma instância encontrada com os filtros aplicados.' 
                  : 'Nenhuma instância ainda. Crie sua primeira instância acima!'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((i) => (
                <div
                  key={i.instanceId}
                  className="bg-dark-bg border border-primary/10 rounded-xl p-6 hover:border-primary/30 transition-all shadow-lg hover:shadow-xl group"
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      i.phone_number 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        i.phone_number ? 'bg-green-400' : 'bg-yellow-400'
                      } animate-pulse`}></div>
                      {i.phone_number ? 'Conectado' : 'Pendente'}
                    </div>
                  </div>

                  {/* Instance Info */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-xl text-white mb-2 break-all group-hover:text-primary transition-colors">
                      {i.instance_name || i.instanceId}
                    </h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-muted">{i.phone_number || 'Sem número'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-muted text-xs">GHL: {i.company_id || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-primary/10">
                    <button
                      onClick={() => navigate(`/instance/${i.instanceId}`)}
                      className="flex-1 bg-primary/20 hover:bg-primary text-primary hover:text-white font-medium px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Abrir
                    </button>
                    <button
                      onClick={() => remove(i.instanceId)}
                      className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-medium px-4 py-2 rounded-lg transition-all flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
