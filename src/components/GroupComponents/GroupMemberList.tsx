import React, { useState } from "react"
import { Link } from "react-router-dom"
import GroupMemberListProps from "../../types/GroupTypes/GroupMemberListProps"

const GroupMemberList: React.FC<GroupMemberListProps> = ({
  groupMembers,
  newMember,
  onMemberInputChange,
  handleAddMember,
  groupId,
}) => {
  const [isAddingMembers, setIsAddingMembers] = useState(false)

  const cancelAddMembers = () => {
    setIsAddingMembers(false)
  }

  return (
    <div>
      <h2>Add Members</h2>
      {isAddingMembers ? (
        <>
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
          <button onClick={cancelAddMembers}>Cancel</button>
        </>
      ) : (
        <button onClick={() => setIsAddingMembers(true)}>Add Members</button>
      )}
      <h2>Members</h2>
      <div className="grid-container">
        {groupMembers
          .filter((member) => member.name && member.name.trim() !== "")
          .map((member) => (
            <Link
              key={member.id}
              style={{ textDecoration: "none", color: "black" }}
              to={`/edit-member/${groupId}/${member.id}`}
            >
              <div className="mobile-profile member-list-item">
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
          ))}
      </div>
    </div>
  )
}

export default GroupMemberList
