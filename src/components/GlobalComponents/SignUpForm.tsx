import React, { useState } from "react"
import { auth, googleProvider } from "../../config/firebase"
import { db } from "../../config/firebase"
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { collection, getDocs, where, query } from "firebase/firestore"
import googleIcon from "../../images/google.jpg"
import "../GlobalComponents/css/Modal.css"

interface SignupFormProps {
  onClose: () => void
  onSignup: () => void
  onUserLogin: () => void
}

const SignupForm: React.FC<SignupFormProps> = ({
  onClose,
  onSignup,
  onUserLogin,
}) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const clearError = () => {
    setError(null)
  }

  const signInWithGoogle = async () => {
    try {
      clearError()
      await signInWithPopup(auth, googleProvider)
      onUserLogin()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const checkEmailExists = async (email: string) => {
    const q = query(collection(db, "users"), where("email", "==", email))

    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty
  }

  const signUpWithEmail = async () => {
    try {
      clearError()
      if (!email.includes("@") || !email.includes(".")) {
        throw new Error("Invalid email format.")
      }

      if (!password) {
      }

      if (password.length < 6) {
        throw new Error("Password should be at least 6 characters.")
      }
      if (await checkEmailExists(email)) {
        setError("Email already exists. Please use a different email.")
      } else {
        if (password !== confirmPassword) {
          setError("Passwords do not match.")
        } else {
          await createUserWithEmailAndPassword(auth, email, password)
          onSignup()
          onClose()
        }
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="modal">
      <div className="modal-content scaleIn">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <h2>Sign Up</h2>
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
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="eye-icon" onClick={togglePasswordVisibility}>
            {showPassword ? "👁️" : "💬"}
          </span>
        </div>
        <div className="password-input">
          <input
            className="login-input"
            placeholder="Confirm Password..."
            type={showPassword ? "text" : "password"}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button onClick={signUpWithEmail}>Sign up</button>
        {error && <p className="error-message">{error}</p>}
        <h2>Or sign up with Google</h2>
        <div className="google-signup">
          <button onClick={signInWithGoogle}>
            <img src={googleIcon} alt="Google Icon" /> Sign up with Google
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignupForm
