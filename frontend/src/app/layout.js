import "./globals.css";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import '@solana/wallet-adapter-react-ui/styles.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SM-DAO",
  description: "Social Media Decentralized Autonomous Organization",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}