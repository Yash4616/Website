'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * A7 — the `useTheme` import from next-themes was removed and the theme
 * hardcoded to "dark". This site has exactly one theme (D9, AP-1), so asking a
 * theme runtime what to render was answering a question that cannot vary.
 *
 * This is the site's only toast system. The old shadcn/Radix toast
 * (ui/toast.tsx + ui/toaster.tsx + hooks/use-toast.ts) was deleted alongside
 * it — one toast library, not two. Used by the Stage 7 "Copied ✓" pill.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
