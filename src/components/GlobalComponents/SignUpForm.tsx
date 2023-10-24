import React, { useState } from "react"
import { auth, googleProvider } from "../../config/firebase"
import { db } from "../../config/firebase"
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { collection, getDocs, where, query } from "firebase/firestore"
import googleIcon from "../../images/google.jpg"
import "./Modal.css"

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
  const [error, setError] = useState<string | null>(null)

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

      if (await checkEmailExists(email)) {
        setError("Email already exists. Please use a different email.")
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
        onSignup()
        onClose()
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <h2>Sign Up</h2>
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
        <button onClick={signUpWithEmail}>Sign Up</button>
        {error && <p className="error-message">{error}</p>}
        <h2>Or sign up with Google</h2>
        <div className="google-signup">
          <button onClick={signInWithGoogle}>
            <img src={googleIcon} alt="Google Icon" /> Sign Up With Google
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignupForm
