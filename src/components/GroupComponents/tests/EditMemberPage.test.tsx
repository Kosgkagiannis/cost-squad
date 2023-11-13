import React from "react"
import { render, waitFor } from "@testing-library/react"
import EditMemberPage from "../EditMemberPage"

jest.mock("react-router-dom", () => ({
  useParams: () => ({ expenseId: "mockExpenseId" }),
  useNavigate: () => jest.fn(),
}))

jest.mock("../../../config/firebase", () => ({
  auth: {
    onAuthStateChanged: (callback: (user: any) => void) => {
      const mockUser = {
        uid: "mockUserId",
      }
      callback(mockUser)
      return jest.fn()
    },
  },
  db: {},
}))

test("renders EditMemberPage component", async () => {
  const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

  const { getByText, getByAltText } = render(<EditMemberPage />)

  await waitFor(() => {
    expect(getByText("Member info")).toBeInTheDocument()
    expect(getByText("Delete member")).toBeInTheDocument()
    expect(getByText("Save changes")).toBeInTheDocument()
    const profileImage = getByAltText("Profile")
    expect(profileImage).toBeInTheDocument()
  })

  errorSpy.mockRestore()
})
