import { verifySession } from '@/actions/auth/auth';
import { accessPage2, withAuthorizationPermission2 } from '@/actions/permissions';
import AddRoleButton from '@/app/admin/roles/_component/buttons/add-role'
import ListRoles from '@/app/admin/roles/_component/list-roles'
import { Card } from '@/components/ui/card';
import React from 'react'

const RolesPage = async () => {

  const session = await verifySession()

  if (session.status !== 200 || !session || !session.data.user || !session.data.user.id) {
    return null;
  }
  await accessPage2(session.data.user.id, ['roles_view']);
  const hasPermissionView = await withAuthorizationPermission2(session.data.user.id, ['roles_view']);
  const hasPermissionAdd = await withAuthorizationPermission2(session.data.user.id, ['roles_create']);

  return (
    <Card className='p-4'>
      <div className='flex flex-col gap-2'>
        {hasPermissionAdd.data.hasPermission && <AddRoleButton />}
        {hasPermissionView.data.hasPermission && <ListRoles />}
      </div>
    </Card>
  )
}

export default RolesPage
