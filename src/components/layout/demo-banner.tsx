import { Sparkles } from "lucide-react";
import { isDemoMode } from "@/composition/repositories";
import { getDictionary } from "@/i18n/get-dictionary";

/** Small heads-up shown while the site runs on sample data. */
export async function DemoBanner() {
  if (!isDemoMode) return null;
  const { dict } = await getDictionary();

  return (
    <div className="flex justify-center bg-blush px-4 pb-8">
      <p className="flex items-center gap-2 rounded-full bg-ocean px-4 py-2 text-xs font-semibold text-cream">
        <Sparkles className="size-4 shrink-0 text-rose" aria-hidden />
        {dict.demo.banner}
      </p>
    </div>
  );
}
