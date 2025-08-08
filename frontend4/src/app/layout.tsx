import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Blog - Personal Blog & Community",
  description: "A modern blog website built with Next.js and Tailwind CSS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
