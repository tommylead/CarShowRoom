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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // Xử lý authentication state
  useEffect(() => {
    let unsubscribeAuth: () => void;
    
    const initializeAuth = async () => {
      if (typeof window === 'undefined') return;

      unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
        console.log('Auth state changed:', currentUser?.displayName);
        
        if (currentUser) {
          try {
            // Lấy token và cập nhật role
            const token = await currentUser.getIdToken();
            Cookies.set('token', token, { expires: 7 });
            
            const tokenResult = await currentUser.getIdTokenResult();
            setIsAdmin(tokenResult.claims.role === 'ADMIN');
            
            // Cập nhật user state
            setUser(currentUser);
          } catch (error) {
            console.error('Error handling auth state change:', error);
            setUser(null);
            setIsAdmin(false);
            Cookies.remove('token');
          }
        } else {
          setUser(null);
          setIsAdmin(false);
          Cookies.remove('token');
        }
        
        setLoading(false);
      });
    };

    initializeAuth();
    
    return () => {
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
    };
  }, []);

  // Đăng nhập với Google
  const signInWithGoogle = async () => {
    setLoading(true);
    const toastId = toast.loading("Đang kết nối với Google...");
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      
      // Log chi tiết thông tin user
      console.log('=== FIREBASE USER DATA ===');
      console.log('Basic Info:', {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        emailVerified: result.user.emailVerified,
        phoneNumber: result.user.phoneNumber,
        isAnonymous: result.user.isAnonymous
      });

      console.log('Metadata:', {
        creationTime: result.user.metadata.creationTime,
        lastSignInTime: result.user.metadata.lastSignInTime
      });

      console.log('Provider Data:', result.user.providerData);

      // Log token result
      const tokenResult = await result.user.getIdTokenResult();
      console.log('Token Info:', {
        token: tokenResult.token.substring(0, 20) + '...', // Chỉ hiện 20 ký tự đầu
        authTime: tokenResult.authTime,
        issuedAtTime: tokenResult.issuedAtTime,
        expirationTime: tokenResult.expirationTime,
        signInProvider: tokenResult.signInProvider,
        claims: tokenResult.claims
      });

      // Cập nhật user state ngay lập tức
      setUser(result.user);
      
      // Lấy token mới
      const token = await result.user.getIdToken(true);
      Cookies.set('token', token, { expires: 7 });
      
      // Kiểm tra role admin
      setIsAdmin(tokenResult.claims.role === 'ADMIN');
      
      toast.success("Đăng nhập thành công!", { id: toastId });
      router.push('/');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      if (error.code !== 'auth/cancelled-popup-request') {
        toast.error(error.message || "Đăng nhập thất bại. Vui lòng thử lại.", { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
      setUser(null);
      setIsAdmin(false);
      Cookies.remove('token');
    } finally {
      setLoading(false);
    }
  };

  // Đăng xuất
  const signOut = async () => {
    const toastId = toast.loading("Đang đăng xuất...");
    
    try {
      await firebaseSignOut(auth);
      Cookies.remove('token');
      setUser(null);
      setIsAdmin(false);
      toast.success('Đã đăng xuất', { id: toastId });
      router.push('/');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Có lỗi xảy ra khi đăng xuất', { id: toastId });
      throw error;
    }
  };

  const contextValue = {
    user,
    loading,
    isAdmin,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 