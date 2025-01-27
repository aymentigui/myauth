import { verifySession } from '@/actions/auth/auth';
import { accessPage2, withAuthorizationPermission2 } from '@/actions/permissions';
import { auth } from '@/auth';
import AddRoleButton from '@/components/my/roles/buttons/add-role'
import ListRoles from '@/components/my/roles/roles/list-roles'
import React from 'react'

const RolesPage = async () => {

  const session=await auth()

  if(!session || !session.user || !session.user.id) {
    return null;
  }
  await accessPage2(session.user.id,['roles_view']);
  const hasPermissionView = await withAuthorizationPermission2(session.user.id,['roles_view']);
  const hasPermissionAdd = await withAuthorizationPermission2(session.user.id,['roles_create']);

  return (
    <div className='flex flex-col gap-2'>
      {hasPermissionAdd.data.hasPermission && <AddRoleButton />}
      {hasPermissionView.data.hasPermission && <ListRoles />}
    </div>
  )
}

export default RolesPage
