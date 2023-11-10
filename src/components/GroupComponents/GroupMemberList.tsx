import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import GroupMemberListProps from "../../types/GroupTypes/GroupMemberListProps"
import LoadingAnimation from "../../images/loading2.gif"
import MembersAnimation from "../../images/members-animation.gif"

const GroupMemberList: React.FC<GroupMemberListProps> = ({
  groupMembers,
  newMember,
  onMemberInputChange,
  handleAddMember,
  groupId,
}) => {
  const [isAddingMembers, setIsAddingMembers] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currency, setCurrency] = useState<string>("")
  const navigate = useNavigate()
  const itemsPerPage = 6
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const hash = window.location.hash
    const currencyParamIndex = hash.indexOf("currency=")

    if (currencyParamIndex !== -1) {
      const currencyParam = hash.slice(currencyParamIndex + "currency=".length)
      setCurrency(decodeURIComponent(currencyParam))
    }
  }, [])

  const cancelAddMembers = () => {
    setIsAddingMembers(false)
  }

  const handleAddMemberAndCloseMenu = () => {
    setIsLoading(true)
    setIsAddingMembers(false)

    setTimeout(() => {
      handleAddMember()
      setIsLoading(false)
    }, 1500)
  }

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1)
  }

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => prevPage - 1)
  }

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = currentPage * itemsPerPage

  return (
    <div>
      {isAddingMembers ? (
        <>
          <input
            type="text"
            placeholder="Enter Member's Name"
            value={newMember}
            onChange={onMemberInputChange}
            maxLength={15}
            data-testid="new-member-input"
          />
          {isLoading ? (
            <img src={LoadingAnimation} width={48} height={48} alt="Loading" />
          ) : (
            <button
              onClick={handleAddMemberAndCloseMenu}
              disabled={newMember.trim() === ""}
              data-testid="add-member-button2"
            >
              Add Member
            </button>
          )}
          <button onClick={cancelAddMembers}>Cancel</button>
        </>
      ) : (
        <div className="delete-button">
          <button
            data-testid="add-member-button"
            onClick={() => setIsAddingMembers(true)}
          >
            Add Member
          </button>
          {isLoading && (
            <img width={48} height={48} alt="Loading" src={LoadingAnimation} />
          )}
        </div>
      )}
      <div className="divider" />
      <div className="title-and-animation">
        <h2>{groupMembers.length > 0 ? "Members" : ""}</h2>
        {groupMembers.length > 0 && (
          <img
            src={MembersAnimation}
            alt="Members animation"
            width={50}
            height={50}
          />
        )}
      </div>
      <div className="grid-container">
        {groupMembers
          .filter((member) => member.name && member.name.trim() !== "")
          .slice(startIndex, endIndex)
          .map((member) => (
            <div key={member.id} className="mobile-profile member-list-item">
              <div className="member-box">
                <img
                  src={member.profilePicture}
                  alt={member.name}
                  className="member-profile-image"
                />
                <p className="member-name">{member.name}</p>
                <button
                  onClick={() =>
                    navigate(
                      `/edit-member/${groupId}/${member.id}?currency=${currency}`
                    )
                  }
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
      </div>
      {groupMembers.length > itemsPerPage && (
        <div className="pagination">
          <button onClick={handlePreviousPage} disabled={currentPage === 1}>
            {"<"}
          </button>
          <span>Page {currentPage}</span>
          <button
            onClick={handleNextPage}
            disabled={endIndex >= groupMembers.length}
          >
            {">"}
          </button>
        </div>
      )}
    </div>
  )
}

export default GroupMemberList
