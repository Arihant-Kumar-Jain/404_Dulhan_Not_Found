import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeddingBudget.ai — AI-Powered Wedding Budget Estimator",
  description: "India's first AI-powered wedding budget estimation platform. Get intelligent, itemized budget estimates for your dream Indian wedding with real-time AI agents analyzing venue, décor, catering, and entertainment costs.",
  keywords: "wedding budget, Indian wedding, AI budget estimator, wedding planner, destination wedding India",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
