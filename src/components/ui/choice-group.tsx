import { cn } from "@/lib/cn";

interface ChoiceGroupProps<T extends string> {
  legend: string;
  name: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  labelFor: (option: T) => string;
  className?: string;
}

/** A row of pill-shaped radio buttons (native radios, so keyboard support is free). */
export function ChoiceGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  labelFor,
  className,
}: ChoiceGroupProps<T>) {
  return (
    <fieldset className={className}>
      <legend className="mb-1.5 text-sm font-bold text-forest">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option}
            className={cn(
              "cursor-pointer rounded-full border-2 px-5 py-2 font-bold transition has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-rose",
              value === option
                ? "border-forest bg-forest text-cream"
                : "border-forest/15 bg-white/70 text-forest hover:border-forest/40",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            {labelFor(option)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
