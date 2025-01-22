

import { getSessions } from '@/actions/accont-settings/getInfo';
import EmailForm from '@/components/my/settingsForms/email-form';
import ListSessionsForm from '@/components/my/settingsForms/listsessions-form/listsessions-form';
import ResetPasswordForm from '@/components/my/settingsForms/resetpassword-form';
import TwoFactorConfermationForm from '@/components/my/settingsForms/twofactorconfermation-form';
import UsernameForm from '@/components/my/settingsForms/username-form';
import { Separator } from '@/components/ui/separator';
import { prisma } from '@/lib/db';
import { User } from '@prisma/client';

interface SettingsFormProps {
    user: User
}

export default async function SettingsForm({ user }: SettingsFormProps) {

    if (!user) {
        return null
    }

    const sessions = await getSessions(user);

    if(sessions.status!=200){
        return null
    }

    return (
        <div>
            {user.email && <EmailForm email={user.email} />}     
            <Separator />
            {user.username && <UsernameForm username={user.username} />}    
            <Separator />
            <TwoFactorConfermationForm twoFactorConfermation={user.isTwoFactorEnabled??false} /> 
            <Separator />
            <ResetPasswordForm />
            <Separator />
            <ListSessionsForm sessions={sessions.data} />
        </div>
    )
}

