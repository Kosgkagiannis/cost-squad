import React, { useState } from "react"
import { query, where, collection, getDocs } from "firebase/firestore"
import { db } from "../../config/firebase"

import SettingsIcon from "../../images/settings.png"

interface GroupHeaderProps {
  groupTitle: string | null
  originalGroupName?: string
  newGroupName: string
  groupId: string
  onGroupNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleUpdateGroupName: () => void
  onDeleteGroup: () => void
}

const GroupHeader: React.FC<GroupHeaderProps> = ({
  groupTitle,
  originalGroupName,
  newGroupName,
  groupId,
  onGroupNameChange,
  handleUpdateGroupName,
  onDeleteGroup,
}) => {
  const [isEditingGroupName, setIsEditingGroupName] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [activityLogs, setActivityLogs] = useState<any[]>([])
  const [showActivityLogs, setShowActivityLogs] = useState(false)

  const fetchActivityLogs = async () => {
    try {
      if (!groupId) {
        console.error("groupId is undefined")
        return
      }

      const activityLogsCollectionRef = collection(db, "activityLogs")
      const logsQuery = query(
        activityLogsCollectionRef,
        where("groupId", "==", groupId)
      )
      const querySnapshot = await getDocs(logsQuery)
      const logsData = querySnapshot.docs.map((doc) => doc.data())
      setActivityLogs(logsData)
    } catch (error) {
      console.error("Error fetching activity logs:", error)
    }
  }

  const toggleActivityLogs = async () => {
    if (!showActivityLogs) {
      await fetchActivityLogs()
    }
    setShowActivityLogs(!showActivityLogs)
  }

  const toggleMenu = () => {
    setShowMenu(!showMenu)
  }

  const cancelEdit = () => {
    setIsEditingGroupName(false)
  }

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const renderLogMessage = (log) => {
    switch (log.action) {
      case "MemberAdded":
        return `The user with email "${log.addedBy}" added a member.`
      case "MemberDeleted":
        return `The user with email "${log.addedBy}" deleted a member.`

      case "ExpenseAdded":
        return `The user with email "${log.addedBy}" added an expense.`

      case "ExpenseDeleted":
        return `The user with email "${log.deletedBy}" deleted an expense.`
      default:
        return "Unknown log action"
    }
  }

  return (
    <div>
      <div className="top-delete-button">
        <h1 data-testid="group-name-title" className="group-title">
          {groupTitle || "Group Name"}
        </h1>
        <button onClick={toggleActivityLogs}>
          {showActivityLogs ? "Hide Activity Logs" : "Show Activity Logs"}
        </button>

        {showActivityLogs && (
          <div className="modal-activity-log">
            <div className="modal-activity-log-main">
              <h3>Activity Logs for {groupTitle}</h3>
              <ul>
                {activityLogs.map((log, index) => (
                  <>
                    <li key={index}>{renderLogMessage(log)}</li>
                    <br />
                  </>
                ))}
              </ul>
              <button onClick={toggleActivityLogs}>Close</button>
            </div>
          </div>
        )}
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
              <p>Squad ID: {groupId}</p>

              {isEditingGroupName ? (
                <>
                  <h2 style={{ marginInline: "0.2rem" }}>Edit Squad Name</h2>
                  <input
                    type="text"
                    placeholder="Enter New Group Name"
                    data-testid="group-name-input"
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
              <button
                onClick={onDeleteGroup}
                style={{ backgroundColor: "#ff0000bd", color: "#ffffffed" }}
              >
                Delete Squad
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GroupHeader
