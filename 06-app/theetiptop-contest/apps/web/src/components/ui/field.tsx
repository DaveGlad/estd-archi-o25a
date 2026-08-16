import type { ReactNode } from 'react';

/**
 * L'aide se place au-dessus du champ, pas en dessous : on lit la consigne
 * avant de saisir, pas après s'être trompé. L'erreur, elle, vient sous le
 * champ, à l'endroit où le regard revient après la saisie.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <label
          htmlFor={htmlFor}
          className="block text-[14px] leading-none font-semibold tracking-[-0.005em]"
        >
          {label}
          {required && (
            <span className="text-danger" aria-hidden="true">
              {' '}
              *
            </span>
          )}
          {required && <span className="sr-only"> (obligatoire)</span>}
        </label>
        {hint && (
          <p id={`${htmlFor}-hint`} className="text-[13.5px] leading-[1.5] text-fg-muted">
            {hint}
          </p>
        )}
      </div>

      {children}

      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="flex items-start gap-1.5 text-[13.5px] leading-[1.5] font-medium text-danger"
        >
          <span aria-hidden="true" className="mt-[3px] block size-1.5 shrink-0 rounded-full bg-danger" />
          {error}
        </p>
      )}
    </div>
  );
}
