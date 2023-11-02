import React from "react"
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
  const handleCustomUploadClick = () => {
    document.getElementById("fileInput")?.click()
  }
  return (
    <>
      {groupMembers.length > 1 ? (
        <div>
          <h2>Add Expense</h2>
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={handleDescriptionChange}
            maxLength={20}
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
            <p>Selected Image: {imageFileName || "No image selected"}</p>
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
            <h2>Expenses History</h2>
            <ul className="expense-list">
              {groupExpenses.map((expense) => (
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
          <img src={WarningIcon} width={25} height={25} />
        </div>
      )}
    </>
  )
}

export default GroupExpenseForm
