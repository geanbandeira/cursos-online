"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Download, ArrowLeft, Library, Book } from "lucide-react"
import Link from "next/link"
import { getAllEnrolledMaterials, getUserIdByEmail } from "@/lib/course-actions"

interface Material {
  id: number;
  title: string;
  file_url: string;
  file_type: string;
  file_size: string;
  course_name: string;
  course_id: number;
}

export default function AllMaterialsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    async function load() {
      const userRes = await getUserIdByEmail(user.email);
      if (userRes.success && userRes.userId) {
        const res = await getAllEnrolledMaterials(userRes.userId.toString());
        if (res.success) setMaterials(res.materials as Material[]);
      }
      setLoading(false);
    }
    load();
  }, [user, authLoading, router]);

  const handleDownload = (url: string, title: string) => {
    const fileName = title.endsWith('.pdf') ? title : `${title}.pdf`;
    window.location.href = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(fileName)}`;
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Carregando sua biblioteca...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/my-courses">
          <Button variant="ghost" className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Meus Cursos</Button>
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <Library className="h-8 w-8 text-[#00324F]" />
          <h1 className="text-3xl font-bold text-gray-900">Minha Biblioteca de Materiais</h1>
        </div>

        {materials.length > 0 ? (
          <div className="grid gap-6">
            {/* Agrupamento visual por curso pode ser feito aqui */}
            {materials.map((m) => (
              <Card key={m.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-50 p-3 rounded-xl text-orange-600"><FileText /></div>
                    <div>
                      <p className="font-bold text-gray-800 text-lg">{m.title}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Book className="w-3 h-3" />
                        <span className="font-medium text-[#00324F]">{m.course_name}</span>
                        <span>• {m.file_size}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleDownload(m.file_url, m.title)}
                    className="w-full sm:w-auto bg-[#00324F] hover:bg-[#004066] h-12 px-6"
                  >
                    <Download className="mr-2 h-4 w-4" /> Baixar Apostila
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-2xl text-center shadow-sm">
            <p className="text-gray-500">Você ainda não possui materiais disponíveis nos seus cursos.</p>
          </div>
        )}
      </div>
    </div>
  )
}