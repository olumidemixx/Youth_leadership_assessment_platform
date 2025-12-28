export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-6">
      <div className="text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight whitespace-nowrap">
          Welcome to <span className="text-blue-400">My App</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          A modern platform designed to make your journey simple, fast, and secure.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <a
            href="/signup"
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg transition-all duration-300 hover:scale-105"
          >
            Sign Up
          </a>
          <a
            href="/signin"
            className="px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-semibold shadow-lg transition-all duration-300 hover:scale-105"
          >
            Sign In
          </a>
        </div>
      </div>
    </main>
  );
}
