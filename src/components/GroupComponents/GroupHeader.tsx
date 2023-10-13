import React from "react"

interface GroupHeaderProps {
  groupTitle: string | null
  newGroupName: string
  onGroupNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleUpdateGroupName: () => void
  onDeleteGroup: () => void
}

const GroupHeader: React.FC<GroupHeaderProps> = ({
  groupTitle,
  newGroupName,
  onGroupNameChange,
  handleUpdateGroupName,
  onDeleteGroup,
}) => {
  return (
    <div>
      <h1>{groupTitle || "Group Name"}</h1>
      <button
        onClick={onDeleteGroup}
        style={{ backgroundColor: "red", color: "white" }}
      >
        Delete Group
      </button>
      <h2>Edit Group Name</h2>
      <input
        type="text"
        placeholder="Enter New Group Name"
        value={newGroupName}
        onChange={onGroupNameChange}
        maxLength={20}
      />
      <button
        onClick={handleUpdateGroupName}
        disabled={newGroupName.trim() === ""}
      >
        Update Group Name
      </button>
    </div>
  )
}

export default GroupHeader
