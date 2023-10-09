export default interface GroupMemberListProps {
  groupMembers: any[]
  newMember: string
  onMemberInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleAddMember: () => void
  handleDeleteMember: (memberId: string) => void
  groupId: string
}
