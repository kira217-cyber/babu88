// src/pages/LiveGamesPlay.jsx   (or wherever you place game detail pages)
import React from "react";
import { useParams } from "react-router";
import { FaClock, FaTrophy, FaUsers, FaPlayCircle, FaShareAlt } from "react-icons/fa";

const LiveGamesPlay = () => {
  const { gameUID } = useParams();

  // You can later fetch real data using gameUID
  // For now — placeholder / demo content
  const mockGameData = {
    title: "Bangladesh U19 vs India U19 - Final",
    status: "Live",
    statusType: "live",
    datetime: "2026-02-17T14:00:00Z",
    teams: [
      { name: "Bangladesh U19", flag: "https://flagsapi.com/BD/shiny/64.png", score: "187/4" },
      { name: "India U19", flag: "https://flagsapi.com/IN/shiny/64.png", score: "142/6" },
    ],
    venue: "Sher-e-Bangla National Cricket Stadium, Mirpur",
    currentStatus: "45.2 overs • Target 245 • RR 4.12",
    liveText: "Last ball: SIX! Bangladesh need 12 runs in 4 balls",
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white">
      {/* Header / Match Info Bar */}
      <div className="bg-gradient-to-r from-yellow-600/80 via-amber-600/80 to-yellow-600/80 py-4 px-4 md:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-black drop-shadow-md">
              {mockGameData.title}
            </h1>
            <p className="text-black/90 mt-1 flex items-center justify-center md:justify-start gap-2">
              <FaClock className="text-sm" />
              {formatDate(mockGameData.datetime)} • {mockGameData.venue}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="bg-black/60 px-5 py-2 rounded-full text-center">
              <p className="text-yellow-300 font-bold text-xl">{mockGameData.status}</p>
              <p className="text-xs text-yellow-200/80">{mockGameData.currentStatus}</p>
            </div>

            <button className="flex items-center gap-2 bg-black/70 hover:bg-black/90 px-5 py-3 rounded-full font-medium transition-colors cursor-pointer">
              <FaShareAlt />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Teams Scoreboard */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {/* Team 1 */}
          <div className="bg-gray-900/60 border border-yellow-700/40 rounded-2xl p-6 text-center">
            <img
              src={mockGameData.teams[0].flag}
              alt={mockGameData.teams[0].name}
              className="w-20 h-20 mx-auto rounded-full border-4 border-yellow-500/30 shadow-lg mb-4"
            />
            <h2 className="text-2xl font-bold text-yellow-300">
              {mockGameData.teams[0].name}
            </h2>
            <p className="text-4xl md:text-5xl font-black mt-3 text-white">
              {mockGameData.teams[0].score}
            </p>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-6xl md:text-8xl font-black text-yellow-400/80">VS</div>
            <p className="text-xl text-yellow-200/70 mt-2">
              {mockGameData.liveText}
            </p>
          </div>

          {/* Team 2 */}
          <div className="bg-gray-900/60 border border-yellow-700/40 rounded-2xl p-6 text-center">
            <img
              src={mockGameData.teams[1].flag}
              alt={mockGameData.teams[1].name}
              className="w-20 h-20 mx-auto rounded-full border-4 border-yellow-500/30 shadow-lg mb-4"
            />
            <h2 className="text-2xl font-bold text-yellow-300">
              {mockGameData.teams[1].name}
            </h2>
            <p className="text-4xl md:text-5xl font-black mt-3 text-white">
              {mockGameData.teams[1].score}
            </p>
          </div>
        </div>

        {/* Live Updates / Commentary Area */}
        <div className="bg-black/50 border border-yellow-800/40 rounded-2xl p-6 md:p-8 mb-10">
          <h3 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-3">
            <FaPlayCircle className="text-yellow-300" />
            Live Updates
          </h3>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-hide">
            {[
              "45.2 • SIX! Bangladesh need 12 runs in 4 balls",
              "44.6 • OUT! Wicket! India lose their 7th",
              "42.1 • FOUR! Boundary! Pressure building",
              "40.0 • End of powerplay • Bangladesh 145/3",
            ].map((update, i) => (
              <div
                key={i}
                className="bg-gray-900/40 p-4 rounded-lg border-l-4 border-yellow-500/70"
              >
                <p className="text-yellow-100">{update}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-900/50 p-5 rounded-xl border border-yellow-700/30">
            <p className="text-sm text-yellow-300/80">Current Run Rate</p>
            <p className="text-3xl font-bold text-white">4.12</p>
          </div>
          <div className="bg-gray-900/50 p-5 rounded-xl border border-yellow-700/30">
            <p className="text-sm text-yellow-300/80">Required Run Rate</p>
            <p className="text-3xl font-bold text-white">9.00</p>
          </div>
          <div className="bg-gray-900/50 p-5 rounded-xl border border-yellow-700/30">
            <p className="text-sm text-yellow-300/80">Balls Remaining</p>
            <p className="text-3xl font-bold text-white">24</p>
          </div>
          <div className="bg-gray-900/50 p-5 rounded-xl border border-yellow-700/30">
            <p className="text-sm text-yellow-300/80">Runs Needed</p>
            <p className="text-3xl font-bold text-white">58</p>
          </div>
        </div>

        {/* Bottom Note */}
        <p className="text-center text-yellow-200/60 mt-12 text-sm">
          Game UID: <span className="font-mono text-yellow-300">{gameUID}</span>
        </p>
      </div>
    </div>
  );
};

export default LiveGamesPlay;