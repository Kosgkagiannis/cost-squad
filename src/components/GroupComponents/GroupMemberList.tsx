import React from "react"
import { Link } from "react-router-dom"
import GroupMemberListProps from "../../types/GroupTypes/GroupMemberListProps"

const GroupMemberList: React.FC<GroupMemberListProps> = ({
  groupMembers,
  newMember,
  onMemberInputChange,
  handleAddMember,
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
        maxLength={15}
      />
      <button onClick={handleAddMember} disabled={newMember.trim() === ""}>
        Add Member
      </button>
      <h2>Members</h2>
      <ul>
        {groupMembers
          .filter((member) => member.name && member.name.trim() !== "")
          .map((member) => (
            <li key={member.id} className="member-list-item">
              <div className="mobile-profile">
                <img
                  src={member.profilePicture}
                  alt={member.name}
                  className="member-profile-image"
                />
                <span className="member-name">{member.name}</span>
              </div>
              <div className="mobile-actions">
                <Link
                  className="edit-button"
                  to={`/edit-member/${groupId}/${member.id}`}
                >
                  Edit
                </Link>
              </div>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default GroupMemberList
