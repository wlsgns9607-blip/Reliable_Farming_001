import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInAnonymously, GoogleAuthProvider, signInWithPopup, OAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserProfile, updateUserProfile } from '../services/db';
import { UserProfile } from '../types';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginAnonymously: (displayName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithNaver: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const p = await getUserProfile(user.uid);
        if (p) {
          setProfile(p as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || "농부님",
            role: 'farmer',
            createdAt: new Date(),
          };
          await updateUserProfile(user.uid, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const loginAnonymously = async (displayName?: string) => {
    setLoading(true);
    try {
      const result = await signInAnonymously(auth);
      if (displayName && result.user) {
        const newProfile: UserProfile = {
          uid: result.user.uid,
          displayName: displayName,
          role: 'farmer',
          createdAt: new Date(),
        };
        await updateUserProfile(result.user.uid, newProfile);
        setProfile(newProfile);
      }
    } catch (error: any) {
      console.error("Login attempt failed, trying local fallback:", error);
      
      // If anonymous login is restricted by admin, network fails, or any permission issue
      // provide a local-only session fallback to ensure the user can still use the app
      const localUid = `local_${Math.random().toString(36).substr(2, 9)}`;
      const guestName = displayName || "익명 농부님";
      
      const guestUser = {
        uid: localUid,
        displayName: guestName,
        email: null,
        isAnonymous: true,
      } as User;

      const guestProfile: UserProfile = {
        uid: localUid,
        displayName: guestName,
        role: 'farmer',
        createdAt: new Date(),
      };

      setUser(guestUser);
      setProfile(guestProfile);
      
      toast.success("기획자님, 로컬 모드로 시작합니다!");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Google login failed:", error);
      alert(`구글 로그인 실패: ${error.message}`);
    }
  };

  const loginWithNaver = async () => {
    try {
      const response = await fetch('/api/auth/naver/url');
      if (!response.ok) throw new Error('네이버 로그인 URL을 가져올 수 없습니다.');
      const { url } = await response.json();

      const authWindow = window.open(url, 'naver_login', 'width=500,height=600');
      
      const handleMessage = async (event: MessageEvent) => {
        // Validate origin
        const origin = event.origin;
        if (!origin.endsWith('.run.app') && !origin.includes('localhost')) return;

        if (event.data?.type === 'NAVER_AUTH_SUCCESS') {
          const naverUser = event.data.user;
          
          // 파이어베이스 익명 로그인을 통해 세션을 유지하면서 네이버 프로필 정보 연동
          const result = await signInAnonymously(auth);
          
          const newProfile: UserProfile = {
            uid: result.user.uid,
            displayName: naverUser.nickname || naverUser.name || "네이버 농부님",
            role: 'farmer',
            createdAt: new Date(),
          };
          
          await updateUserProfile(result.user.uid, newProfile);
          setProfile(newProfile);
          toast.success(`${newProfile.displayName}님, 환영합니다!`);
          window.removeEventListener('message', handleMessage);
        } else if (event.data?.type === 'NAVER_AUTH_ERROR') {
          toast.error(`네이버 로그인 실패: ${event.data.error}`);
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);
    } catch (error: any) {
      console.error("Naver login flow error:", error);
      toast.error(`네이버 로그인 중 오류 발생: ${error.message}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginAnonymously, loginWithGoogle, loginWithNaver }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
