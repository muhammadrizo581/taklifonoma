import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import InvitationForm from "@/components/admin/InvitationForm";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/create")({ component: Create });

function Create() {
  const { session, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && (!session || !isAdmin)) navigate({ to: "/admin" }); }, [session, isAdmin, loading, navigate]);
  if (loading || !session) return null;
  return <InvitationForm />;
}
