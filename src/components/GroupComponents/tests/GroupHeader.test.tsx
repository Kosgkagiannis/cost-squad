import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import GroupHeader from "../GroupHeader"

const mockProps = {
  groupTitle: "Test Group",
  originalGroupName: "Original Group",
  newGroupName: "New Group",
  onGroupNameChange: jest.fn(),
  handleUpdateGroupName: jest.fn(),
  onDeleteGroup: jest.fn(),
}

describe("GroupHeader", () => {
  it("renders the component with initial group name", () => {
    render(<GroupHeader {...mockProps} />)
    expect(screen.getByTestId("group-name-title")).toHaveTextContent(
      "Test Group"
    )
  })

  it("displays the menu when the settings icon is clicked", () => {
    render(<GroupHeader {...mockProps} />)
    const settingsIcon = screen.getByAltText("Settings Icon")
    fireEvent.click(settingsIcon)
    expect(screen.getByText("Delete Squad")).toBeInTheDocument()
    expect(screen.getByText("Edit Squad Name")).toBeInTheDocument()
  })

  it("allows editing the group name when 'Edit Squad Name' is clicked", () => {
    render(<GroupHeader {...mockProps} />)
    const settingsIcon = screen.getByAltText("Settings Icon")
    fireEvent.click(settingsIcon)
    const editButton = screen.getByText("Edit Squad Name")
    fireEvent.click(editButton)
    expect(screen.getByTestId("group-name-input")).toBeInTheDocument()
    expect(screen.getByText("Update Squad Name")).toBeInTheDocument()
    expect(screen.getByText("Cancel")).toBeInTheDocument()
  })

  it("calls the 'handleUpdateGroupName' function when 'Update Squad Name' is clicked", () => {
    render(<GroupHeader {...mockProps} />)
    const settingsIcon = screen.getByAltText("Settings Icon")
    fireEvent.click(settingsIcon)
    const editButton = screen.getByText("Edit Squad Name")
    fireEvent.click(editButton)
    const updateButton = screen.getByText("Update Squad Name")
    fireEvent.click(updateButton)
    expect(mockProps.handleUpdateGroupName).toHaveBeenCalledTimes(1)
  })

  it("calls the 'onDeleteGroup' function when 'Delete Squad' is clicked", () => {
    render(<GroupHeader {...mockProps} />)
    const settingsIcon = screen.getByAltText("Settings Icon")
    fireEvent.click(settingsIcon)
    const deleteButton = screen.getByText("Delete Squad")
    fireEvent.click(deleteButton)
    expect(mockProps.onDeleteGroup).toHaveBeenCalledTimes(1)
  })
})
