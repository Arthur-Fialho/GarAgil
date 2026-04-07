import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import api from '../../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@garagil.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao realizar login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Mock Google SSO for the prototype
    login('mock-google-sso-token', { name: 'Google Admin', email: 'admin@garagil.com' });
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <div className="flex justify-center text-primary mb-2">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.7 14.3L21.7 15.3L19.7 13.3L20.7 12.3C20.8 12.2 20.9 12.1 21.1 12.1C21.2 12.1 21.4 12.2 21.5 12.3L22.8 13.6C22.9 13.8 22.9 14.1 22.7 14.3M13 19.9V22H15.1L21.2 15.9L19.2 13.9L13 19.9M11.6 15.6C10 16.3 8.3 16.5 6.7 16.2L11 11.9L9 9.9L4.7 14.2C4.1 12.3 4.4 10.3 5.4 8.7L2.4 5.7C2 5.3 2 4.7 2.4 4.3C2.8 3.9 3.4 3.9 3.8 4.3L6.8 7.3C9.3 5.3 12.9 5.2 15.6 6.8L12.5 9.9L14.6 11.9L17.7 8.8C18.6 10.7 18.3 12.8 17.1 14.4L18.6 15.9L20 14.5C20.6 13.1 20.8 11.5 20.3 10C20.2 9.5 20 9 19.7 8.6L22.3 6C22.7 5.6 22.7 5 22.3 4.6C21.9 4.2 21.3 4.2 20.9 4.6L18.2 7.2C17.4 6 16.2 5 14.8 4.4C12.4 3.4 9.6 3.6 7.4 5L4.4 2C4 1.6 3.4 1.6 3 2C2.6 2.4 2.6 3 3 3.4L6 6.4C4.3 8.8 4.2 12.1 5.6 14.6L2.6 17.6C2.2 18 2.2 18.6 2.6 19C3 19.4 3.6 19.4 4 19L7 16C8.8 17.1 10.8 17.3 12.8 16.8L11.6 15.6Z" />
            </svg>
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
            GarAgil Workspace
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Acesso restrito para administradores
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 p-3 rounded-md border border-red-200 text-sm text-red-600 text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm shadow-sm"
                placeholder="admin@garagil.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm shadow-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button type="submit" disabled={isLoading} className="w-full py-2.5 shadow-md">
              {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
            </Button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou continuar com</span>
              </div>
            </div>

            <div className="mt-6">
              <Button type="button" variant="secondary" className="w-full flex items-center justify-center gap-2" onClick={handleGoogleLogin}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                Google SSO
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
