import "./globals.css";

/**
 * Root layout — pass-through shell.
 *
 * The <html> and <body> tags with dynamic lang / dir attributes
 * live in src/app/[lang]/layout.tsx so the locale segment controls them.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
