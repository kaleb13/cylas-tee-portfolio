import type { Metadata } from "next";
import "./globals.css";
import CustomScrollbar from "@/components/CustomScrollbar";

export const metadata: Metadata = {
  title: "Cylas Tee – Personal Brand Website Builder",
  description:
    "Helping individuals increase their online reach & presence. Starting with their personal brand website.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <CustomScrollbar />
      </body>
    </html>
  );
}
