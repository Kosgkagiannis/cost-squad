import React from "react"
import { render, waitFor } from "@testing-library/react"
import QuickExpense from "../QuickExpense"

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
jest.mock("firebase/firestore", () => ({
  ...jest.requireActual("firebase/firestore"),
  collection: () => ({
    where: jest.fn(),
    getDocs: jest.fn(() => Promise.resolve({})),
  }),
  query: jest.fn(),
}))

test("renders QuickExpense component", async () => {
  const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

  const { getByText } = render(<QuickExpense />)

  await waitFor(() => {
    expect(getByText("Person 1:")).toBeInTheDocument()
    expect(getByText("Person 2:")).toBeInTheDocument()
    expect(getByText("Description (optional):")).toBeInTheDocument()
    expect(getByText("Amount:")).toBeInTheDocument()
    expect(getByText("owes")).toBeInTheDocument()
    expect(getByText("Add Expense")).toBeInTheDocument()
  })

  errorSpy.mockRestore()
})
