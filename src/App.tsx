import React, { useState, useRef } from 'react';
import { Camera, Upload, Activity, Brain, Coffee } from 'lucide-react';

type AnalysisResults = {
  laziness: number;
  attentiveness: number;
  concentration: number;
} | null;

const captureFrameFromVideo = (videoElement: HTMLVideoElement): string | null => {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg').split(',')[1]; // Get only base64 part
};

const analyzeImage = async (base64Image: string) => {
  const response = await fetch('http://localhost:5000/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: base64Image }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze image');
  }

  return await response.json(); // Returns: { emotion, age, gender, race }
};


function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [results, setResults] = useState<AnalysisResults>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsRecording(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && videoRef.current) {
      const url = URL.createObjectURL(file);
      videoRef.current.src = url;
    }
  };

  // Simulated analysis results - this would be replaced with actual API calls
  const analyzeVideo = async () => {
    if (!videoRef.current) return;
  
    const base64 = captureFrameFromVideo(videoRef.current);
    if (!base64) {
      console.error('Failed to capture frame');
      return;
    }
  
    try {
      const res = await analyzeImage(base64);
  
      // Map backend results to frontend scores (you can customize this logic)
      setResults({
        laziness: res.emotion === 'neutral' ? 0.7 : 0.3,
        attentiveness: ['happy', 'surprise'].includes(res.emotion) ? 0.8 : 0.4,
        concentration: res.age < 30 ? 0.9 : 0.5,
      });
    } catch (err) {
      console.error('Error analyzing image:', err);
    }
  };
  

  const ScoreBar = ({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) => (
    <div className="mb-4">
      <div className="flex items-center mb-2">
        <Icon className="w-5 h-5 mr-2" />
        <span className="font-medium">{label}</span>
        <span className="ml-auto">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full">
        <div 
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-8">Facial Behavior Analysis</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Video Input</h2>
            
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={isRecording ? stopWebcam : startWebcam}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <Camera className="w-5 h-5" />
                {isRecording ? 'Stop Camera' : 'Start Camera'}
              </button>

              <label className="flex-1">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer font-medium">
                  <Upload className="w-5 h-5" />
                  Upload Video
                </div>
              </label>
            </div>

            <button
              onClick={analyzeVideo}
              className="w-full mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <Activity className="w-5 h-5" />
              Analyze Behavior
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
            
            {results ? (
              <div>
                <ScoreBar 
                  label="Laziness" 
                  value={results.laziness} 
                  icon={Coffee}
                />
                <ScoreBar 
                  label="Attentiveness" 
                  value={results.attentiveness} 
                  icon={Brain}
                />
                <ScoreBar 
                  label="Concentration" 
                  value={results.concentration} 
                  icon={Activity}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No analysis results yet. Upload a video or use your webcam to begin.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;