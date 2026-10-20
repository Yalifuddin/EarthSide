import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/shell/admin-shell";
import { translationServices } from "@/composition/translation-services";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.admin.title, robots: { index: false, follow: false } };
}

export default function AdminLayout({ children }: LayoutProps<"/[lang]/admin">) {
  const features = { machineTranslation: translationServices.translation.isAvailable };
  return <AdminShell features={features}>{children}</AdminShell>;
}
