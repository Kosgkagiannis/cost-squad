import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import WelcomeCarousel from "../WelcomeCarousel"

describe("WelcomeCarousel Component", () => {
  it("renders correctly", () => {
    const onComplete = jest.fn()
    render(<WelcomeCarousel onComplete={onComplete} visible={true} />)
    const carouselTitle = screen.getByText("Welcome to CostSquad!")
    expect(carouselTitle).toBeInTheDocument()
  })

  it("navigates through the carousel and calls onComplete", () => {
    const onComplete = jest.fn()
    render(<WelcomeCarousel onComplete={onComplete} visible={true} />)

    let carouselTitle = screen.getByText("Welcome to CostSquad!")
    expect(carouselTitle).toBeInTheDocument()

    const nextButton = screen.getByText(">")
    fireEvent.click(nextButton)

    carouselTitle = screen.getByText("Squads: Share Bills with Ease")
    expect(carouselTitle).toBeInTheDocument()

    fireEvent.click(nextButton)

    carouselTitle = screen.getByText(
      "Quick Expense: Instantly Record Transactions"
    )
    expect(carouselTitle).toBeInTheDocument()

    const finishButton = screen.getByText("Finish")
    fireEvent.click(finishButton)

    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it("navigates and skips", () => {
    const onComplete = jest.fn()
    render(<WelcomeCarousel onComplete={onComplete} visible={true} />)

    // check if the skip button works
    const skipButton = screen.getByText("Skip")
    fireEvent.click(skipButton)

    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
