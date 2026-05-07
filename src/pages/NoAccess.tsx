import { ShieldOff } from "lucide-react";

export default function NoAccess() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <ShieldOff className="w-12 h-12 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">Sin acceso</h1>
      <p className="text-muted-foreground max-w-md">
        No tienes permiso para ver esta sección. Contacta al administrador para solicitar acceso.
      </p>
    </div>
  );
}
