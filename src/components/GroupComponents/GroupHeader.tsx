import React, { useState, useEffect } from "react"
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
  const [currency, setCurrency] = useState<string>("")

  useEffect(() => {
    const hash = window.location.hash
    const currencyParamIndex = hash.indexOf("currency=")

    if (currencyParamIndex !== -1) {
      const currencyParam = hash.slice(currencyParamIndex + "currency=".length)
      setCurrency(decodeURIComponent(currencyParam))
    }
  }, [])

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
      logsData.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)
      setActivityLogs(logsData)
    } catch (error) {
      console.error("Error fetching activity logs:", error)
    }
  }

  const toggleActivityLogs = async () => {
    if (!showActivityLogs) {
      document.body.classList.add("no-scroll")
      await fetchActivityLogs()
    } else {
      document.body.classList.remove("no-scroll")
    }
    setShowActivityLogs(!showActivityLogs)
    setShowMenu(false)
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
    const convertTimestampToDateTime = (timestamp) => {
      const date = new Date(
        timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
      )
      return date.toLocaleString()
    }
    const dateTimeAdded = convertTimestampToDateTime(log.timestamp)

    switch (log.action) {
      case "MemberAdded":
        return `The user with email "${log.addedBy}" added a member called "${log.memberName}" at ${dateTimeAdded}.`
      case "MemberDeleted":
        return `The user with email "${log.deletedBy}" deleted a member called "${log.memberName}" at ${dateTimeAdded}.`

      case "ExpenseAdded":
        return `The user with email "${log.addedBy}" added an expense of ${log.amount} ${currency} at ${dateTimeAdded}.`

      case "ExpenseDeleted":
        return `The user with email "${log.deletedBy}" deleted an expense of ${log.amount} ${currency} at ${dateTimeAdded}.`
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

        {showActivityLogs && (
          <div className="modal-activity-log">
            <div className="modal-activity-log-main">
              <button
                style={{ position: "absolute", right: "5px", top: "-10px" }}
                onClick={toggleActivityLogs}
              >
                X
              </button>

              {activityLogs.length > 0 ? (
                <h3>Activity Logs for {groupTitle}</h3>
              ) : (
                <h3>No activity recorded yet.</h3>
              )}
              <ul>
                {activityLogs.map((log, index) => (
                  <div key={index}>
                    <li>{renderLogMessage(log)}</li>
                    <br />
                  </div>
                ))}
              </ul>
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
              <button onClick={toggleActivityLogs}>Show Activity Logs</button>

              {isEditingGroupName ? (
                <>
                  <h2 style={{ marginInline: "0.2rem" }}>Edit Squad Name</h2>
                  <input
                    type="text"
                    placeholder="Enter New Squad Name"
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
