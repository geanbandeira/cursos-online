"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Download, ArrowLeft, FolderOpen } from "lucide-react"
import Link from "next/link"
import { getCourseMaterials } from "@/lib/course-actions"

// Define a estrutura para o TypeScript parar de reclamar
interface Material {
  id: number;
  title: string;
  file_url: string;
  file_type: string;
  file_size: string;
}

export default function MaterialsPage() {
  const { id } = useParams();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getCourseMaterials(Number(id));
      // @ts-ignore
      if (res.success) setMaterials(res.materials);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleDownload = (url: string, title: string, fileType: string) => {
    // Define a extensão baseada no tipo do banco ('zip' ou 'pdf')
    const extension = fileType.toLowerCase() === 'zip' ? '.zip' : '.pdf';

    // Garante que o nome do arquivo tenha a extensão correta
    const fileName = title.toLowerCase().endsWith(extension)
      ? title
      : `${title}${extension}`;

    // Chama a API de download
    window.location.href = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(fileName)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-12">
      <div className="max-w-3xl mx-auto">
        <Link href={`/course/${id}`}>
          <Button variant="ghost" className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <FolderOpen className="h-8 w-8 text-[#00324F]" />
          <h1 className="text-3xl font-bold text-gray-900">Materiais do Curso</h1>
        </div>

        {loading ? (
          <p>Carregando arquivos...</p>
        ) : materials.length > 0 ? (
          <div className="grid gap-4">
            {materials.map((m) => (
              <Card key={m.id} className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><FileText /></div>
                    <div>
                      <p className="font-semibold text-gray-800">{m.title}</p>
                      <p className="text-xs text-gray-500 uppercase">{m.file_type} • {m.file_size}</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleDownload(m.file_url, m.title, m.file_type)} // Enviando o tipo aqui
                    className="bg-[#00324F] hover:bg-[#004066] cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p>Nenhum material disponível.</p>
        )}
      </div>
    </div>
  )
}