import React from "react"
import { Link } from "react-router-dom"
import GroupExpenseFormProps from "../../types/GroupTypes/GroupExpenseFormProps"

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
  handleDeleteExpense,
  handleImageChange,
}) => {
  const handleCustomUploadClick = () => {
    document.getElementById("fileInput")?.click()
  }
  return (
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
        <input type="checkbox" checked={shared} onChange={handleSharedChange} />
      </label>
      <div className="custom-upload-button" onClick={handleCustomUploadClick}>
        <span>Upload Image</span>
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
        <label style={{ marginRight: "10px" }}>Paid By: {selectedMember}</label>
        <select value={selectedMemberId} onChange={handleSelectedMemberChange}>
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
  )
}

export default GroupExpenseForm
