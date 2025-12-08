import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { connectSocket, getInstanceDetails, updateInstanceName, disconnectInstance, reconnectInstance } from '../api.js';

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
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [showManageMenu, setShowManageMenu] = useState(false);

  useEffect(() => {
    // Fetch the instance info from the backend to display its name and
    // connected phone number (if any).
    async function fetchInstance() {
      try {
        const inst = await getInstanceDetails(id);
        setInstance(inst);
        setEditedName(inst.instance_name || inst.instanceId);
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
        setConnectionAttempts((prev) => prev + 1);
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

  async function handleUpdateName() {
    if (!editedName.trim()) return;
    try {
      await updateInstanceName(id, editedName.trim());
      setInstance({ ...instance, instance_name: editedName.trim() });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar nome');
    }
  }

  async function handleDisconnect() {
    if (!window.confirm('Desconectar WhatsApp desta instância?')) return;
    try {
      await disconnectInstance(id);
      setStatus('pending');
      setInstance({ ...instance, phone_number: null });
      alert('WhatsApp desconectado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao desconectar');
    }
  }

  async function handleReconnect() {
    if (!window.confirm('Reconectar WhatsApp? Um novo QR code será gerado.')) return;
    try {
      await reconnectInstance(id);
      setStatus('pending');
      setQr(null);
      setInstance({ ...instance, phone_number: null });
      alert('Reconexão iniciada! Escaneie o novo QR code.');
    } catch (err) {
      console.error(err);
      alert('Erro ao reconectar');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-bg to-card-bg">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/')} 
            className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </button>
        </div>

        {/* Instance Header Card */}
        <div className="bg-gradient-to-br from-card-bg to-dark-bg border border-primary/20 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-500 rounded-xl flex items-center justify-center">
              <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="bg-dark-bg/50 border border-primary/30 rounded-lg px-3 py-2 text-xl font-bold text-white outline-none focus:border-primary"
                    onKeyPress={(e) => e.key === 'Enter' && handleUpdateName()}
                  />
                  <button
                    onClick={handleUpdateName}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedName(instance?.instance_name || instance?.instanceId || '');
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {instance?.instance_name || 'Instância'}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              )}
              <p className="text-muted text-sm">ID: {id}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                status === 'connected' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                <div className={`w-2.5 h-2.5 rounded-full ${
                  status === 'connected' ? 'bg-green-400' : 'bg-yellow-400'
                } animate-pulse`}></div>
                {status === 'connected' ? 'Conectado' : 'Aguardando Conexão'}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowManageMenu(!showManageMenu)}
                  className="bg-primary/20 hover:bg-primary/30 text-primary p-2 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                {showManageMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-card-bg border border-primary/20 rounded-xl shadow-xl z-10">
                    <div className="p-2">
                      {status === 'connected' ? (
                        <>
                          <button
                            onClick={() => {
                              handleReconnect();
                              setShowManageMenu(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-3 text-yellow-400"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reconectar WhatsApp
                          </button>
                          <button
                            onClick={() => {
                              handleDisconnect();
                              setShowManageMenu(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-3 text-red-400"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            Desconectar WhatsApp
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            handleReconnect();
                            setShowManageMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-3 text-primary"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Gerar Novo QR Code
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {instance?.company_id && (
            <div className="flex items-center gap-2 text-sm text-muted bg-dark-bg/50 px-4 py-2 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>GoHighLevel Company ID: <span className="text-white font-mono">{instance.company_id}</span></span>
            </div>
          )}
        </div>

        {/* Connection Status */}
        {status === 'connected' ? (
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-2xl p-8 shadow-xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-400 mb-2">WhatsApp Conectado!</h2>
              <p className="text-muted mb-4">Sua instância está pronta para enviar e receber mensagens</p>
              <div className="bg-dark-bg/50 rounded-xl p-4 inline-block">
                <p className="text-sm text-muted mb-1">Número Conectado</p>
                <p className="text-2xl font-bold text-white">{instance?.phone_number}</p>
              </div>
            </div>

            {/* Connection Info */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-dark-bg/50 rounded-xl p-4 text-center">
                <svg className="w-8 h-8 text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-xs text-muted">Status</p>
                <p className="text-sm font-medium text-white">Online</p>
              </div>
              <div className="bg-dark-bg/50 rounded-xl p-4 text-center">
                <svg className="w-8 h-8 text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-xs text-muted">Conexão</p>
                <p className="text-sm font-medium text-white">Estável</p>
              </div>
              <div className="bg-dark-bg/50 rounded-xl p-4 text-center">
                <svg className="w-8 h-8 text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-xs text-muted">Segurança</p>
                <p className="text-sm font-medium text-white">Criptografado</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-card-bg to-dark-bg border border-primary/20 rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Conectar WhatsApp</h2>
              <p className="text-muted">Escaneie o QR Code abaixo com o WhatsApp para conectar sua instância</p>
            </div>

            {/* QR Code Display */}
            <div className="flex flex-col items-center">
              {qr ? (
                <div className="relative">
                  <div className="bg-white p-6 rounded-2xl shadow-2xl">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`}
                      alt="QR Code"
                      className="w-72 h-72"
                    />
                  </div>
                  {connectionAttempts > 1 && (
                    <div className="absolute -top-3 -right-3 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Tentativa {connectionAttempts}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-dark-bg/50 border-2 border-dashed border-primary/30 rounded-2xl p-12 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
                  <p className="text-muted">Gerando QR Code...</p>
                </div>
              )}

              {/* Instructions */}
              <div className="mt-8 bg-dark-bg/50 rounded-xl p-6 max-w-md">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Como conectar
                </h3>
                <ol className="space-y-3 text-sm text-muted">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span>Abra o WhatsApp no seu celular</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span>Toque em <strong className="text-white">Mais opções</strong> (⋮) ou <strong className="text-white">Configurações</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span>Selecione <strong className="text-white">Aparelhos conectados</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <span>Toque em <strong className="text-white">Conectar um aparelho</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold">5</span>
                    <span>Aponte seu celular para esta tela para escanear o código</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="bg-gradient-to-br from-card-bg to-dark-bg border border-primary/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <h3 className="font-semibold text-white mb-1">Segurança e Privacidade</h3>
              <p className="text-sm text-muted">
                Sua conexão é criptografada de ponta a ponta. Mantemos seus dados seguros e nunca compartilhamos suas informações com terceiros.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
