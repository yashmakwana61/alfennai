"use client";

import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

export function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(fieldClass, props.className)} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx(fieldClass, "font-mono text-sm", props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clsx(fieldClass, props.className)} />;
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <p className="mt-2 text-sm text-error">{children}</p>;
}

export function ResultCard({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 rounded-xl bg-slate-50 p-6 dark:bg-slate-800/60">{children}</div>
  );
}

export function StatGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label}>
          <p className="text-slate-500 dark:text-slate-400">{item.label}</p>
          <p className="font-medium text-slate-900 dark:text-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
