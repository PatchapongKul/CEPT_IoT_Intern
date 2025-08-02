import { Link } from "react-router-dom";
import "./Navbar.css"; // อย่าลืมสร้างไฟล์นี้

function Navbar() {
  return (
    <div>
      <nav className="navbar">
        <div className="navbar-logo">Energy Dashboard</div>
        <ul className="nav-links">
          <li><Link to="/">Power Flow</Link></li>
          <li><Link to="/SummaryPower">Summary Power</Link></li>
          <li><Link to="/Forecasted">Power and Forecasted Power</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default Navbar;