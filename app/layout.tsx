export const metadata = { title: 'Nordstein Orbit' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="de"><body style={{margin:0,fontFamily:"ui-sans-serif"}}>{children}</body></html>;
}
