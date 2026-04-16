export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold tracking-tight mb-4">404</h1>
        <p className="text-lg text-gray-600 mb-8">
          Page not found.
        </p>
        <a
          href="/"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Go back home
        </a>
      </div>
    </main>
  );
}
