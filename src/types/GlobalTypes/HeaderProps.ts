import { User } from "firebase/auth"

export default interface HeaderProps {
  user: User | null
  handleLogout: () => void
}
