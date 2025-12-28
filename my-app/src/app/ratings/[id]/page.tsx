"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Profile {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
}

const questions = [
  "Says exactly what he or she means",
  "Admits mistakes when they are made",
  "Encourages everyone to speak their mind",
  "Tells you the hard truth",
  "Displays emotions exactly in line with feelings",
  "Demonstrates beliefs that are consistent with actions",
  "Makes decisions based on his or her core values",
  "Asks you to take positions that support your core values",
  "Makes difficult decisions based on high standards of ethical conduct",
  "Solicits views that challenge his or her deeply held positions",
  "Analyzes relevant data before coming to a decision",
  "Listens carefully to different points of view before coming to conclusions",
  "Seeks feedback to improve interactions with others",
  "Accurately describes how others view his or her capabilities",
  "Knows when it is time to reevaluate his or her positions on important issues",
  "Shows he or she understands how specific actions impact others"
];

export default function RatingsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scores, setScores] = useState<number[]>(Array(16).fill(0));
  const [averages, setAverages] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingPeriod, setRatingPeriod] = useState<{start: string; end: string} | null>(null);
  const [isRatingAvailable, setIsRatingAvailable] = useState<boolean>(true);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [prevProfileId, setPrevProfileId] = useState<number | null>(null);
  const [nextProfileId, setNextProfileId] = useState<number | null>(null);

  useEffect(() => {
    const fetchAllProfiles = async () => {
      try {
        const res = await fetch('/api/profiles');
        if (!res.ok) {
          throw new Error('Failed to fetch profiles');
        }
        const profilesData = await res.json();
        setAllProfiles(profilesData);
        
        // Find current profile index
        const currentIndex = profilesData.findIndex((p: Profile) => p.id === Number(id));
        
        if (currentIndex !== -1) {          
          // Set next profile ID (if exists)
          if (currentIndex < profilesData.length - 1) {
            setNextProfileId(profilesData[currentIndex + 1].id);
          }
        }
      } catch (err) {
        console.error("Error fetching all profiles:", err);
      }
    };

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/profiles/${id}`);
        if (!res.ok) {
          throw new Error('Profile not found');
        }
        const profileData = await res.json();
        setProfile(profileData);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError('Profile not found');
      } finally {
        setLoading(false);
      }
    };

    const fetchRatingPeriod = async () => {
      try {
        const res = await fetch('/api/admin/period');
        const data = await res.json();
        
        if (data.period) {
          const now = new Date();
          const startDate = new Date(data.period.startDate);
          const endDate = new Date(data.period.endDate);
          
          setRatingPeriod({
            start: startDate.toLocaleString(),
            end: endDate.toLocaleString()
          });
          
          setIsRatingAvailable(now >= startDate && now <= endDate && data.period.isActive);
        } else {
          setIsRatingAvailable(false);
        }
      } catch (err) {
        console.error("Error fetching rating period:", err);
        setIsRatingAvailable(false);
      }
    };

    if (id) {
      fetchProfile();
      fetchRatingPeriod();
      fetchAllProfiles();
    }
  }, [id]);

  const handleSelect = (qIndex: number, value: number) => {
    const newScores = [...scores];
    newScores[qIndex] = value;
    setScores(newScores);
  };

  const computeAverages = (arr: number[]) => {
    const q1 = (arr[0] + arr[1] + arr[2] + arr[3] + arr[4])/ 5;
    const q2 = (arr[5] + arr[6] + arr[7] + arr[8]) / 4;
    const q3 = (arr[9] + arr[10] + arr[11]) / 3;
    const q4 = (arr[12] + arr[13] + arr[14] + arr[15]) / 4;
    const q5 = (q1 + q2 + q3 + q4) / 4;
    return [q1, q2, q3, q4, q5];
  };

  const handleSubmit = async () => {
    const averages = computeAverages(scores);
    setAverages(averages);

    // TODO: Replace this with actual userId from session/auth context
    const userId = 1; // <-- implement this or get from context

    const res = await fetch(`/api/ratings/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scores: averages, userId }),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      const errorData = await res.json();
      console.error("Submission failed:", errorData);
      
      if (res.status === 403 && errorData.periodInfo) {
        // Update rating period information from the error response
        setRatingPeriod({
          start: new Date(errorData.periodInfo.start).toLocaleString(),
          end: new Date(errorData.periodInfo.end).toLocaleString()
        });
        setIsRatingAvailable(false);
      } else {
        alert("Failed to submit ratings. " + (errorData.error || "Please try again."));
      }
    }
  };

  const navigateToProfiles = () => {
    router.push('/profiles');
  };

  const navigateToNextProfile = () => {
    if (nextProfileId) {
      router.push(`/ratings/${nextProfileId}`);
    } else {
      // If there's no next profile, navigate to results page
      router.push('/results');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Profile not found</p>
          <a href="/profiles" className="text-green-600 hover:underline">
            Back to Profiles
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl mb-4 flex justify-between items-center">
        <button
          onClick={navigateToProfiles}
          className="flex items-center gap-2 text-green-700 hover:text-green-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span>Back to Profiles</span>
        </button>
        
        {nextProfileId && (
          <button
            onClick={navigateToNextProfile}
            className="flex items-center gap-1 px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
          >
            <span>Next Rating</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="w-full max-w-3xl bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col items-center mb-6">
            <img
            src={profile.photoUrl || "/default-avatar.png"}
              alt={`${profile.firstName} ${profile.lastName}`}
            className="w-16 h-16 rounded-full object-cover border-2 border-green-500 mb-3"
            />
            <h1 className="text-2xl font-bold text-gray-800">
              Rate {profile.firstName} {profile.lastName}
            </h1>
        </div>

        {submitted ? (
          <div className="text-center">
            <p className="text-green-600 font-semibold mb-4">
              ✅ Feedback submitted successfully!
            </p>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Your Scores</h2>
            <ul className="space-y-2 text-gray-700">
              <li>Q1 = {averages[0].toFixed(2)}</li>
              <li>Q2 = {averages[1].toFixed(2)}</li>
              <li>Q3 = {averages[2].toFixed(2)}</li>
              <li>Q4 = {averages[3].toFixed(2)}</li>
              <li>Q5 = {averages[4].toFixed(2)}</li>
            </ul>
            
            <div className="mt-6 flex justify-center gap-4">
              {nextProfileId ? (
                <button
                  onClick={navigateToNextProfile}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  <span>Rate Next Profile</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => router.push('/results')}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  <span>View Results</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ) : !isRatingAvailable ? (
          <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="text-yellow-600 text-5xl mb-4">⏱️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">Rating Submission Unavailable</h2>
            <p className="text-gray-600 mb-4">
              Rating submissions are only accepted during the designated time period.
            </p>
            
            {ratingPeriod ? (
              <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Start:</span> {ratingPeriod.start}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">End:</span> {ratingPeriod.end}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">
                No active rating period has been set by the administrator.
              </p>
            )}
            
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={navigateToProfiles}
                className="flex items-center gap-1 px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                <span>Back to Profiles</span>
              </button>
              
              {nextProfileId && (
                <button
                  onClick={navigateToNextProfile}
                  className="flex items-center gap-1 px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                >
                  <span>Next Rating</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ) : (
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {/* Rating period info banner */}
            {ratingPeriod && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                <p className="text-sm text-green-800 font-medium">Rating Period Active</p>
                <p className="text-xs text-gray-600">
                  Submissions accepted from {ratingPeriod.start} to {ratingPeriod.end}
                </p>
              </div>
            )}
            
            {questions.map((q, idx) => (
              <div key={idx} className="p-4 border rounded-xl bg-gray-100">
                <p className="font-medium text-gray-700 mb-2">{q}</p>
                <div className="flex gap-4">
                  {[0, 1, 2, 3, 4].map((num) => (
                    <label key={num} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        value={num}
                        checked={scores[idx] === num}
                        onChange={() => handleSelect(idx, num)}
                      />
                      {num}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center mt-6">
              <button
                type="submit"
                className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-xl hover:bg-green-700 transition"
              >
                Submit Feedback
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
