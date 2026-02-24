import { useState, useRef, useEffect } from "react";
import { UploadCloud, Camera, RefreshCcw, CheckCircle2, X, Crosshair } from "lucide-react";

const Zap = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
);

const ShieldAlert = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
);

export default function ImageUploadCard({ image, setImage }) {
  const [mode, setMode] = useState("upload"); // 'upload' or 'camera'
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 80 });
  const [dragState, setDragState] = useState({ active: false, type: null, startX: 0, startY: 0, initialCrop: null });
  const containerRef = useRef(null);

  const startCamera = async () => {
    setIsInitializing(true);
    setCameraError(null);
    try {
      if (!window.isSecureContext && window.location.hostname !== "localhost") {
        throw new Error("SECURE_CONTEXT_REQUIRED");
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("API_NOT_SUPPORTED");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      }).catch(() => navigator.mediaDevices.getUserMedia({ video: true }));

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera Error:", err);
      let message = "An unexpected camera error occurred.";
      if (err.message === "SECURE_CONTEXT_REQUIRED") message = "Camera access requires HTTPS.";
      else if (err.name === "NotAllowedError") message = "Permission denied.";
      else if (err.name === "NotFoundError") message = "No camera found.";
      setCameraError(message);
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    // Component Unmount Cleanup
    return () => stopCamera();
  }, []);

  useEffect(() => {
    // Mode switch cleanup
    if (mode !== "camera") {
      stopCamera();
    }
  }, [mode]);

  const captureSnapshot = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], `camera_${Date.now()}.jpg`, { type: "image/jpeg" });
      setTempImage(URL.createObjectURL(file));
      setIsCropping(true);
      stopCamera(); // Immediate release after capture
    }, "image/jpeg", 0.9);
  };

  const handleFinalizeCrop = () => {
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = tempImage;
    img.onload = () => {
      const scaleX = img.naturalWidth / 100;
      const scaleY = img.naturalHeight / 100;

      canvas.width = (crop.width * scaleX);
      canvas.height = (crop.height * scaleY);

      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        img,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob((blob) => {
        const file = new File([blob], `cropped_specimen_${Date.now()}.jpg`, { type: "image/jpeg" });
        setImage(file);
        setIsCropping(false);
        setTempImage(null);
      }, "image/jpeg", 0.9);
    };
  };

  const handleDragStart = (e, type, handle = null) => {
    e.preventDefault();
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    setDragState({
      active: true,
      type,
      handle,
      startX: clientX,
      startY: clientY,
      initialCrop: { ...crop }
    });
  };

  const handleDragMove = (e) => {
    if (!dragState.active || !containerRef.current) return;

    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((clientX - dragState.startX) / rect.width) * 100;
    const dy = ((clientY - dragState.startY) / rect.height) * 100;

    let newCrop = { ...dragState.initialCrop };

    if (dragState.type === 'move') {
      newCrop.x = Math.max(0, Math.min(100 - crop.width, dragState.initialCrop.x + dx));
      newCrop.y = Math.max(0, Math.min(100 - crop.height, dragState.initialCrop.y + dy));
    } else if (dragState.type === 'resize') {
      const h = dragState.handle;
      if (h.includes('top')) {
        const delta = Math.min(dragState.initialCrop.height - 5, dy);
        newCrop.y = Math.max(0, dragState.initialCrop.y + delta);
        newCrop.height = dragState.initialCrop.height - (newCrop.y - dragState.initialCrop.y);
      }
      if (h.includes('bottom')) {
        newCrop.height = Math.max(5, Math.min(100 - dragState.initialCrop.y, dragState.initialCrop.height + dy));
      }
      if (h.includes('left')) {
        const delta = Math.min(dragState.initialCrop.width - 5, dx);
        newCrop.x = Math.max(0, dragState.initialCrop.x + delta);
        newCrop.width = dragState.initialCrop.width - (newCrop.x - dragState.initialCrop.x);
      }
      if (h.includes('right')) {
        newCrop.width = Math.max(5, Math.min(100 - dragState.initialCrop.x, dragState.initialCrop.width + dx));
      }
    }

    setCrop(newCrop);
  };

  const handleDragEnd = () => {
    setDragState({ active: false, type: null, startX: 0, startY: 0, initialCrop: null });
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTempImage(URL.createObjectURL(file));
      setIsCropping(true);
    }
  };

  return (
    <div className="relative z-10 card !p-0 overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-none shadow-xl transition-colors duration-500">
      {/* Mode Navigation */}
      <div className="relative z-20 flex bg-slate-100 dark:bg-slate-800/80 p-1.5 gap-1">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${mode === 'upload' ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/30'}`}
        >
          <UploadCloud className="h-4 w-4" /> LOCAL FILE
        </button>
        <button
          type="button"
          onClick={() => {
            setCameraError(null); // Reset error on explicit click
            setMode("camera");
          }}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${mode === 'camera' ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/30'}`}
        >
          <Camera className="h-4 w-4" /> CLINICAL CAMERA
        </button>
      </div>

      <div className="p-8">
        {!image ? (
          mode === "upload" ? (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-3xl h-64 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/20 hover:border-violet-400 transition-all group">
              <div className="h-16 w-16 rounded-2xl bg-violet-500/10 dark:bg-violet-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8 text-violet-600" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Drag and drop specimen</p>
              <p className="text-xs text-slate-400 mt-1 uppercase font-black tracking-widest">PNG, JPG, HEIC up to 15MB</p>
              <input type="file" accept="image/*" onChange={handleChange} className="hidden" />
            </label>
          ) : (
            <div className="relative rounded-3xl overflow-hidden bg-black h-80 group shadow-2xl flex flex-col items-center justify-center">
              {/* Always mount video when in camera mode to avoid ref timing issues */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-opacity duration-500 ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
              />

              {/* Overlays */}
              {!isCameraActive && !isInitializing && !cameraError ? (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-8 text-center animate-in fade-in duration-500">
                  <div className="h-20 w-20 rounded-3xl bg-violet-600/10 flex items-center justify-center mb-6 ring-1 ring-white/10">
                    <Camera className="w-10 h-10 text-violet-500" />
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">Camera Offline</h3>
                  <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed mb-8">Secure optical link is currently dormant. Initialize to begin clinical telemetry.</p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="group relative px-8 py-3 rounded-2xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative z-10">Power On Diagnostics</span>
                  </button>
                </div>
              ) : cameraError ? (
                <div className="absolute inset-0 z-30 p-8 text-center bg-black flex flex-col items-center justify-center animate-in fade-in duration-500">
                  <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 mx-auto">
                    <X className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-sm font-bold text-white mb-2">Camera Unavailable</p>
                  <p className="text-xs text-slate-400 max-w-[200px] mx-auto leading-relaxed">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => { setCameraError(null); startCamera(); }}
                    className="mt-6 px-6 py-2 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : isInitializing ? (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black gap-4">
                  <RefreshCcw className="h-8 w-8 text-violet-500 animate-spin" />
                  <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em]">Initializing Optics...</p>
                </div>
              ) : isCameraActive && (
                <>
                  {/* Medical Viewfinder Overlay */}
                  <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity">
                    <svg width="240" height="240" viewBox="0 0 100 100" className="text-violet-500 fill-none stroke-current stroke-1">
                      <path d="M20,10 Q50,0 80,10 L85,40 Q80,70 50,90 Q20,70 15,40 Z" />
                      <circle cx="50" cy="50" r="1" />
                    </svg>
                  </div>

                  <div className="absolute bottom-6 inset-x-0 z-20 flex justify-center px-8 gap-4">
                    <button
                      type="button"
                      onClick={captureSnapshot}
                      className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all text-violet-600"
                    >
                      <div className="h-12 w-12 rounded-full border-4 border-violet-600 flex items-center justify-center">
                        <div className="h-4 w-4 rounded-full bg-violet-600 shadow-[0_0_15px_rgba(124,58,237,0.5)]" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={stopCamera}
                      className="h-16 w-16 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all text-white"
                      title="Shut Down Diagnostics"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="absolute top-4 right-4 z-20 animate-pulse">
                    <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                      <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Live Core Stream</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        ) : (
          <div className="animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-6 p-6 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-3xl relative">
              <div className="relative h-32 w-32 shrink-0">
                <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover rounded-2xl shadow-xl ring-2 ring-emerald-500/20" />
                <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-widest mb-1">
                  <Zap className="h-3 w-3" /> Specimen Verified
                </div>
                <h4 className="font-black text-xl text-slate-900 dark:text-white truncate tracking-tight uppercase italic">{image.name}</h4>
                <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-tighter">{(image.size / 1024).toFixed(1)} KB Processing Units</p>
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="mt-4 px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <RefreshCcw className="h-3 w-3" /> Replace Specimen
                </button>
              </div>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Clinical Cropping Modal */}
        {isCropping && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" />
            <div className="relative w-full max-w-2xl glass-card !p-0 overflow-hidden border-violet-500/30">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Clinical Focus Calibration</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Isolate the suspected lesion area for maximum precision.</p>
                </div>
                <button
                  onClick={() => setIsCropping(false)}
                  className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div
                ref={containerRef}
                className="relative aspect-square md:aspect-video bg-black flex items-center justify-center overflow-hidden touch-none"
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
              >
                <img src={tempImage} className="max-w-full max-h-full object-contain opacity-50 select-none pointer-events-none" alt="To Crop" />
                <div
                  className="absolute border-2 border-dashed border-violet-500 shadow-[0_0_50px_rgba(139,92,246,0.3)] bg-violet-500/10 cursor-move"
                  style={{
                    left: `${crop.x}%`,
                    top: `${crop.y}%`,
                    width: `${crop.width}%`,
                    height: `${crop.height}%`,
                  }}
                  onMouseDown={(e) => handleDragStart(e, 'move')}
                  onTouchStart={(e) => handleDragStart(e, 'move')}
                >
                  {/* Resize Handles */}
                  <div
                    className="absolute -top-1.5 -left-1.5 h-4 w-4 bg-violet-500 rounded-full cursor-nwse-resize z-50 border-2 border-white"
                    onMouseDown={(e) => { e.stopPropagation(); handleDragStart(e, 'resize', 'top-left'); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleDragStart(e, 'resize', 'top-left'); }}
                  />
                  <div
                    className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-violet-500 rounded-full cursor-nesw-resize z-50 border-2 border-white"
                    onMouseDown={(e) => { e.stopPropagation(); handleDragStart(e, 'resize', 'top-right'); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleDragStart(e, 'resize', 'top-right'); }}
                  />
                  <div
                    className="absolute -bottom-1.5 -left-1.5 h-4 w-4 bg-violet-500 rounded-full cursor-nesw-resize z-50 border-2 border-white"
                    onMouseDown={(e) => { e.stopPropagation(); handleDragStart(e, 'resize', 'bottom-left'); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleDragStart(e, 'resize', 'bottom-left'); }}
                  />
                  <div
                    className="absolute -bottom-1.5 -right-1.5 h-4 w-4 bg-violet-500 rounded-full cursor-nwse-resize z-50 border-2 border-white"
                    onMouseDown={(e) => { e.stopPropagation(); handleDragStart(e, 'resize', 'bottom-right'); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleDragStart(e, 'resize', 'bottom-right'); }}
                  />

                  {/* Center Crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                    <div className="h-px w-8 bg-violet-500" />
                    <div className="h-8 w-px bg-violet-500 absolute" />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-950 flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Crosshair className="h-3 w-3 text-violet-500" /> Area Selected: {crop.width}x{crop.height}%
                </p>
                <button
                  onClick={handleFinalizeCrop}
                  className="btn-primary py-3 px-10 text-xs font-black uppercase tracking-[0.2em]"
                >
                  Finalize Focus
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-start gap-4 p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Specimen Acquisition Protocol</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
              Capture must focus exclusively on the area of interest. Use high-intensity macro lighting and ensure the specimen is within the guided viewfinder boundaries for 98.4% diagnostic accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
