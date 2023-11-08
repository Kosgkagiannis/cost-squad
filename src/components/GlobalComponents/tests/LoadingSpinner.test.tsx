import React from "react"
import { render, screen } from "@testing-library/react"
import LoadingSpinner from "../LoadingSpinner"

describe("LoadingSpinner Component", () => {
  it("renders without errors", () => {
    render(<LoadingSpinner />)

    const loadingImage = screen.getByAltText("Loading")
    expect(loadingImage).toBeInTheDocument()
  })
})
