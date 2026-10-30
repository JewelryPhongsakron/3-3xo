import type { Metadata } from 'next';
import { Patrick_Hand } from 'next/font/google';
import './globals.css';

const handwriting = Patrick_Hand({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-handwriting',
});

export const metadata: Metadata = {
  title: 'XO OX',
  description: 'Tic-Tac-Toe against an unbeatable minimax AI',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={handwriting.variable}>
      <body>{children}</body>
    </html>
  );
}
