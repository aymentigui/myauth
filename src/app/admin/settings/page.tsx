import { auth } from "@/auth";
import SettingsForm from "./settingsForm";
import { getUserSettingsByid } from "@/actions/users/get";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await auth();
  const t = await getTranslations('Settings');
  if (!session || !session.user) return null

  const user = await getUserSettingsByid(session.user?.id as string);
  if (user.status !== 200 || !user.data) return null

  return <Card className='p-4'>
    <div className="px-4 md:px-16 mt-8">

      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
      <SettingsForm user={user.data} />
      <div className='w-full h-20'></div>
    </div>
  </Card >
}

