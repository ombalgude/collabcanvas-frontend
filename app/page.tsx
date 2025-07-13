import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex items-center justify-center px-4 sm:px-6">
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl px-8 py-12 sm:px-16 sm:py-20 w-full max-w-3xl text-center space-y-10">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          Welcome to <br />
          <span className="text-purple-400">CollabCanvas</span>
        </h1>

<p className="text-gray-300 text-lg sm:text-xl md:text-[1.25rem] max-w-2xl mx-auto leading-relaxed">
          Collaborate live. Across canvases. Real-time teamwork, anytime.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 text-lg shadow-md hover:shadow-xl">
              Signup
            </button>
          </Link>
          <Link href="/signin" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto border-2 border-purple-500 text-purple-300 hover:bg-purple-700 hover:text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 text-lg shadow-md hover:shadow-xl">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
