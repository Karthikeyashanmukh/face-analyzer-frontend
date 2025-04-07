import { useState } from "react";

export default function Upload() {
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<any>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("video", file);

    try {
      const res = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setScores(data);
    } catch (err) {
      console.error("Failed to analyze video:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Upload Video for Analysis</h2>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      {loading && <p className="mt-4 text-blue-600">Analyzing video...</p>}
      {scores && (
        <div className="mt-4 space-y-2 text-lg">
          <p>🛋 Laziness: {scores.laziness}</p>
          <p>👀 Attentiveness: {scores.attentiveness}</p>
          <p>🧠 Concentration: {scores.concentration}</p>
        </div>
      )}
    </div>
  );
}
