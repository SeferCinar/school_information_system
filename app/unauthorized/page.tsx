import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-red-600">403 - Unauthorized</h1>
      <p className="mt-4 text-gray-600">You do not have permission to access this page.</p>
      <Link href="/dashboard" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Return to Dashboard
      </Link>
    </div>
  );
}

