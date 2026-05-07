import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export default function Setup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    supabase.from("user_roles").select("role", { count: "exact", head: true }).eq("role", "admin")
      .then(({ count }) => {
        if ((count ?? 0) > 0) navigate("/auth", { replace: true });
        setChecking(false);
      });
  }, [navigate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Bootstrap: edge function allows unauthenticated call when no admin exists
    const { data, error } = await supabase.functions.invoke("admin-create-user", {
      body: { email, password, displayName },
    });
    setLoading(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error ?? error?.message ?? "Error");
      return;
    }
    toast.success("Administrador creado. Inicia sesión.");
    navigate("/auth", { replace: true });
  };

  if (checking) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Cargando...</div>;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary mx-auto flex items-center justify-center mb-2">
            <ShieldCheck className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle>Configurar administrador</CardTitle>
          <CardDescription>Crea la cuenta de administrador inicial. Esta opción solo aparece una vez.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creando..." : "Crear administrador"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
