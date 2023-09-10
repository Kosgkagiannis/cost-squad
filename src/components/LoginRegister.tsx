import React, { useState } from 'react';
import { auth, googleProvider } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";

interface LoginRegisterProps {
  onUserLogin: () => void;
}

const LoginRegister: React.FC<LoginRegisterProps> = ({ onUserLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const clearError = () => {
    setError(null);
  };

  const signInWithEmail = async () => {
    try {
      clearError();
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      onUserLogin();
    } catch (err:any) {
      setError(err.message); 
    }
  };

  const signInWithGoogle = async () => {
    try {
      clearError();
      await signInWithPopup(auth, googleProvider);
      onUserLogin();
    } catch (err:any) {
      setError(err.message); 
    }
  };

  return (
    <div>
      <input
        placeholder="Email..."
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password..."
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={signInWithEmail}>Sign Up</button>
      <button onClick={signInWithGoogle}>Sign Up With Google</button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default LoginRegister;
