import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="p-8 font-sans bg-gray-100 min-h-screen">
        <main className="max-w-xl mx-auto bg-white shadow rounded p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
