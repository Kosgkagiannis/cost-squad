import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import GroupExpenseFormProps from "../../types/GroupTypes/GroupExpenseFormProps"
import WarningIcon from "../../images/warning.png"

const GroupExpenseForm: React.FC<GroupExpenseFormProps> = ({
  description,
  amount,
  selectedMember,
  selectedMemberId,
  groupId,
  groupMembers,
  groupExpenses,
  imageFileName,
  handleDescriptionChange,
  handleAmountChange,
  handleSelectedMemberChange,
  handleAddExpense,
  handleImageChange,
}) => {
  const itemsPerPage = 4
  const [currentPage, setCurrentPage] = useState(1)
  const [currency, setCurrency] = useState<string>("")
  const navigate = useNavigate()

  useEffect(() => {
    const hash = window.location.hash
    const currencyParamIndex = hash.indexOf("currency=")

    if (currencyParamIndex !== -1) {
      const currencyParam = hash.slice(currencyParamIndex + "currency=".length)
      setCurrency(decodeURIComponent(currencyParam))
    }
  }, [])

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
            id="description-group"
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
          <div style={{ margin: "1rem" }}>
            <label style={{ margin: "10px" }}>Paid By: </label>
            <select
              value={selectedMemberId}
              onChange={handleSelectedMemberChange}
              data-testid="selected-member"
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
                  <p>
                    Amount:{" "}
                    {new Intl.NumberFormat(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 3,
                    }).format(expense.amount)}{" "}
                    {currency}
                  </p>
                  <p>Paid By: {expense.payerName}</p>
                  <button
                    onClick={() =>
                      navigate(
                        `/expense-details/${groupId}/${expense.id}?currency=${currency}`
                      )
                    }
                  >
                    Details
                  </button>
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
