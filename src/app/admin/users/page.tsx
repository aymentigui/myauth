
import AddUpdateUserButton from '@/components/my/users/buttons/add-update-user'
import UsersAdminPage from '@/components/my/users/users-list-admin/list-users'
import React from 'react'

const RolesPage = async () => {
  return (
    <div className='flex flex-col gap-2'>
      <AddUpdateUserButton />
      {/* <ListUsers /> */}
      <UsersAdminPage />
    </div>
  )
}

export default RolesPage
