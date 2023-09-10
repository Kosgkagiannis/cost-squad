import React, { useState } from 'react';
import { auth, googleProvider } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  UserCredential,
  onAuthStateChanged,
} from 'firebase/auth';

interface LoginRegisterProps {
  onUserLogin: () => void;
}

const LoginRegister: React.FC<LoginRegisterProps> = ({ onUserLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const clearError = () => {
    setError(null);
  };

  const signInWithEmail = async () => {
    try {
      clearError();
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      onUserLogin();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      clearError();
      await signInWithPopup(auth, googleProvider);
      onUserLogin();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Check if the user is already authenticated on page load
  onAuthStateChanged(auth, (user) => {
    if (user) {
      onUserLogin();
    } else {
      // User is signed out.
    }
  });

  const signUpWithEmail = async () => {
    try {
      clearError();
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      onUserLogin();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Log In</h2>
      <input
        placeholder="Email..."
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password..."
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={signInWithEmail}>Log in</button>
      {error && <p className="error-message">{error}</p>}

      <h2 style={{marginBlockStart:'10px'}}>Don't have an account? Sign up here</h2>
      <input
        placeholder="Email..."
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password..."
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={signUpWithEmail}>Sign Up</button>
      <h2>Or sign up with Google</h2>
      <button onClick={signInWithGoogle}>Sign Up With Google</button>
    </div>
  );
};

export default LoginRegister;
