import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

function getErrMsg(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) return err.response?.data?.message ?? fallback;
  return fallback;
}

export function useAuth() {
  const { token, user, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (res) => {
      setAuth(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.email.split('@')[0]}! 🎯`);
      navigate('/board');
    },
    onError: (err) => toast.error(getErrMsg(err, 'Login failed')),
  });

  const registerMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.register(email, password),
    onSuccess: (res) => {
      setAuth(res.data.token, res.data.user);
      toast.success('Account created! Time to job hunt! 🕵️');
      navigate('/board');
    },
    onError: (err) => toast.error(getErrMsg(err, 'Registration failed')),
  });

  const logout = () => {
    clearAuth();
    navigate('/login');
    toast('Logged out. Good luck! 🍀', { icon: '👋' });
  };

  return {
    token,
    user,
    isAuthenticated: !!token,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout,
  };
}
