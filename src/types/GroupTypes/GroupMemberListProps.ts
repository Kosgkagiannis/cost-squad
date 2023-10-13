export default interface GroupMemberListProps {
  groupMembers: any[]
  newMember: string
  onMemberInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleAddMember: () => void
  groupId: string
}
