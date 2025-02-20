import { verifySession } from '@/actions/auth/auth';
import { accessPage2, withAuthorizationPermission2 } from '@/actions/permissions';
import ListRoles from '@/app/admin/roles/_component/list-roles'
import { Card } from '@/components/ui/card';
import React from 'react'
import AddBlogButton from './_component/buttons/add-blog';

const AddBlog = async () => {

  const session = await verifySession()

  if (session.status !== 200 || !session || !session.data.user || !session.data.user.id) {
    return null;
  }
  await accessPage2(session.data.user.id, ['blogs_view']);
  const hasPermissionView = await withAuthorizationPermission2(session.data.user.id, ['blogs_view']);
  const hasPermissionAdd = await withAuthorizationPermission2(session.data.user.id, ['blogs_create']);

  return (
    <Card className='p-4'>
      <div className='flex flex-col gap-2'>
        {hasPermissionAdd.data.hasPermission && <AddBlogButton />}
      </div>
    </Card>
  )
}

export default AddBlog
