// src/hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

  // クライアントサイドでのみ実行される checkAuth
    const checkAuth = () => {
        try {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token')
            setIsAuthenticated(!!token)
        }
        } catch (error) {
        console.error('Auth check error:', error)
        } finally {
        setIsLoading(false)
        }
    }

    useEffect(() => {
        checkAuth()
    }, []) // 初回のみ実行

  // hooks/useAuth.ts

    const login = async (token: string) => {
        try {
        console.log('Saving token:', token); // デバッグ用
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
        console.log('Token saved:', localStorage.getItem('token')); // 保存確認用
        } catch (error) {
        console.error('Error saving token:', error);
        }
    };

  const logout = () => {
    try {
      localStorage.removeItem('token')
      setIsAuthenticated(false)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getAuthHeader = () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token from storage:', token);  // トークンの内容を確認
      
      if (!token) {
        console.warn('No token found');
        return {};
      }
  
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      console.log('Generated headers:', headers);  // 生成されたヘッダーを確認
      return headers;
    } catch (error) {
      console.error('Error in getAuthHeader:', error);
      return {};
    }
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    getAuthHeader
  }
}