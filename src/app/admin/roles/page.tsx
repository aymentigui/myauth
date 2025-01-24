import AddRoleButton from '@/components/my/roles/buttons/add-role'
import ListRoles from '@/components/my/roles/roles/list-roles'
import React from 'react'

const RolesPage = () => {
  return (
    <div className='flex flex-col gap-2'>
      <AddRoleButton />
      <ListRoles />
    </div>
  )
}

export default RolesPage
