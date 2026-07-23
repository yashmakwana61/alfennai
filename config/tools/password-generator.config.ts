import { z } from "zod";
import type { ToolConfig } from "@/types/tool";
import { PasswordGenerator } from "@/components/tools/PasswordGenerator";

const passwordInputSchema = z.object({
  length: z.number().min(4).max(128).default(16),
  includeUppercase: z.boolean().default(true),
  includeLowercase: z.boolean().default(true),
  includeNumbers: z.boolean().default(true),
  includeSymbols: z.boolean().default(true),
});

export type PasswordInput = z.infer<typeof passwordInputSchema>;

export interface PasswordOutput {
  password: string;
  strength: "Weak" | "Fair" | "Strong" | "Very strong";
}

const CHARSETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function computePassword(input: PasswordInput): PasswordOutput {
  let charset = "";
  if (input.includeUppercase) charset += CHARSETS.upper;
  if (input.includeLowercase) charset += CHARSETS.lower;
  if (input.includeNumbers) charset += CHARSETS.numbers;
  if (input.includeSymbols) charset += CHARSETS.symbols;
  if (!charset) charset = CHARSETS.lower;

  const randomValues = new Uint32Array(input.length);
  crypto.getRandomValues(randomValues);
  const password = Array.from(randomValues, (v) => charset[v % charset.length]).join("");

  const variety = [
    input.includeUppercase,
    input.includeLowercase,
    input.includeNumbers,
    input.includeSymbols,
  ].filter(Boolean).length;

  let strength: PasswordOutput["strength"] = "Weak";
  if (input.length >= 16 && variety >= 3) strength = "Very strong";
  else if (input.length >= 12 && variety >= 3) strength = "Strong";
  else if (input.length >= 8 && variety >= 2) strength = "Fair";

  return { password, strength };
}

export const passwordGeneratorTool: ToolConfig<PasswordInput, PasswordOutput> = {
  id: "password-generator",
  slug: "password-generator",
  title: "Password Generator",
  shortDescription: "Generate strong, random, cryptographically secure passwords instantly.",
  longDescription:
    "The Password Generator uses your browser's cryptographically secure random number generator (crypto.getRandomValues) to produce unpredictable passwords. Choose the length and which character sets to include, and get an instant strength rating.",
  category: "generators",
  icon: "KeyRound",
  isFeatured: true,
  seo: {
    metaTitle: "Password Generator - Create Strong Secure Passwords Free",
    metaDescription:
      "Generate strong, random, secure passwords online for free. Customize length and character types with instant strength rating.",
    keywords: ["password generator", "strong password", "random password generator", "secure password"],
  },
  inputSchema: passwordInputSchema,
  compute: computePassword,
  component: PasswordGenerator,
  faq: [
    {
      question: "Are these passwords secure?",
      answer:
        "Yes. Passwords are generated locally in your browser using the Web Crypto API's cryptographically secure random number generator, and are never sent to a server.",
    },
    {
      question: "What length should I use?",
      answer: "For most accounts, 16 characters with all character types enabled gives a very strong password.",
    },
  ],
  relatedToolSlugs: ["uuid-generator", "hash-generator"],
  exampleInput: { length: 16, includeUppercase: true, includeLowercase: true, includeNumbers: true, includeSymbols: true },
};
