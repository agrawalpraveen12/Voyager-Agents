import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "AI Trip Planner - Plan Your Perfect Journey",
    description: "Multi-agent AI trip planning service powered by LangGraph. Get personalized itineraries, flight options, hotel recommendations, and activity suggestions.",
    keywords: "trip planner, AI travel, itinerary generator, travel planning, vacation planner",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    );
}
