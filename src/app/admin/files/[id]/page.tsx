"use server"
import { Card } from '@/components/ui/card';
import React from 'react'
import { prisma } from '@/lib/db';
import UpdateFiles from '../_component/forms/update-files';
import { verifySession } from '@/actions/permissions';

const BlogPreview = async ({ params }: any) => {
    const paramsID = await params;

    if (!paramsID.id)
        return null

    const session = await verifySession()

    if (session.status !== 200 || !session || !session.data.user || !session.data.user.id) {
        return null;
    }

    const file = await prisma.files.findUnique({
        where: {
            id: paramsID.id
        }
    })

    if (!file)
        return null

    let havePermission=true
    const canDeletePermissions = file.canDeletePermissions ? file.canDeletePermissions.split(',') : []
    const canDeleteUsers = file.canDeleteUsers ? file.canDeleteUsers.split(',') : []
    if (!session && (canDeleteUsers.length > 0 || canDeletePermissions.length > 0)) {
        havePermission = false
    }
    if (!session.data.user.isAdmin) {
        havePermission = canDeletePermissions.length === 0 || canDeletePermissions.some((p: any) => session.data.user.permissions.includes(p)) || canDeleteUsers.includes(session.data.user.id)
    }
    if(file.addedFrom===session.data.user.id)
        havePermission=true

    if(!havePermission)
        return null

    return (
        <Card className='p-4'>
        <UpdateFiles
            getFile={file}
            isJustMeViewProps={file.adminViewOnly}
            isJustMeDownloadProps={file.adminDownloadOnly}
            isJustMeDeleteProps={file.adminDeleteOnly}
            usersViewProps={file.canViewUsers?file.canViewUsers.split(','):[]}
            usersDownloadProps={file.canDownloadUsers?file.canDownloadUsers.split(','):[]}
            usersDeleteProps={file.canDeleteUsers?file.canDeleteUsers.split(','):[]}
            permissionsViewProps={file.canViewPermissions?file.canViewPermissions.split(','):[]}
            permissionsDownloadProps={file.canDownloadPermissions?file.canDownloadPermissions.split(','):[]}
            permissionsDeleteProps={file.canDeletePermissions?file.canDeletePermissions.split(','):[]}
        />
      </Card>
    )
}

export default BlogPreview
