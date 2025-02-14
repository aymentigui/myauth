
import { accessPage2, withAuthorizationPermission2 } from '@/actions/permissions'
import AddUpdateUserButton from '@/app/admin/users/_component/buttons/add-update-user'
import UsersAdminPage from '@/app/admin/users/_component/list-users'
import { Card } from '@/components/ui/card'
import React from 'react'
import { verifySession } from '@/actions/auth/auth'

const RolesPage = async () => {

  const session = await verifySession()

  if (!session || session.status !== 200 || !session.data.user || !session.data.user.id) {
    return null;
  }
  await accessPage2(session.data.user.id, ['users_view']);
  const hasPermissionView = await withAuthorizationPermission2(session.data.user.id, ['users_view']);
  const hasPermissionAdd = await withAuthorizationPermission2(session.data.user.id, ['users_create']);

  return (
    <Card className='p-4 w-full'>
      <div className='flex flex-col gap-2'>
        {hasPermissionAdd.data.hasPermission && <AddUpdateUserButton />}
        {/* <ListUsers /> */}
        {hasPermissionView.data.hasPermission && <UsersAdminPage />}
      </div>
    </Card>
  )
}

export default RolesPage
