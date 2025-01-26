import { auth } from "@/auth";
import SettingsForm from "./settingsForm";
import { getUserByid } from "@/actions/user";
import { getTranslations } from "next-intl/server";

export default async function SettingsPage() {
  const session = await auth();
  const t = await getTranslations('Settings');

  if(!session || !session.user) return null


  const user = await getUserByid(session.user?.id as string);
  if(user.status !== 200 || !user.data) return null


  return <div className="px-4 md:px-16 mt-8">
    <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
    <SettingsForm user={user.data} />
    <div className='w-full h-20'></div>
  </div>
}

