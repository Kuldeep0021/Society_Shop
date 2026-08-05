'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  updateEmail,
  updatePassword,
  updateProfile,
  RecaptchaVerifier,
  ConfirmationResult,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured, isAdminUid } from '@/lib/firebase';
import * as demo from '@/lib/store';
import { AppUser } from '@/lib/types';

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  updateAdminProfile: (data: { name?: string; email?: string; password?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAdmin: false,
  sendOtp: async () => {},
  verifyOtp: async () => {},
  loginWithEmail: async () => {},
  updateAdminProfile: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [recaptcha, setRecaptcha] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsub = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const appUser: AppUser = {
            uid: fbUser.uid,
            name: fbUser.displayName || 'Customer',
            phone: fbUser.phoneNumber || '',
            email: fbUser.email || undefined,
          };
          setUser(appUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsub;
    } else {
      // Demo mode
      demo.seedDemoProducts();
      setUser(demo.demoGetUser());
      setLoading(false);
    }
  }, []);

  const sendOtp = useCallback(async (phone: string) => {
    if (isFirebaseConfigured && auth) {
      // Create invisible reCAPTCHA verifier.
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
      setRecaptcha(verifier);
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmationResult(result);
      setPendingPhone(phone);
    } else {
      // Demo mode: simulate OTP. Any 6-digit code works. "OTP" is 123456.
      setPendingPhone(phone);
    }
  }, []);

  const verifyOtp = useCallback(
    async (code: string) => {
      if (isFirebaseConfigured && confirmationResult) {
        const result = await confirmationResult.confirm(code);
        const fbUser = result.user;
        setUser({
          uid: fbUser.uid,
          name: fbUser.displayName || 'Customer',
          phone: fbUser.phoneNumber || pendingPhone || '',
          email: fbUser.email || undefined,
        });
      } else {
        // Demo mode
        const appUser: AppUser = {
          uid: 'demo-user',
          name: 'Demo Customer',
          phone: pendingPhone || '+919999999999',
        };
        demo.demoSetUser(appUser);
        setUser(appUser);
      }
    },
    [confirmationResult, pendingPhone],
  );

  const loginWithEmail = useCallback(async (email: string, pass: string) => {
    if (isFirebaseConfigured && auth) {
      await signInWithEmailAndPassword(auth, email, pass);
    } else {
      throw new Error("Firebase not configured");
    }
  }, []);

  const updateAdminProfile = useCallback(async (data: { name?: string; email?: string; password?: string }) => {
    if (isFirebaseConfigured && auth?.currentUser) {
      const user = auth.currentUser;
      if (data.name) await updateProfile(user, { displayName: data.name });
      if (data.email) await updateEmail(user, data.email);
      if (data.password) await updatePassword(user, data.password);
      
      setUser((prev) => prev ? { ...prev, name: data.name || prev.name, email: data.email || prev.email } : prev);
    } else {
      throw new Error("Not authenticated");
    }
  }, []);

  const logout = useCallback(async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    } else {
      demo.demoSetUser(null);
    }
    setUser(null);
  }, []);

  const isAdmin = isAdminUid(user?.uid);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, sendOtp, verifyOtp, loginWithEmail, updateAdminProfile, logout }}
    >
      {children}
      {/* reCAPTCHA container for Firebase phone auth */}
      <div id="recaptcha-container" />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
