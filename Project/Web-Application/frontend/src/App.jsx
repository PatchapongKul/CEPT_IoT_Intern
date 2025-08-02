import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.jsx";
import PowerFlow_DashboardApp from "./components/PowerFlow_Dashboard/PowerFlow_DashboardApp.jsx";
import Summary_PowerApp from "./components/Summary_Power/Summary_PowerApp.jsx";
import ForecastedApp from './components/Forecasted/ForecastedApp.jsx';

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<PowerFlow_DashboardApp />} />
        <Route path="/SummaryPower" element={<Summary_PowerApp />} />
        <Route path="/Forecasted" element={<ForecastedApp />} />
      </Routes>
    </Router>
  );
}

export default App;
