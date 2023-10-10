import React from "react"
import GroupExpenseFormProps from "../../types/GroupTypes/GroupExpenseFormProps"

const GroupExpenseForm: React.FC<GroupExpenseFormProps> = ({
  description,
  amount,
  shared,
  selectedMember,
  selectedMemberId,
  groupMembers,
  groupExpenses,
  handleDescriptionChange,
  handleAmountChange,
  handleSharedChange,
  handleSelectedMemberChange,
  handleAddExpense,
  handleDeleteExpense,
}) => {
  return (
    <div>
      <h2>Add Expense</h2>
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={handleDescriptionChange}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={handleAmountChange}
      />
      <label>
        Shared:
        <input type="checkbox" checked={shared} onChange={handleSharedChange} />
      </label>
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
        <h2>Group Expenses</h2>
        <ul>
          {groupExpenses.map((expense) => (
            <li key={expense.id}>
              <p>Description: {expense.description}</p>
              <p>Amount: {expense.amount}</p>
              <p>Timestamp: {expense.timestamp.toDate().toLocaleString()}</p>
              <p>Paid By: {expense.payerName}</p>
              <p>Shared: {expense.shared ? "Yes" : "No"}</p>
              <button onClick={() => handleDeleteExpense(expense.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default GroupExpenseForm
