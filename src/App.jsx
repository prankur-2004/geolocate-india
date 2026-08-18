import React, { useState, useEffect } from "react";
import { INDIA_LOCATIONS, WORLD_LOCATIONS } from "./data/locations";
import { calculateDistance, calculateScore } from "./utils/geoMath";
import GuessMap from "./components/GuessMap";
import confetti from "canvas-confetti";

// Web Audio API Sound generator (zero external files required)
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === "success") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    // Audio safe fallback
  }
};

export default function App() {
  const [gameMode, setGameMode] = useState("india");
  const [locations, setLocations] = useState(INDIA_LOCATIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guessCoords, setGuessCoords] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [roundResult, setRoundResult] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setLocations(gameMode === "india" ? INDIA_LOCATIONS : WORLD_LOCATIONS);
    handleRestart();
  }, [gameMode]);

  const currentLocation = locations[currentIndex] || locations[0];

  const handleSelectPin = (coords) => {
    playSound("click");
    setGuessCoords(coords);
  };

  const handleGuess = () => {
    if (!guessCoords) return;

    const distance = calculateDistance(
      guessCoords[0],
      guessCoords[1],
      currentLocation.lat,
      currentLocation.lng
    );
    const score = calculateScore(distance);

    if (score >= 4000) {
      setStreak((s) => s + 1);
      playSound("success");
      confetti({ particleCount: 90, spread: 65, origin: { y: 0.6 } });
    } else {
      setStreak(0);
      playSound("click");
    }

    setTotalScore((prev) => prev + score);
    setRoundResult({ distance, score });
    setIsSubmitted(true);
  };

  const handleNextRound = () => {
    playSound("click");
    if (currentIndex + 1 < locations.length) {
      setCurrentIndex((prev) => prev + 1);
      setGuessCoords(null);
      setIsSubmitted(false);
      setRoundResult(null);
    } else {
      setIsGameOver(true);
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setGuessCoords(null);
    setIsSubmitted(false);
    setRoundResult(null);
    setTotalScore(0);
    setStreak(0);
    setIsGameOver(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#080c14",
        backgroundImage: "radial-gradient(ellipse at 50% 0%, #172554 0%, #080c14 70%)",
        color: "#f8fafc",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "14px 28px",
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "800", margin: 0, letterSpacing: "-0.5px" }}>
            <span style={{ color: "#38bdf8" }}>Geo</span>
            <span style={{ color: "#f8fafc" }}>Pulse</span>
          </h1>

          {/* Mode Switcher */}
          <div
            style={{
              display: "flex",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              borderRadius: "10px",
              padding: "3px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <button
              onClick={() => setGameMode("india")}
              style={{
                padding: "6px 14px",
                borderRadius: "7px",
                border: "none",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                backgroundColor: gameMode === "india" ? "#38bdf8" : "transparent",
                color: gameMode === "india" ? "#04101e" : "#94a3b8",
                transition: "all 0.2s",
              }}
            >
              🇮🇳 India Mode
            </button>
            <button
              onClick={() => setGameMode("world")}
              style={{
                padding: "6px 14px",
                borderRadius: "7px",
                border: "none",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                backgroundColor: gameMode === "world" ? "#38bdf8" : "transparent",
                color: gameMode === "world" ? "#04101e" : "#94a3b8",
                transition: "all 0.2s",
              }}
            >
              🌍 World Wonders
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
          {streak > 1 && (
            <div
              style={{
                padding: "4px 10px",
                backgroundColor: "rgba(245, 158, 11, 0.2)",
                border: "1px solid #f59e0b",
                borderRadius: "20px",
                color: "#fbbf24",
                fontSize: "12px",
                fontWeight: "700",
              }}
            >
              🔥 {streak} Streak!
            </div>
          )}
          <div style={{ fontSize: "14px", color: "#cbd5e1" }}>
            Round <strong style={{ color: "#fff" }}>{currentIndex + 1}</strong>/{locations.length}
          </div>
          <div
            style={{
              padding: "6px 16px",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "10px",
              color: "#34d399",
              fontSize: "15px",
              fontWeight: "800",
            }}
          >
            {totalScore} <span style={{ fontSize: "11px", fontWeight: "600" }}>PTS</span>
          </div>
        </div>
      </header>

      {/* Main Gameplay Screen */}
      <main
        style={{
          flex: 1,
          padding: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: "20px",
          maxWidth: "1600px",
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Left Side: Mystery Place Card */}
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            borderRadius: "18px",
            padding: "18px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              position: "relative",
              height: "380px",
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: "#0f172a",
            }}
          >
            <img
              src={currentLocation.imageUrl}
              alt="Mystery Location"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "16px",
                background: "linear-gradient(transparent, rgba(0,0,0,0.9))",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#38bdf8",
                  backgroundColor: "rgba(56, 189, 248, 0.15)",
                  padding: "3px 8px",
                  borderRadius: "6px",
                }}
              >
                Clue
              </span>
              <p style={{ margin: "6px 0 0 0", fontSize: "14px", color: "#e2e8f0", lineHeight: "1.4" }}>
                {currentLocation.hint}
              </p>
            </div>
          </div>

          {/* Action / Result Bar */}
          <div
            style={{
              marginTop: "16px",
              padding: "14px",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              {roundResult ? (
                <div>
                  <h4 style={{ margin: 0, fontSize: "16px", color: "#38bdf8", fontWeight: "700" }}>
                    {currentLocation.name}
                  </h4>
                  <p style={{ margin: "3px 0 0 0", fontSize: "13px", color: "#cbd5e1" }}>
                    Off by <strong style={{ color: "#fbbf24" }}>{roundResult.distance} km</strong> • Earned{" "}
                    <strong style={{ color: "#34d399" }}>+{roundResult.score} pts</strong>
                  </p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#94a3b8", fontStyle: "italic" }}>
                    ✨ {currentLocation.funFact}
                  </p>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
                  📍 Click on the map to pin your guess, then submit!
                </p>
              )}
            </div>

            {!isSubmitted ? (
              <button
                onClick={handleGuess}
                disabled={!guessCoords}
                style={{
                  padding: "12px 24px",
                  borderRadius: "10px",
                  backgroundColor: guessCoords ? "#10b981" : "#1e293b",
                  color: guessCoords ? "#ffffff" : "#64748b",
                  fontWeight: "700",
                  fontSize: "14px",
                  border: "none",
                  cursor: guessCoords ? "pointer" : "not-allowed",
                  boxShadow: guessCoords ? "0 4px 14px rgba(16, 185, 129, 0.4)" : "none",
                  transition: "all 0.2s",
                }}
              >
                Submit Guess
              </button>
            ) : (
              <button
                onClick={handleNextRound}
                style={{
                  padding: "12px 24px",
                  borderRadius: "10px",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: "14px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
                  transition: "all 0.2s",
                }}
              >
                {currentIndex + 1 === locations.length ? "View Final Summary 🏆" : "Next Location →"}
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Map Container */}
        <div style={{ height: "100%" }}>
          <GuessMap
            guessCoords={guessCoords}
            setGuessCoords={handleSelectPin}
            isSubmitted={isSubmitted}
            actualCoords={[currentLocation.lat, currentLocation.lng]}
            gameMode={gameMode}
          />
        </div>
      </main>

      {/* Game Over Modal */}
      {isGameOver && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "#0f172a",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "20px",
              padding: "36px",
              maxWidth: "440px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏆</div>
            <h2 style={{ fontSize: "26px", fontWeight: "800", color: "#38bdf8", margin: "0 0 8px 0" }}>
              Adventure Complete!
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 0 24px 0" }}>
              You mastered the {gameMode === "india" ? "India" : "World"} challenge!
            </p>

            <div
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                padding: "16px",
                borderRadius: "12px",
                marginBottom: "24px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <div style={{ fontSize: "13px", color: "#94a3b8" }}>Total Score</div>
              <div style={{ fontSize: "32px", fontWeight: "900", color: "#34d399", marginTop: "4px" }}>
                {totalScore}{" "}
                <span style={{ fontSize: "16px", color: "#64748b", fontWeight: "600" }}>
                  / {locations.length * 5000}
                </span>
              </div>
            </div>

            <button
              onClick={handleRestart}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#38bdf8",
                color: "#04101e",
                fontSize: "15px",
                fontWeight: "800",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(56, 189, 248, 0.4)",
                transition: "all 0.2s",
              }}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}