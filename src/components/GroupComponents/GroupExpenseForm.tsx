import React, { useState } from "react"
import { Link } from "react-router-dom"
import GroupExpenseFormProps from "../../types/GroupTypes/GroupExpenseFormProps"
import WarningIcon from "../../images/warning.png"

const GroupExpenseForm: React.FC<GroupExpenseFormProps> = ({
  description,
  amount,
  shared,
  selectedMember,
  selectedMemberId,
  groupId,
  groupMembers,
  groupExpenses,
  imageFileName,
  handleDescriptionChange,
  handleAmountChange,
  handleSharedChange,
  handleSelectedMemberChange,
  handleAddExpense,
  handleImageChange,
}) => {
  const itemsPerPage = 4
  const [currentPage, setCurrentPage] = useState(1)

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1)
  }

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1)
  }

  // Calculate which expenses to display based on the current page
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const expensesToDisplay = groupExpenses
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .reverse()
    .slice(startIndex, endIndex)
  const handleCustomUploadClick = () => {
    document.getElementById("fileInput")?.click()
  }
  const formatImageFileName = (fileName: string) => {
    if (fileName && fileName.length > 14) {
      const firstPart = fileName.slice(0, 10)
      const lastPart = fileName.slice(-4)
      return `${firstPart}...${lastPart}`
    }
    return fileName
  }

  return (
    <>
      {groupMembers.length > 1 ? (
        <div>
          <div className="divider" />
          <h2>Add Expense</h2>
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={handleDescriptionChange}
            maxLength={50}
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={handleAmountChange}
          />
          <label>
            Shared equally:
            <input
              type="checkbox"
              checked={shared}
              onChange={handleSharedChange}
            />
          </label>
          <div
            className="custom-upload-button"
            onClick={handleCustomUploadClick}
          >
            <span>Upload Receipt</span>
            <input
              type="file"
              accept="image/*"
              id="fileInput"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>
          {imageFileName && (
            <p>
              Selected Image:{" "}
              {formatImageFileName(imageFileName) || "No image selected"}
            </p>
          )}
          <div>
            <label style={{ marginRight: "10px" }}>
              Paid By: {selectedMember}
            </label>
            <select
              value={selectedMemberId}
              onChange={handleSelectedMemberChange}
            >
              <option value=""></option>
              {groupMembers
                .filter((member) => member.name && member.name.trim() !== "")
                .map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
            </select>
          </div>
          <button
            disabled={
              description.trim() === "" ||
              amount.trim() === "" ||
              selectedMemberId === ""
            }
            onClick={handleAddExpense}
          >
            Add Expense
          </button>
          <div>
            <div className="divider" />
            <h2>Expenses History</h2>
            <ul className="expense-list">
              {expensesToDisplay.map((expense) => (
                <li key={expense.id} className="expense-item">
                  <p>Description: {expense.description}</p>
                  <p>Amount: {expense.amount}</p>
                  <p>Paid By: {expense.payerName}</p>
                  <Link to={`/expense-details/${groupId}/${expense.id}`}>
                    Details
                  </Link>
                </li>
              ))}
            </ul>
            {groupExpenses.length > itemsPerPage && (
              <div className="pagination">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  {"<"}
                </button>
                <span>Page {currentPage}</span>
                <button
                  onClick={handleNextPage}
                  disabled={endIndex >= groupExpenses.length}
                >
                  {">"}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <p style={{ color: "#ff0000bd" }}>
            You need atleast 2 members to add an expense.
          </p>
          <img src={WarningIcon} alt="Loading" width={25} height={25} />
        </div>
      )}
    </>
  )
}

export default GroupExpenseForm
