import Link from 'next/link';

export default function ObrigadoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        Pagamento Confirmado!
      </h1>
      <p className="text-lg mb-8 text-gray-700">
        Obrigado pela compra. Seu acesso foi liberado na plataforma.
      </p>
      
      <Link 
        href="/my-courses"
        className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
      >
        Acessar Meus Cursos
      </Link>
    </div>
  );
}