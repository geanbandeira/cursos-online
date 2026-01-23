"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Download, ArrowLeft, FolderOpen } from "lucide-react"
import Link from "next/link"
import { getCourseMaterials } from "@/lib/course-actions"

// 1. Definimos a interface para acabar com o erro de "m.file_url"
interface Material {
  id: number;
  title: string;
  file_url: string;
  file_type: string;
  file_size: string;
}

export default function MaterialsPage() {
  const { id } = useParams();
  // 2. Tipamos o estado como um array de Materiais
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  // 3. Função de download movida para dentro para facilitar acesso
  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error("Erro ao acessar o arquivo");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Erro ao baixar via código (CORS):", error);
      // Fallback: Tenta download direto pelo navegador se o CORS falhar
      const link = document.createElement('a');
      link.href = url;
      link.target = "_blank";
      link.download = fileName;
      link.click();
    }
  };

  useEffect(() => {
    async function load() {
      const res = await getCourseMaterials(Number(id));
      // @ts-ignore - Caso o retorno da action não esteja tipado
      if (res.success) setMaterials(res.materials);
      setLoading(false);
    }
    load();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/my-courses">
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
              <Card key={m.id} className="hover:shadow-md transition-all border-0 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><FileText /></div>
                    <div>
                      <p className="font-semibold text-gray-800">{m.title}</p>
                      <p className="text-xs text-gray-500 uppercase">{m.file_type} • {m.file_size}</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleDownload(m.file_url, m.title)}
                    className="bg-[#00324F] hover:bg-[#004066] cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed">
            <p className="text-gray-500">Nenhum material disponível ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
