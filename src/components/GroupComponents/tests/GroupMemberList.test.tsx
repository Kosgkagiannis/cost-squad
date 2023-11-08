import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom" // Import MemoryRouter
import GroupMemberList from "../GroupMemberList" // Import your component

const mockProps = {
  groupMembers: [
    { id: 1, name: "Member 1", profilePicture: "profile1.jpg" },
    { id: 2, name: "Member 2", profilePicture: "profile2.jpg" },
  ],
  newMember: "",
  onMemberInputChange: jest.fn(),
  handleAddMember: jest.fn(),
  groupId: "testGroupId",
}

test("renders the component with initial members", () => {
  render(
    <MemoryRouter>
      <GroupMemberList {...mockProps} />
    </MemoryRouter>
  )

  expect(screen.getByTestId("add-member-button")).toBeInTheDocument()
  expect(screen.getAllByText("Edit")).toHaveLength(
    mockProps.groupMembers.length
  )
})
