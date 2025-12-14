"use client";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      <p className="mt-4 text-gray-600">
        Welcome to the School Information System, <span className="font-semibold">{user?.name}</span>.
      </p>
      <div className="mt-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Role Overview: <span className="capitalize">{user?.role}</span></h2>
        <p className="text-gray-600">This is your role-specific dashboard area.</p>
      </div>
    </div>
  );
}

