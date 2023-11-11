import React from "react"
import { render } from "@testing-library/react"
import CreateGroupPage from "../CreateGroupPage"

jest.mock("../GroupCreationForm", () => {
  return jest.fn(() => <div data-testid="group-creation-form" />)
})

describe("CreateGroupPage Component", () => {
  it("renders CreateGroupPage with GroupCreationForm", async () => {
    const { getByTestId } = render(<CreateGroupPage />)
    expect(getByTestId("group-creation-form")).toBeInTheDocument()
  })
})
