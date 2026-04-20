import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useUserStore } from '../store/useUserStore';
import { User } from '../types';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const login = useUserStore((state) => state.login);
  const logout = useUserStore((state) => state.logout);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If the email is not verified, we might still allow them to read some stuff, but we can instruct them to verify first. 
        // For now let's just log them in. 
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            // Check if they are admin using custom email
            if (firebaseUser.email === 'admin@hoangha.com' || firebaseUser.email === 'hoangthanhgolle@gmail.com' || firebaseUser.email === 'alostore6688@gmail.com' || firebaseUser.email === 'admin@gmail.com') {
              userData.role = 'admin';
            }
            // For Email/Password logins, check if they verified their email
            const isGoogleUser = firebaseUser.providerData.some(p => p.providerId === 'google.com');
            if (!isGoogleUser && !firebaseUser.emailVerified) {
              logout();
              return;
            }
            login({ ...userData, id: firebaseUser.uid, email: firebaseUser.email || '' });
          } else {
            // New user from Google Login possibly
            const isGoogleUser = firebaseUser.providerData.some(p => p.providerId === 'google.com');
            if (isGoogleUser) {
              const newUser: User = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'Google User',
                email: firebaseUser.email || '',
                role: (firebaseUser.email === 'admin@hoangha.com' || firebaseUser.email === 'hoangthanhgolle@gmail.com' || firebaseUser.email === 'alostore6688@gmail.com' || firebaseUser.email === 'admin@gmail.com') ? 'admin' : 'user'
              };
              await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
              login(newUser);
            } else {
              // Registration is handling the doc creation, wait for it
              // Unless they didn't verify email
              if (!firebaseUser.emailVerified) {
                logout();
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        logout();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [login, logout]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  return <>{children}</>;
}
