import { verifySession } from '@/actions/auth/auth';
import { accessPage2 } from '@/actions/permissions';
import { Card } from '@/components/ui/card';
import React from 'react'
import TextEditor from '../../../../components/myui/text-editor-quill';
import AddBlogForm from '../_component/forms/add-blog';


const AddBlog = async () => {

  const session = await verifySession()

  if (session.status !== 200 || !session || !session.data.user || !session.data.user.id) {
    return null;
  }
  await accessPage2(session.data.user.id, ['blogs_create']);

  return (
    <Card className='p-4'>
      <div className='flex flex-col gap-2 '>
        <AddBlogForm />
      </div>
    </Card>
  )
}

export default AddBlog
