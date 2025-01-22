"use client";
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
  const router = useRouter();

  const changeLanguage = (lang: string) => {
    Cookies.set('lang', lang, { expires: 7 }); // Définit un cookie de langue valide pendant 7 jours
    router.refresh(); // Recharge la page pour appliquer le changement
  };

  return (
    <div>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('fr')}>Français</button>
      <button onClick={() => changeLanguage('ar')}>العربية</button>
    </div>
  );
}
