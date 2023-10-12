export default interface GroupExpenseFormProps {
  description: string
  amount: string
  shared: boolean
  selectedMember: string
  selectedMemberId: string
  groupMembers: any[]
  groupExpenses: any[]
  debts: any[]
  imageFile: File | null
  groupId: string
  imageFileName: string | null
  handleDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSharedChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSelectedMemberChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  handleAddExpense: () => void
  handleDeleteExpense: (expenseId: string) => void
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}
