import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Button from '../../components/Button';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: number; // 0 = Pending, 1 = Approved, 2 = Rejected
  createdAt: string;
}

const TeamManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Erro ao buscar usuários', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/users/${id}/approve`);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao aprovar usuário', error);
    }
  };

  const handleReject = async (id: string) => {
    if (window.confirm('Tem certeza que deseja rejeitar este usuário?')) {
      try {
        await api.post(`/users/${id}/reject`);
        fetchUsers();
      } catch (error) {
        console.error('Erro ao rejeitar usuário', error);
      }
    }
  };

  if (loading && users.length === 0) {
    return <div className="text-center py-10 italic text-gray-500 animate-pulse">Carregando equipe...</div>;
  }

  const pendingUsers = users.filter(u => u.status === 0);
  const otherUsers = users.filter(u => u.status !== 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* PENDING APPROVALS */}
      {pendingUsers.length > 0 && (
        <div className="bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden flex flex-col mb-8 ring-1 ring-orange-100">
          <div className="px-6 py-4 bg-orange-50 border-b border-orange-100 flex justify-between items-center">
            <h3 className="text-sm font-black text-orange-800 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>
              Aguardando Aprovação ({pendingUsers.length})
            </h3>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="min-w-full divide-y divide-gray-50">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Cargo Solicitado</th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingUsers.map(u => (
                  <tr key={u.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-black uppercase tracking-widest">
                        {u.role === 'Mechanic' ? 'Mecânico' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2 flex justify-end">
                      <button 
                        onClick={() => handleReject(u.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded text-[10px] font-black uppercase transition-colors"
                      >
                        Rejeitar
                      </button>
                      <button 
                        onClick={() => handleApprove(u.id)}
                        className="px-3 py-1.5 bg-green-500 text-white hover:bg-green-600 rounded text-[10px] font-black uppercase transition-colors shadow-sm"
                      >
                        Aprovar Acesso
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ALL USERS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
            Membros da Equipe
          </h3>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-gray-50">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Cargo</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {otherUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{u.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-black uppercase tracking-widest border border-blue-100">
                      {u.role === 'Mechanic' ? 'Mecânico' : 'Administrador'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {u.status === 1 ? (
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-[10px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-1 w-max">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg> Aprovado
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-50 text-red-700 rounded text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-1 w-max">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg> Rejeitado
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {otherUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-400 text-xs italic">Nenhum membro ativo.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default TeamManagement;
