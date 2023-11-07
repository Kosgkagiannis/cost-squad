import React, { useState } from "react"
import SettingsIcon from "../../images/settings.png"

interface GroupHeaderProps {
  groupTitle: string | null
  originalGroupName?: string
  newGroupName: string
  onGroupNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleUpdateGroupName: () => void
  onDeleteGroup: () => void
}

const GroupHeader: React.FC<GroupHeaderProps> = ({
  groupTitle,
  originalGroupName,
  newGroupName,
  onGroupNameChange,
  handleUpdateGroupName,
  onDeleteGroup,
}) => {
  const [isEditingGroupName, setIsEditingGroupName] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const toggleMenu = () => {
    setShowMenu(!showMenu)
  }

  const cancelEdit = () => {
    setIsEditingGroupName(false)
  }

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div>
      <div className="top-delete-button">
        <h1 className="group-title">{groupTitle || "Group Name"}</h1>
        <div className="menu-icon" onClick={toggleMenu}>
          <img
            width={30}
            height={30}
            src={SettingsIcon}
            alt="Settings Icon"
            style={{
              cursor: "pointer",
              transition: "transform 0.3s ease-in-out",
              transform: showMenu ? "rotate(90deg)" : "rotate(0deg)",
            }}
          />
          {showMenu && (
            <div className="menu-dropdown" onClick={stopPropagation}>
              <button
                onClick={onDeleteGroup}
                style={{ backgroundColor: "#ff0000bd", color: "#ffffffed" }}
              >
                Delete Squad
              </button>
              {isEditingGroupName ? (
                <>
                  <h2 style={{ marginInline: "0.2rem" }}>Edit Squad Name</h2>
                  <input
                    type="text"
                    placeholder="Enter New Group Name"
                    value={
                      isEditingGroupName ? newGroupName : originalGroupName
                    }
                    onChange={onGroupNameChange}
                    maxLength={20}
                    style={{ width: "unset", marginInline: "0.3rem" }}
                  />
                  <button
                    onClick={() => {
                      handleUpdateGroupName()
                      setShowMenu(false)
                      setIsEditingGroupName(false)
                    }}
                    disabled={newGroupName.trim() === ""}
                  >
                    Update Squad Name
                  </button>
                  <button onClick={cancelEdit}>Cancel</button>
                </>
              ) : (
                <button onClick={() => setIsEditingGroupName(true)}>
                  Edit Squad Name
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GroupHeader
