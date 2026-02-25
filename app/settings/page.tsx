"use client"
import { useState, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Camera, Save, User, Loader2 } from "lucide-react"
import { updateUserProfile } from "@/lib/auth-actions"
import { toast } from "sonner" 
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { user, setUser } = useAuth(); // Removido o refreshUser que não existe
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar_url || "");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error("A imagem é muito grande. Escolha uma de até 4MB.");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);

    try {
      const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: 'POST',
        body: file,
      });

      const newBlob = await response.json();

      // 1. Salva o link da Vercel no seu MySQL
      const dbResult = await updateUserProfile(user?.email!, { avatar_url: newBlob.url });

      if (dbResult.success) {
        // 2. Atualiza o estado global para a foto mudar no menu na hora
        if (user && setUser) {
          setUser({ ...user, avatar_url: newBlob.url });
        }
        toast.success("Foto atualizada com sucesso!");
      } else {
        toast.error("Erro ao gravar no banco: " + dbResult.error);
      }
    } catch (error) {
      toast.error("Erro no upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveName = async () => {
    if (!firstName.trim()) {
      toast.warning("Por favor, digite seu nome.");
      return;
    }

    setLoading(true);
    try {
      const result = await updateUserProfile(user?.email!, { first_name: firstName });

      if (result.success) {
        if (user && setUser) setUser({ ...user, name: firstName });
        toast.success("Perfil atualizado! Redirecionando...");
        setTimeout(() => router.push("/my-courses"), 1500);
      }
    } catch (error) {
      toast.error("Houve um problema ao salvar as alterações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-0 shadow-2xl bg-white">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-[#00324F]">Configurações da Conta</CardTitle>
          <p className="text-sm text-gray-500">Mantenha seu perfil atualizado</p>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">

          <div className="flex flex-col items-center">
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className="relative group cursor-pointer w-32 h-32 rounded-full border-4 border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center transition-all hover:border-[#00324F] shadow-lg"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="text-3xl font-bold text-gray-300">{user?.name?.[0]}</div>
              )}

              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white w-8 h-8" />
              </div>

              {uploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#00324F] w-8 h-8" />
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4" /> Nome Completo
              </label>
              <Input
                className="h-12 border-gray-200 focus:border-[#00324F]"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              className="w-full bg-[#00324F] hover:bg-[#00253a] h-12 text-lg font-bold"
              onClick={handleSaveName}
              disabled={loading || uploading}
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-5 h-5" />}
              Salvar Alterações
            </Button>

            <Button
              variant="ghost"
              className="text-gray-500 hover:text-[#00324F]"
              onClick={() => router.push("/my-courses")}
            >
              Cancelar e Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}