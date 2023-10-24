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
      <div>
        <ul className="ul-members">
          {groupMembers
            .filter((member) => member.name && member.name.trim() !== "")
            .map((member) => (
              <li key={member.id} className="member-list-item">
                <Link
                  style={{ textDecoration: "none", color: "black" }}
                  to={`/edit-member/${groupId}/${member.id}`}
                >
                  <div className="mobile-profile">
                    <div className="member-box">
                      <img
                        src={member.profilePicture}
                        alt={member.name}
                        className="member-profile-image"
                      />
                      <span className="member-name">{member.name}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}

export default GroupMemberList
