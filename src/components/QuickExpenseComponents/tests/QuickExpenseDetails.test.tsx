import React from "react"
import { render, waitFor, fireEvent } from "@testing-library/react"
import QuickExpenseDetails from "../QuickExpenseDetails"

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

test("renders QuickExpenseDetails component", async () => {
  const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true)

  const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

  const { getByText } = render(<QuickExpenseDetails />)

  await waitFor(() => {
    expect(getByText("Expense Details")).toBeInTheDocument()
  })

  fireEvent.click(getByText("Delete Expense"))

  expect(confirmSpy).toHaveBeenCalled()

  confirmSpy.mockClear()
  errorSpy.mockRestore()
})
