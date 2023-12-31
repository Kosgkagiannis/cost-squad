import { User } from "firebase/auth"

export default interface HeaderProps {
  user: User | null | Partial<User>
  handleLogout: () => void
}
