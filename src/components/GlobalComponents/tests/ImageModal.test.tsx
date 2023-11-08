import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import ImageModal from "../ImageModal"

describe("ImageModal Component", () => {
  it("renders the image modal with the provided image URL", () => {
    const imageUrl = "https://example.com/image.jpg"
    render(
      <ImageModal
        imageUrl={imageUrl}
        closeModal={() => {}}
        deleteImage={() => {}}
      />
    )

    const image = screen.getByAltText("Fullscreen")
    expect(image).toHaveAttribute("src", imageUrl)
  })

  it("calls closeModal when clicking the close button or outside the modal", () => {
    const closeModalMock = jest.fn()
    render(
      <ImageModal
        imageUrl="https://example.com/image.jpg"
        closeModal={closeModalMock}
        deleteImage={() => {}}
      />
    )

    const closeBtn = screen.getByText("×") // × is the close button text, need to check if the modal closes after clicking it
    fireEvent.click(closeBtn)
    expect(closeModalMock).toHaveBeenCalledTimes(1)

    const modal = screen.getByTestId("image-modal")
    fireEvent.click(modal)
    expect(closeModalMock).toHaveBeenCalledTimes(2)
  })

  it("calls deleteImage when clicking the delete button", () => {
    const deleteImageMock = jest.fn()
    render(
      <ImageModal
        imageUrl="https://example.com/image.jpg"
        closeModal={() => {}}
        deleteImage={deleteImageMock}
      />
    )

    const deleteButton = screen.getByText("Delete")
    fireEvent.click(deleteButton)
    expect(deleteImageMock).toHaveBeenCalledTimes(1)
  })
})
