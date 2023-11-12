import React, { useState } from "react"
import { auth, googleProvider } from "../../config/firebase"
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  sendPasswordResetEmail,
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
  const [resetEmail, setResetEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [resetPasswordModal, setResetPasswordModal] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const showSuccessNotification = (message: string) => {
    setNotificationMessage(message)
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
      setNotificationMessage("")
    }, 3000)
  }

  const clearError = () => {
    setError(null)
  }

  const toggleModal = () => {
    setShowModal(!showModal)
  }

  const toggleResetPasswordModal = () => {
    setResetPasswordModal(!resetPasswordModal)
  }

  const sendResetPasswordEmail = async () => {
    try {
      await sendPasswordResetEmail(auth, resetEmail)
      toggleResetPasswordModal()
      showSuccessNotification(
        "Password reset email sent. Please check your email."
      )
    } catch (error) {
      setError(error.message)
    }
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
      <div className="password-input">
        <input
          className="login-input"
          placeholder="Email..."
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="password-input">
        <input
          className="login-input"
          placeholder="Password..."
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <span className="eye-icon" onClick={togglePasswordVisibility}>
          {showPassword ? "👁️" : "💬"}
        </span>
      </div>

      <div className="forgot-password">
        <span
          onClick={toggleResetPasswordModal}
          style={{ cursor: "pointer", color: "#0051ff" }}
        >
          Forgot your password?
        </span>
      </div>
      {showNotification && <p>{notificationMessage}</p>}

      {resetPasswordModal && (
        <div className="password-reset-modal">
          <input
            className="login-input"
            placeholder="Enter your email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
          <button onClick={sendResetPasswordEmail}>
            Send password reset link
          </button>
          <button onClick={toggleResetPasswordModal}>Close</button>
        </div>
      )}

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
            color: "#0051ff",
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
