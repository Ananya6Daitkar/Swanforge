import type { Metadata } from "next";
import "@xyflow/react/dist/style.css";
import "./globals.css";

export const metadata:Metadata={title:"Black Swan Forge",description:"Adversarial infrastructure cascade research prototype"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
