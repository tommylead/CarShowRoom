import { User as FirebaseUser } from 'firebase/auth';

export interface CustomUser extends FirebaseUser {
  role?: 'USER' | 'ADMIN';
}

// Mở rộng module firebase/auth để thêm các trường tùy chỉnh
declare module 'firebase/auth' {
  interface User extends CustomUser {}
} 