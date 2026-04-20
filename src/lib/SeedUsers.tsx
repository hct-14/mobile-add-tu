import { useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

interface SeedUser {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
}

const SEED_USERS: SeedUser[] = [
  { email: 'admin@gmail.com', password: '123456', name: 'Admin User', role: 'admin' },
  { email: 'test@gmail.com', password: '123456', name: 'Test User', role: 'user' },
];

export default function SeedUsers() {
  useEffect(() => {
    const seedUsers = async () => {
      for (const user of SEED_USERS) {
        try {
          // Try to create user
          const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
          
          // Create Firestore user document
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            id: userCredential.user.uid,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: new Date().toISOString(),
          });
          
          console.log(`✅ Seed user created: ${user.email}`);
        } catch (error: any) {
          // If user already exists, that's fine
          if (error.code === 'auth/email-already-in-use') {
            console.log(`ℹ️ User already exists: ${user.email}`);
          } else if (error.code === 'auth/weak-password') {
            console.warn(`⚠️ Weak password for: ${user.email}`);
          } else if (error.code === 'auth/invalid-email') {
            console.warn(`⚠️ Invalid email: ${user.email}`);
          }
          // auth/invalid-credential means Email/Password sign-in is not enabled - we can ignore this
          else if (error.code !== 'auth/invalid-credential') {
            console.error(`❌ Error creating ${user.email}:`, error.code);
          }
        }
      }
    };

    // Delay seeding to ensure Firebase is initialized
    const timer = setTimeout(seedUsers, 2000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
