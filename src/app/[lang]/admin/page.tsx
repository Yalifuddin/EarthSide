import { Dashboard } from "@/components/admin/dashboard/dashboard";

/** Rendered only after client-side sign-in, so there is no server UI to validate. */
export const instant = false;

export default function AdminPage() {
  return <Dashboard />;
}
