import React from "react"
import { Link } from "react-router-dom"
import GroupMemberListProps from "../../types/GroupTypes/GroupMemberListProps"

const GroupMemberList: React.FC<GroupMemberListProps> = ({
  groupMembers,
  newMember,
  onMemberInputChange,
  handleAddMember,
  handleDeleteMember,
  groupId,
}) => {
  return (
    <div>
      <h2>Add Members</h2>
      <input
        type="text"
        placeholder="Enter Member's Name"
        value={newMember}
        onChange={onMemberInputChange}
      />
      <button onClick={handleAddMember} disabled={newMember.trim() === ""}>
        Add Member
      </button>
      <h2>Members</h2>
      <ul>
        {groupMembers
          .filter((member) => member.name && member.name.trim() !== "")
          .map((member) => (
            <li key={member.id}>
              {member.name}
              <Link
                className="edit-button"
                to={`/edit-member/${groupId}/${member.id}`}
              >
                Edit
              </Link>
              <button onClick={() => handleDeleteMember(member.id)}>
                Delete
              </button>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default GroupMemberList
