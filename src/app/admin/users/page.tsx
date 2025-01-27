
import { accessPage2, withAuthorizationPermission2 } from '@/actions/permissions'
import { auth } from '@/auth'
import AddUpdateUserButton from '@/components/my/users/buttons/add-update-user'
import UsersAdminPage from '@/components/my/users/users-list-admin/list-users'
import React from 'react'

const RolesPage = async () => {

  const session=await auth()

  if(!session || !session.user || !session.user.id) {
    return null;
  }
  await accessPage2(session.user.id,['users_view']);
  const hasPermissionView = await withAuthorizationPermission2(session.user.id,['users_view']);
  const hasPermissionAdd = await withAuthorizationPermission2(session.user.id,['users_create']);

  return (
    <div className='flex flex-col gap-2'>
      {hasPermissionAdd.data.hasPermission && <AddUpdateUserButton />}
      {/* <ListUsers /> */}
      {hasPermissionView.data.hasPermission && <UsersAdminPage />}
    </div>
  )
}

export default RolesPage
