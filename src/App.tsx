/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Feed from "./pages/Feed";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-pastel-gradient dark:bg-none dark:bg-gray-900 font-display text-gray-900 dark:text-gray-100 antialiased overflow-x-hidden flex flex-col">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/feed" element={<Feed />} />
        </Routes>
      </div>
    </Router>
  );
}
