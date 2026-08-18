import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Office Table Tennis",
  description: "Create and run office table tennis tournaments — brackets, toss, and live scores.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <div className="mx-auto flex min-h-full w-full max-w-md flex-col bg-background">{children}</div>
      </body>
    </html>
  );
}
