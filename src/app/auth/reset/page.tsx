import ResetForm from "@/components/my/form/reset";

export default function LoginPage() {

  return (
    <div className="min-h-screen py-10 overflow-auto w-full flex items-center justify-center bg-[url('/background.svg')] bg-cover bg-center bg-no-repeat">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Changer le mot de passe
        </h1>
        <ResetForm />
      </div>
    </div>
  );
}
