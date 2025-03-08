'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  onIdTokenChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshToken: async () => undefined,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // Cập nhật token thủ công khi cần
  const refreshToken = async () => {
    if (user) {
      try {
        console.log('[AuthContext] Manually refreshing token...');
        const token = await user.getIdToken(true); // true để force refresh
        Cookies.set('token', token, { expires: 7 });
        
        const tokenResult = await user.getIdTokenResult();
        console.log('[AuthContext] New token claims:', tokenResult.claims);
        setIsAdmin(tokenResult.claims.role === 'ADMIN');
        
        console.log('[AuthContext] Token refreshed successfully, isAdmin:', tokenResult.claims.role === 'ADMIN');
        return token;
      } catch (error) {
        console.error('[AuthContext] Error refreshing token:', error);
      }
    }
  };

  // Xử lý authentication state
  useEffect(() => {
    let unsubscribeAuth: () => void;
    let unsubscribeToken: () => void;
    
    const initializeAuth = async () => {
      if (typeof window === 'undefined') return;

      // Theo dõi thay đổi trạng thái xác thực
      unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
        console.log('[AuthContext] Auth state changed, user:', currentUser?.email);
        
        if (currentUser) {
          try {
            // Lấy token và cập nhật role
            const token = await currentUser.getIdToken();
            Cookies.set('token', token, { expires: 7 });
            
            const tokenResult = await currentUser.getIdTokenResult();
            console.log('[AuthContext] Token claims:', tokenResult.claims);
            
            const hasAdminRole = tokenResult.claims.role === 'ADMIN';
            console.log('[AuthContext] User has admin role:', hasAdminRole);
            setIsAdmin(hasAdminRole);
            
            // Cập nhật user state
            setUser(currentUser);
          } catch (error) {
            console.error('[AuthContext] Error handling auth state change:', error);
            setUser(null);
            setIsAdmin(false);
            Cookies.remove('token');
          }
        } else {
          console.log('[AuthContext] User signed out');
          setUser(null);
          setIsAdmin(false);
          Cookies.remove('token');
        }
        
        setLoading(false);
      });

      // Theo dõi thay đổi token (khi claims được cập nhật)
      unsubscribeToken = onIdTokenChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            console.log('[AuthContext] Token changed, refreshing...');
            const token = await currentUser.getIdToken();
            Cookies.set('token', token, { expires: 7 });
            
            const tokenResult = await currentUser.getIdTokenResult();
            const hasAdminRole = tokenResult.claims.role === 'ADMIN';
            console.log('[AuthContext] Updated claims, isAdmin:', hasAdminRole);
            setIsAdmin(hasAdminRole);
          } catch (error) {
            console.error('[AuthContext] Error handling token change:', error);
          }
        }
      });
    };

    initializeAuth();
    
    return () => {
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
      if (unsubscribeToken) {
        unsubscribeToken();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      toast.success(`Xin chào, ${result.user.displayName || 'bạn'}!`);
      router.push('/');
    } catch (error: any) {
      console.error('Lỗi đăng nhập Google:', error);
      toast.error('Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      Cookies.remove('token');
      toast.success('Đã đăng xuất thành công');
      router.push('/');
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      toast.error('Đăng xuất thất bại');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signInWithGoogle, signOut, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 