"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Profile {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await fetch("/api/profiles");
        const data = await res.json();
        setProfiles(data);
      } catch (err) {
        console.error("Error fetching profiles:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return <p className="text-gray-600">Loading profiles...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="w-full max-w-full flex flex-row items-center mb-6">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-green-700 hover:text-green-800 transition-colors text-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span>Back</span>
        </button>
        <h1 className="flex-1 text-4xl font-bold text-green-700 text-center">
          Candidate & Leader Profiles
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-full">
        {profiles.length > 0 ? (
          profiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white shadow-lg rounded-2xl p-4 flex flex-col items-center"
            >
              <img
                src={profile.photoUrl || "/default-avatar.png"}
                alt={`${profile.firstName} ${profile.lastName}`}
                className="w-4 h-4 rounded-full object-cover border-2 border-green-500 mb-3"
              />

              <Link
                href={`/ratings/${profile.id}`} // ✅ use DB id, not index
                className="text-lg font-semibold text-gray-800 hover:text-green-700 transition"
              >
                {profile.firstName} {profile.lastName}
              </Link>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No profiles submitted yet.</p>
        )}
      </div>
    </div>
  );
}