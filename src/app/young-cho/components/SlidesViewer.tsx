"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Search,
  Layers,
} from "lucide-react";
import { slideImages } from "../data";

export default function SlidesViewer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showIndexDropdown, setShowIndexDropdown] = useState(false);

  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const activeThumbnailRef = useRef<HTMLButtonElement>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentSlide = slideImages[currentIndex];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slideImages.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex(
      (prev) => (prev - 1 + slideImages.length) % slideImages.length
    );
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        handleNext();
      }, 3500);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, currentIndex, handleNext]);

  useEffect(() => {
    if (activeThumbnailRef.current && thumbnailContainerRef.current) {
      const container = thumbnailContainerRef.current;
      const element = activeThumbnailRef.current;

      container.scrollTo({
        left: element.offsetLeft - container.offsetWidth / 2 + element.offsetWidth / 2,
        behavior: "smooth",
      });
    }
  }, [currentIndex]);

  const handleSelectSlide = (idx: number) => {
    setCurrentIndex(idx);
    setIsPlaying(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, handleNext, handlePrev, togglePlay]);

  const keySections = [
    { title: "Introduction & Cover", index: 0 },
    { title: "Billion Soul Harvest Overview", index: 1 },
    { title: "Rev. Dr. Young Cho Intro", index: 2 },
    { title: "Go Movement Strategy", index: 3 },
    { title: "Strategic Resource Center", index: 5 },
    { title: "Jeju Global Center Base", index: 25 },
    { title: "Goal 2033 Roadmap", index: 63 },
    { title: "Closing Dedication", index: 65 },
  ];

  const filteredSlides = slideImages.filter((img) =>
    img.alt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="slides" className="py-24 bg-[#f9f9ff] relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#00b8d4]/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-[family-name:var(--font-geist-sans)] tracking-widest uppercase text-[#00b8d4] font-semibold">
            Interactive Presentation
          </span>
          <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-4xl lg:text-5xl font-bold text-[#0d223f] tracking-tight mt-2 leading-tight">
            Explore the{" "}
            <span className="text-[#00b8d4] italic font-medium">
              Vision
            </span>{" "}
            Presentation
          </h2>
          <div className="w-16 h-[2px] bg-[#00b8d4] mx-auto mt-6" />
          <p className="text-xs font-[family-name:var(--font-jakarta)] text-[#44474d] mt-4 max-w-xl mx-auto leading-relaxed">
            Dr. Young Cho&apos;s global deployment briefing slides outlining
            strategic partnerships, summits, and initiatives across the
            continents. Click to enlarge, play, or jump to specific core topics.
          </p>
        </div>

        {/* Toolbar */}
        <div className="max-w-5xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#f0f3ff] p-4 rounded-xl border border-[#b4c7ec]/20">
          <div className="relative">
            <button
              onClick={() => setShowIndexDropdown(!showIndexDropdown)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-white border border-[#b4c7ec]/30 hover:border-[#00b8d4] text-xs font-[family-name:var(--font-geist-sans)] font-semibold text-[#0d223f] shadow-sm"
            >
              <Layers className="w-4 h-4 text-[#00b8d4]" />
              <span>Jump to Section...</span>
            </button>
            <AnimatePresence>
              {showIndexDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowIndexDropdown(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-2 w-64 bg-white rounded-xl border border-[#b4c7ec]/20 shadow-lg z-40 overflow-hidden"
                  >
                    <div className="py-2 max-h-64 overflow-y-auto">
                      <div className="px-3 py-1.5 text-[10px] font-[family-name:var(--font-geist-sans)] tracking-wider uppercase text-[#00b8d4] font-bold bg-[#f0f3ff] border-b border-[#b4c7ec]/10">
                        Key Landmarks
                      </div>
                      {keySections.map((sec) => (
                        <button
                          key={sec.index}
                          onClick={() => {
                            handleSelectSlide(sec.index);
                            setShowIndexDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-[family-name:var(--font-jakarta)] font-medium hover:bg-[#f0f3ff] flex items-center justify-between ${
                            currentIndex === sec.index
                              ? "text-[#006879] bg-[#00b8d4]/5 font-semibold"
                              : "text-[#44474d]"
                          }`}
                        >
                          <span>{sec.title}</span>
                          <span className="text-[10px] font-[family-name:var(--font-geist-sans)] text-[#00b8d4]">
                            p.{sec.index + 1}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="relative flex-1 max-w-sm">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-[#44474d]/50" />
            </div>
            <input
              type="text"
              placeholder="Filter slides (e.g. Jeju, Seoul, Strategy)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white text-xs rounded-lg border border-[#b4c7ec]/30 focus:outline-none focus:border-[#00b8d4] font-[family-name:var(--font-jakarta)] placeholder-[#44474d]/45 text-[#0d223f]"
            />
          </div>

          <div className="text-xs font-[family-name:var(--font-geist-sans)] text-[#00b8d4] font-semibold bg-white border border-[#b4c7ec]/20 px-4 py-2 rounded-lg text-center">
            Slide {currentIndex + 1} of {slideImages.length}
          </div>
        </div>

        {searchQuery && (
          <div className="max-w-5xl mx-auto mb-4 px-2 flex items-center justify-between text-xs font-[family-name:var(--font-jakarta)] text-[#44474d]">
            <span>
              Found {filteredSlides.length} matches for &ldquo;{searchQuery}
              &rdquo;
            </span>
            <button
              onClick={() => setSearchQuery("")}
              className="text-[#006879] underline font-medium hover:text-[#00b8d4]"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Main Slide Stage */}
        <div className="max-w-5xl mx-auto relative group">
          <div className="relative aspect-[16/9] bg-[#0d223f] rounded-2xl overflow-hidden border-2 border-[#b4c7ec]/20 shadow-xl flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={
                  searchQuery
                    ? filteredSlides[currentIndex % filteredSlides.length]
                        ?.url || currentSlide.url
                    : currentSlide.url
                }
                alt={
                  searchQuery
                    ? filteredSlides[currentIndex % filteredSlides.length]
                        ?.alt || currentSlide.alt
                    : currentSlide.alt
                }
                referrerPolicy="no-referrer"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                onClick={toggleFullscreen}
                className="w-full h-full object-contain cursor-zoom-in"
              />
            </AnimatePresence>

            <div className="absolute inset-x-0 inset-y-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center justify-between px-6 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="pointer-events-auto p-4 rounded-full bg-[#0d223f]/60 hover:bg-[#0d223f]/80 text-white backdrop-blur-sm transition-all shadow-md transform hover:-translate-x-[2px]"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="pointer-events-auto p-4 rounded-full bg-[#0d223f]/60 hover:bg-[#0d223f]/80 text-white backdrop-blur-sm transition-all shadow-md transform hover:translate-x-[2px]"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0d223f]/90 via-[#0d223f]/50 to-transparent p-6 pt-12 flex items-end justify-between text-white z-10">
              <div className="flex flex-col space-y-1">
                <span className="text-[10px] font-[family-name:var(--font-geist-sans)] tracking-widest text-[#a9edff] uppercase font-bold">
                  {currentSlide.alt.includes("Slide")
                    ? "Global Summit briefing"
                    : "Highlight Profile Cover"}
                </span>
                <p className="text-sm md:text-base font-[family-name:var(--font-jakarta)] font-medium text-white">
                  {currentSlide.alt}
                </p>
              </div>
              <button
                onClick={toggleFullscreen}
                className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                title="View Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-between px-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlay}
                className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                  isPlaying
                    ? "bg-[#a9edff] text-[#0d223f] hover:bg-[#a9edff]/80"
                    : "bg-[#00b8d4] text-white hover:bg-[#00b8d4]/90"
                }`}
                title={isPlaying ? "Pause Autoplay" : "Start Autoplay (3.5s)"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
              <div className="text-xs font-[family-name:var(--font-jakarta)] text-[#44474d] font-medium">
                {isPlaying ? "Autoplay active" : "Slideshow paused"}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-lg border border-[#b4c7ec]/30 text-[#0d223f] bg-[#f0f3ff] hover:bg-[#f0f3ff]/80 text-xs font-bold font-[family-name:var(--font-geist-sans)] flex items-center space-x-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2.5 rounded-lg bg-[#0d223f] text-white hover:bg-[#0d223f]/90 text-xs font-bold font-[family-name:var(--font-geist-sans)] flex items-center space-x-1.5"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="mt-8">
            <p className="text-[10px] font-[family-name:var(--font-geist-sans)] uppercase tracking-widest text-[#00b8d4] mb-3 font-bold pl-1">
              Slide index thumbnails
            </p>
            <div
              ref={thumbnailContainerRef}
              className="flex items-center space-x-3 overflow-x-auto py-3 px-1 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {(searchQuery ? filteredSlides : slideImages).map(
                (slide, idx) => {
                  const actualIndex = searchQuery
                    ? slideImages.indexOf(slide)
                    : idx;
                  const isSelected = currentIndex === actualIndex;
                  return (
                    <button
                      ref={isSelected ? activeThumbnailRef : null}
                      key={actualIndex}
                      onClick={() => handleSelectSlide(actualIndex)}
                      className={`flex-shrink-0 relative w-20 aspect-[16/9] rounded-lg overflow-hidden border-2 transition-all shadow-sm ${
                        isSelected
                          ? "border-[#00b8d4] scale-[1.04] ring-2 ring-[#00b8d4]/20"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={slide.url}
                        alt={slide.alt}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 right-1 px-1 py-[1px] bg-[#0d223f]/70 rounded text-[8px] font-[family-name:var(--font-geist-sans)] text-white">
                        {idx + 1}
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0d223f]/98 backdrop-blur-md flex flex-col justify-between p-6"
          >
            <div className="flex items-center justify-between text-white max-w-7xl mx-auto w-full">
              <div>
                <span className="text-[10px] font-[family-name:var(--font-geist-sans)] uppercase tracking-widest text-[#a9edff] font-bold">
                  Rev. Dr. Young Cho Presentation
                </span>
                <h3 className="font-[family-name:var(--font-jakarta)] text-lg font-bold">
                  {currentSlide.alt}
                </h3>
              </div>
              <div className="flex items-center space-x-6">
                <span className="font-[family-name:var(--font-geist-sans)] text-xs text-white/60">
                  Slide {currentIndex + 1} / {slideImages.length}
                </span>
                <button
                  onClick={toggleFullscreen}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center max-w-7xl mx-auto w-full my-6 relative">
              <button
                onClick={handlePrev}
                className="absolute left-4 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm transition-all"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <img
                src={currentSlide.url}
                alt={currentSlide.alt}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
              />

              <button
                onClick={handleNext}
                className="absolute right-4 p-4 rounded-full bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm transition-all"
                aria-label="Next slide"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>

            <div className="max-w-4xl mx-auto w-full text-center pb-4 text-xs font-[family-name:var(--font-geist-sans)] text-white/50">
              *Press Arrow Keys Left/Right to browse slides. Press Space to
              play/pause slideshow. Press ESC to exit.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
