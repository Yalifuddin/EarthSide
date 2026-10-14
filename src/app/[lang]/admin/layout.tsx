import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.admin.title, robots: { index: false, follow: false } };
}

export default function AdminLayout({ children }: LayoutProps<"/[lang]/admin">) {
  return <AdminShell>{children}</AdminShell>;
}
