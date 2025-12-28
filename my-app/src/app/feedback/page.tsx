"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FeedbackPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const router = useRouter();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;

          // Resize logic
          const MAX_SIZE = 200; // max width or height
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = (height * MAX_SIZE) / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = (width * MAX_SIZE) / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to compressed JPEG base64
          const resizedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          setPreview(resizedBase64);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newProfile = {
      firstName,
      lastName,
      photoUrl: preview || null, // ✅ compressed thumbnail base64
    };

    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProfile),
      });

      if (!res.ok) {
        throw new Error("Failed to create profile");
      }

      router.push("/profiles"); // Redirect on success
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Failed to submit feedback. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-green-600 mb-6">
        Welcome!
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center bg-white shadow-lg rounded-2xl p-6 space-y-4 w-80"
      >
        {/* Upload Photo */}
        <div className="flex flex-col items-center">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-16 h-16 rounded-full object-cover border-2 border-green-500 mb-2"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mb-2">
              No Photo
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="text-sm text-gray-600"
          />
        </div>

        {/* First Name */}
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />

        {/* Last Name */}
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          required
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
