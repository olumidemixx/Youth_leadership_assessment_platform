"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Rating {
  id: number;
  profileId: number;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  createdAt: string;
}

interface RatingPeriod {
  id: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPage() {
  const [roleEmail, setRoleEmail] = useState("");
  const [roleToAssign, setRoleToAssign] = useState("");
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleMessage, setRoleMessage] = useState("");

  const [ratingsEmail, setRatingsEmail] = useState("");
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [ratingsMessage, setRatingsMessage] = useState("");
  const [userRatings, setUserRatings] = useState<Rating[]>([]);

  // Rating Period Management
  const [currentPeriod, setCurrentPeriod] = useState<RatingPeriod | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [periodLoading, setPeriodLoading] = useState(false);
  const [periodMessage, setPeriodMessage] = useState("");

  const handleRoleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoleLoading(true);
    setRoleMessage("");
    try {
      const res = await fetch("/api/admin/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: roleEmail, role: roleToAssign }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRoleMessage(`Role updated: ${data.user.email} is now ${data.user.role}`);
      } else {
        setRoleMessage(data.error || "Failed to update role");
      }
    } catch (_err) {
      setRoleMessage("An error occurred. Please try again.");
    } finally {
      setRoleLoading(false);
    }
  };

  // Stats state
  const [userCount, setUserCount] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState<number | null>(null);
  const [statsError, setStatsError] = useState("");

  // Fetch stats and current period on mount
  useEffect(() => {
    // Fetch stats
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => {
        setUserCount(data.userCount);
        setRatingCount(data.ratingCount);
      })
      .catch(() => setStatsError("Failed to load stats"));

    // Fetch current rating period
    fetch("/api/admin/period")
      .then(res => res.json())
      .then(data => {
        if (data.period) {
          setCurrentPeriod(data.period);
        }
      })
      .catch(() => setPeriodMessage("Failed to load rating period"));
  }, []);

  // Handlers for ratings management
  const handleCheckRatings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRatingsLoading(true);
    setRatingsMessage("");
    setUserRatings([]);
    try {
      const res = await fetch(`/api/admin/ratings?email=${encodeURIComponent(ratingsEmail)}`);
      const data = await res.json();
      if (data.hasRatings) {
        setUserRatings(data.ratings);
        setRatingsMessage(`User has ${data.ratings.length} ratings.`);
      } else {
        setRatingsMessage("No ratings found for this email.");
      }
    } catch {
      setRatingsMessage("Error fetching ratings.");
    } finally {
      setRatingsLoading(false);
    }
  };

  const handleDeleteRatings = async () => {
    setRatingsLoading(true);
    setRatingsMessage("");
    try {
      const res = await fetch("/api/admin/ratings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: ratingsEmail }),
      });
      const data = await res.json();
      if (data.deletedCount > 0) {
        setRatingsMessage(`Deleted ${data.deletedCount} ratings for ${ratingsEmail}`);
        setUserRatings([]);
      } else {
        setRatingsMessage("No ratings deleted.");
      }
    } catch {
      setRatingsMessage("Error deleting ratings.");
    } finally {
      setRatingsLoading(false);
    }
  };

  // Handlers for rating period management
  const handleSetPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    setPeriodLoading(true);
    setPeriodMessage("");

    try {
      const res = await fetch("/api/admin/period", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentPeriod(data.period);
        setPeriodMessage("Rating period set successfully");
        setStartDate("");
        setEndDate("");
      } else {
        setPeriodMessage(data.error || "Failed to set rating period");
      }
    } catch (_err) {
      setPeriodMessage("An error occurred. Please try again.");
    } finally {
      setPeriodLoading(false);
    }
  };

  const handleUpdatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPeriod) return;

    setPeriodLoading(true);
    setPeriodMessage("");

    try {
      const res = await fetch("/api/admin/period", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentPeriod.id,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentPeriod(data.period);
        setPeriodMessage("Rating period updated successfully");
        setStartDate("");
        setEndDate("");
      } else {
        setPeriodMessage(data.error || "Failed to update rating period");
      }
    } catch (_err) {
      setPeriodMessage("An error occurred. Please try again.");
    } finally {
      setPeriodLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-purple-600 mb-6">Admin Role Manager</h1>
      <div className="mb-6 w-full max-w-sm text-center">
        {statsError && <div className="text-red-600 text-sm mb-2">{statsError}</div>}
        <div className="flex flex-col gap-2 bg-gray-50 p-4 rounded shadow">
          <div className="font-semibold">Total Users Signed Up: {userCount !== null ? userCount : "..."}</div>
          <div className="font-semibold">Total Ratings Submitted: {ratingCount !== null ? ratingCount : "..."}</div>
          <Link
            href="/profiles"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mt-3 transition-colors"
          >
            View Profiles to Rate
          </Link>
        </div>
      </div>
      <div className="max-w-xl mx-auto mt-12 p-8 bg-white rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-center">Admin Panel</h1>

        </div>

        {/* --- Rating Management Section --- */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Check and Delete User Ratings</h2>
          <form onSubmit={handleCheckRatings} className="flex gap-2 mb-2">
            <input
              type="email"
              placeholder="User Email"
              className="border p-2 rounded flex-1"
              value={ratingsEmail}
              onChange={(e) => setRatingsEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 rounded disabled:opacity-50"
              disabled={ratingsLoading || !ratingsEmail}
            >
              {ratingsLoading ? "Checking..." : "Check Ratings"}
            </button>
          </form>
          {userRatings.length > 0 && (
            <div className="mb-2">
              <ul className="text-xs mb-2">
                {userRatings.map((r: Rating) => (
                  <li key={r.id}>
                    Rating for Profile #{r.profileId} | Q1: {r.q1} Q2: {r.q2} Q3: {r.q3} Q4: {r.q4} ({new Date(r.createdAt).toLocaleString()})
                  </li>
                ))}
              </ul>
              <button
                className="bg-red-600 text-white px-4 py-1 rounded"
                onClick={handleDeleteRatings}
                disabled={ratingsLoading}
              >
                {ratingsLoading ? "Deleting..." : `Delete All Ratings for ${ratingsEmail}`}
              </button>
            </div>
          )}
          {ratingsMessage && <div className="mt-2 text-center text-sm font-semibold">{ratingsMessage}</div>}
        </div>

        {/* --- Role Management Section --- */}
        <form onSubmit={handleRoleUpdate} className="flex flex-col gap-4 mb-8">
          <h2 className="text-lg font-semibold mb-2">Update User Role</h2>
          <input
            type="email"
            placeholder="User Email"
            className="border p-2 rounded"
            value={roleEmail}
            onChange={(e) => setRoleEmail(e.target.value)}
            required
          />
          <select
            className="border p-2 rounded"
            value={roleToAssign}
            onChange={(e) => setRoleToAssign(e.target.value)}
            required
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="feedback">Feedback Receiver</option>
            <option value="user">User</option>
          </select>
          <button
            type="submit"
            className="bg-purple-600 text-white p-2 rounded disabled:opacity-50"
            disabled={roleLoading}
          >
            {roleLoading ? "Updating..." : "Update Role"}
          </button>
          {roleMessage && <div className="mt-2 text-center text-sm font-semibold">{roleMessage}</div>}
        </form>

        {/* --- Rating Period Management Section --- */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Rating Period Management</h2>

          {currentPeriod ? (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <h3 className="font-medium text-sm mb-1">Current Rating Period:</h3>
              <p className="text-sm">
                <span className="font-semibold">Start:</span> {new Date(currentPeriod.startDate).toLocaleString()}
              </p>
              <p className="text-sm">
                <span className="font-semibold">End:</span> {new Date(currentPeriod.endDate).toLocaleString()}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Status:</span> {currentPeriod.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          ) : (
            <p className="text-sm mb-4">No active rating period set.</p>
          )}

          <form onSubmit={currentPeriod ? handleUpdatePeriod : handleSetPeriod} className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date and Time</label>
              <input
                type="datetime-local"
                className="border p-2 rounded w-full"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required={!currentPeriod}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Date and Time</label>
              <input
                type="datetime-local"
                className="border p-2 rounded w-full"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required={!currentPeriod}
              />
            </div>

            <button
              type="submit"
              className="bg-green-600 text-white p-2 rounded disabled:opacity-50"
              disabled={periodLoading || (!currentPeriod && (!startDate || !endDate)) || (currentPeriod && !startDate && !endDate)}
            >
              {periodLoading
                ? "Processing..."
                : currentPeriod
                  ? "Update Period"
                  : "Set Rating Period"}
            </button>

            {periodMessage && (
              <div className="mt-2 text-center text-sm font-semibold">
                {periodMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
