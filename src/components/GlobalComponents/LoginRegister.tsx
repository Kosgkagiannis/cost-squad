import React, { useState } from "react"
import { auth, googleProvider } from "../../config/firebase"
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth"
import "./css/Login-Register.css"
import SignupForm from "./SignUpForm"
import LogoHeader from "../../images/logo-header.jpg"
import googleIcon from "../../images/google.jpg"

interface LoginRegisterProps {
  onUserLogin: () => void
}

const LoginRegister: React.FC<LoginRegisterProps> = ({ onUserLogin }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const clearError = () => {
    setError(null)
  }

  const toggleModal = () => {
    setShowModal(!showModal)
  }

  const signInWithEmail = async () => {
    try {
      clearError()
      await signInWithEmailAndPassword(auth, email, password)
      onUserLogin()
    } catch (err: any) {
      setError(err.message)
    }
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      onUserLogin()
    } else {
    }
  })

  const signInWithGoogle = async () => {
    try {
      clearError()
      await signInWithPopup(auth, googleProvider)
      onUserLogin()
    } catch (err: any) {
      setError(err.message)
    }
  }
  return (
    <div className="login-content">
      <div className="header">
        <div className="logo">
          <img src={LogoHeader} height={48} width={64} alt="Logo" />
          <h1 className="header-title">CostSquad</h1>
        </div>{" "}
      </div>
      <h2>Log In</h2>
      <input
        className="login-input"
        placeholder="Email..."
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="login-input"
        placeholder="Password..."
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={signInWithEmail}>Log in</button>
      {error && <p className="error-message">{error}</p>}
      <h2>Or Log in with Google</h2>
      <div className="google-signup">
        <button onClick={signInWithGoogle}>
          <img src={googleIcon} alt="Google Icon" /> Log In With Google
        </button>
      </div>
      <p style={{ marginBlockStart: "40px" }}>
        Don't have an account? Sign up{" "}
        <span
          className="signup-link"
          onClick={toggleModal}
          style={{
            textDecoration: "underline",
            color: "blue",
            cursor: "pointer",
          }}
        >
          here
        </span>
      </p>

      {showModal && (
        <SignupForm
          onClose={toggleModal}
          onSignup={() => {
            toggleModal()
          }}
          onUserLogin={onUserLogin}
        />
      )}
    </div>
  )
}

export default LoginRegister
