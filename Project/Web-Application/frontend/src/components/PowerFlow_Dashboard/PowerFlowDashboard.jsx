import React, { useState } from "react";
import axios from "axios";
import { componentImages } from "./componentsData";
import ComponentCard from "./ComponentCard";
import ArrowLine from "./Arrowline"; // Import the ArrowLine component

export default function PowerFlowDashboard() {
  const [selected, setSelected] = useState(null);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalLoad, setTotalLoad] = useState(0);

  React.useEffect(() => {
    axios
      .get("http://localhost:3000/api/power_flow")
      .then((res) => {
        const data = res.data;
        console.log("Data from backend:", data); // ดูข้อมูลที่ backend ส่งมา
        // จัดเรียงข้อมูลจาก backend ตามลำดับที่ layout ต้องการ
        const order = [
          "grid_kw",
          "solar_power_kw",
          "battery1_kw",
          "battery2_kw",
          "ev_charger_kw",
          "load_site1_kw",
          "load_site2_kw",
          "load_site3_kw",
        ];
        // Always treat backend data as object, not array
        const nameMap = {
          grid_kw: "Grid",
          solar_power_kw: "Solar PV",
          battery1_kw: "Battery 1",
          battery2_kw: "Battery 2",
          ev_charger_kw: "EV Charger",
          load_site1_kw: "Gewertz",
          load_site2_kw: "ESID",
          load_site3_kw: "Innovation Space",
        };
        const mapped = order.map((key) => {
          const value = data[key];
          let imgKey = key;
          if (key === "solar_power_kw") imgKey = "pv";
          if (key === "battery1_kw") imgKey = "battery1";
          if (key === "battery2_kw") imgKey = "battery2";
          if (key === "ev_charger_kw") imgKey = "ev_charger";
          if (key === "load_site1_kw") imgKey = "gewertz";
          if (key === "load_site2_kw") imgKey = "esid";
          if (key === "load_site3_kw") imgKey = "innovation_space";
          if (key === "grid_kw") imgKey = "grid";
          return {
            key,
            name: nameMap[key],
            summary: "",
            detail: "",
            watt: typeof value === "number" ? parseFloat(value.toFixed(2)) : 0,
            img: componentImages[imgKey],
          };
        });
        setComponents(mapped);
        if (typeof data.total_load_kw === "number") {
          setTotalLoad(parseFloat(data.total_load_kw.toFixed(2)));
        } else {
          setTotalLoad(0);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <main className="flex-1 flex flex-col items-center justify-center relative">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 mt-8 text-center">
          Power Flow Dashboard
        </h1>
        {/* Layout box */}
        <div
          className="relative w-full flex flex-col items-center scale-75 md:scale-90 lg:scale-100"
          style={{ height: 400, maxWidth: "1000px", margin: "0 auto" }}
        >
          {/* Background box */}
          <div
            className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 w-[1120px] h-[390px] rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white/90 via-blue-50 to-blue-100 shadow-2xl z-0 pointer-events-none"
            style={{
              boxShadow:
                "0 8px 32px 0 rgba(30,41,59,0.18), 0 0 0 4px #2563eb33, 0 1.5px 0 0 #fff inset, 0 0.5px 0 0 #2563eb inset",
            }}
          />
          {/* Main solid horizontal line */}
          <div className="absolute left-[7%] right-[7%] top-1/2 -translate-y-1/2 h-1 z-15 overflow-visible pointer-events-none">
            <svg width="100%" height="100%" className="w-full block">
              <line
                x1="0"
                y1="2"
                x2="100%"
                y2="2"
                stroke="#2563eb"
                strokeWidth="4"
              />
            </svg>
            <ArrowLine
              className={
                "absolute top-1 left-0 w-full -translate-y-1/2 z-10 overflow-hidden"
              }
              count={6}
            />{" "}
            {/* ลูกศรเคลื่อนไหวบนเส้นกลางจากซ้ายไปขวา */}
          </div>
          {/* GRID */}
          {components[0] && (
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center group z-20"
              style={{ width: "130px" }}
            >
              <img
                src={components[0].img}
                alt={components[0].name}
                className="w-[96px] h-[128px] object-cover rounded-lg shadow-md bg-white border border-gray-200 cursor-pointer"
                onClick={() => setSelected(components[0])}
              />
              <div
                className="absolute left-1/2 top-full mt-2 -translate-x-1/2 select-none pointer-events-none whitespace-nowrap px-2 rounded shadow-md border border-gray-300 bg-white/90"
                style={{ fontWeight: 600, fontSize: "1.18rem" }}
              >
                {components[0].watt} kW
              </div>
            </div>
          )}
          {/* PV */}
          {components[1] && (
            <div
              className="absolute left-[19%] top-[9%] flex flex-col items-center group z-10"
              style={{ width: "130px" }}
            >
              <img
                src={components[1].img}
                alt={components[1].name}
                className="w-[96px] h-[128px] object-cover rounded-lg shadow-md bg-white border border-gray-200 cursor-pointer z-10"
                onClick={() => setSelected(components[1])}
              />
              <div
                className="absolute left-full top-1/2 -translate-y-1/2 -ml-2 select-none pointer-events-none whitespace-nowrap px-2 rounded shadow-md border border-gray-300 bg-white/90"
                style={{ fontWeight: 600, fontSize: "1.18rem" }}
              >
                {components[1].watt} kW
              </div>
              <div
                className="absolute left-1/2 top-full w-8 h-full  z-0 overflow-visible pointer-events-none"
                style={{ height: "calc(53% - 2rem)" }}
              >
                <svg
                  width="4"
                  height="100%"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                  }}
                >
                  <line
                    x1="2"
                    y1="0"
                    x2="2"
                    y2="100%"
                    stroke="#2563eb"
                    strokeWidth="4"
                  />
                </svg>
                <ArrowLine
                  className={
                    "rotate-90 absolute -left-1 w-full -translate-x-1/2 z-5 overflow-hidden"
                  }
                  count={6}
                />{" "}
                {/* ลูกศรเคลื่อนไหวบนเส้นกลางจากซ้ายไปขวา */}
              </div>
            </div>
          )}
          {/* BATTERY 1 */}
          {components[2] && (
            <div
              className="absolute left-[ุ60%] top-[10%] flex flex-col items-center group z-10"
              style={{ width: "130px" }}
            >
              <img
                src={components[2].img}
                alt={components[2].name}
                className="w-[96px] h-[128px] object-cover rounded-lg shadow-md bg-white border border-gray-200 cursor-pointer"
                onClick={() => setSelected(components[2])}
              />
              <div
                className="absolute left-28 top-1/2 -translate-y-full ml-2 select-none pointer-events-none whitespace-nowrap px-2 rounded shadow-md border border-gray-300 bg-white/90"
                style={{ fontWeight: 600, fontSize: "1.18rem" }}
              >
                {components[2].watt} kW
              </div>
              <div
                className="absolute left-1/2 top-full w-8 h-full -translate-x-1/2 z-0  overflow-visible pointer-events-none"
                style={{ height: "calc(50% - 2rem)" }}
              >
                <svg
                  width="4"
                  height="100%"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                  }}
                >
                  <line
                    x1="2"
                    y1="0"
                    x2="2"
                    y2="100%"
                    stroke="#2563eb"
                    strokeWidth="4"
                  />
                </svg>
                <ArrowLine
                  className={
                    "rotate-90 absolute -left-1 -top-1 w-full -translate-x-1/2 z-5 overflow-hidden"
                  }
                  count={6}
                />{" "}
                {/* ลูกศรเคลื่อนไหวบนเส้นกลางจากซ้ายไปขวา */}
                <ArrowLine
                  className={
                    "rotate-270 absolute left-2 -top-10 w-full -translate-x-1/2 z-5 overflow-hidden"
                  }
                  count={6}
                  color="red"
                />{" "}
                {/* ลูกศรเคลื่อนไหวบนเส้นกลางจากซ้ายไปขวา */}
              </div>
            </div>
          )}
          {/* BATTERY 2 */}
          {components[3] && (
            <div
              className="absolute left-[70%] top-[10%] flex flex-col items-center group z-10"
              style={{ width: "130px" }}
            >
              <img
                src={components[3].img}
                alt={components[3].name}
                className="w-[96px] h-[128px] object-cover rounded-lg shadow-md bg-white border border-gray-200 cursor-pointer"
                onClick={() => setSelected(components[3])}
              />

              {/* watt label */}
              <div
                className="absolute left-25 top-1/2 -translate-y-1/2 ml-6 select-none pointer-events-none whitespace-nowrap px-2 rounded shadow-md border border-gray-300 bg-white/90"
                style={{ fontWeight: 600, fontSize: "1.18rem" }}
              >
                {components[3].watt} kW
              </div>

              {/* ───── vertical line + arrows ลงมาที่เส้นหลัก ───── */}
              <div
                className="absolute left-1/2 top-full w-8 h-full -translate-x-1/2 z-0 overflow-visible pointer-events-none"
                /* สูงเท่าของแบต 1 → ปรับได้ตามต้องการ */
                style={{ height: "calc(50% - 2rem)" }}
              >
                {/* เส้นตรงสีฟ้า */}
                <svg
                  width="4"
                  height="100%"
                  className="absolute left-0 top-0 h-full"
                >
                  <line
                    x1="2"
                    y1="0"
                    x2="2"
                    y2="100%"
                    stroke="#2563eb"
                    strokeWidth="4"
                  />
                </svg>

                {/* ลูกศรวิ่งลง (แนวตั้ง)  */}
                <ArrowLine
                  className="rotate-90 absolute -left-1 -top-1 w-full -translate-x-1/2 z-5 overflow-hidden"
                  count={6}
                />

                {/* ลูกศรวิ่งขวา (แนวนอนชนเส้นหลัก)  */}
                <ArrowLine
                  className="rotate-270 absolute left-2 -top-10 w-full -translate-x-1/2 z-5 overflow-hidden"
                  count={6}
                  color="red" /* จะใช้สีเดียวกับแบต 1 ก็เปลี่ยนตรงนี้ได้ */
                />
              </div>
            </div>
          )}

          {/* EV CHARGER */}
          {components[4] && (
            <div
              className="absolute left-[85%] top-[35%] flex flex-col items-center group z-20"
              style={{ width: "130px" }}
            >
              <img
                src={components[4].img}
                alt={components[4].name}
                className="w-[96px] h-[128px] object-cover rounded-lg shadow-md bg-white border border-gray-200 cursor-pointer"
                onClick={() => setSelected(components[4])}
              />
              <div
                className="absolute right-[-70px] top-1/2 -translate-y-1/2 select-none pointer-events-none whitespace-nowrap px-2 rounded shadow-md border border-gray-300 bg-white/90"
                style={{ fontWeight: 600, fontSize: "1.18rem" }}
              >
                {components[4].watt} kW
              </div>
            </div>
          )}
          {/* GEWERTZ */}
          {components[5] && (
            <div
              className="absolute left-[17%] bottom-[9%] flex flex-col items-center group z-10"
              style={{ width: "130px" }}
            >
              {/* รูปอุปกรณ์ */}
              <img
                src={components[5].img}
                alt={components[5].name}
                className="w-[96px] h-[128px] object-cover rounded-lg shadow-md bg-white border border-gray-200 cursor-pointer"
                onClick={() => setSelected(components[5])}
              />

              {/* ป้าย Watt */}
              <div
                className="absolute right-[-70px] top-1/2 -translate-y-1/2 select-none whitespace-nowrap px-2 rounded shadow-md border border-gray-300 bg-white/90"
                style={{ fontWeight: 600, fontSize: "1.18rem" }}
              >
                {components[5].watt} kW
              </div>

              {/* ─── เส้นตั้ง + ลูกศรวิ่งลง (ยาวเท่า PV) ─── */}
              <div
                className="absolute left-1/2 bottom-full w-8 h-full -translate-x-1/2 z-0 overflow-visible pointer-events-none"
                /* ความสูงเท่า PV: 53% - 2rem */
                style={{ height: "calc(53% - 2rem)" }}
              >
                {/* เส้นตรงสีฟ้า */}
                <svg
                  width="4"
                  height="100%"
                  className="absolute left-0 top-0 h-full"
                >
                  <line
                    x1="2"
                    y1="0"
                    x2="2"
                    y2="100%"
                    stroke="#2563eb"
                    strokeWidth="4"
                  />
                </svg>

                {/* ลูกศรวิ่งลง (หมุน 90°) */}
                <ArrowLine
                  className="rotate-90 absolute -left-1 top-0 w-full -translate-x-1/2 z-10 overflow-hidden"
                  count={6}
                />
              </div>
            </div>
          )}

          {/* ESID */}
          {components[6] && (
            <div
              className="absolute left-[40%] bottom-[9%] flex flex-col items-center group z-10"
              style={{ width: "130px" }}
            >
              {/* รูปอุปกรณ์ */}
              <img
                src={components[6].img}
                alt={components[6].name}
                className="w-[96px] h-[128px] object-cover rounded-lg shadow-md bg-white border border-gray-200 cursor-pointer"
                onClick={() => setSelected(components[6])}
              />

              {/* ป้าย Watt */}
              <div
                className="absolute right-[-70px] top-1/2 -translate-y-1/2 select-none whitespace-nowrap px-2 rounded shadow-md border border-gray-300 bg-white/90"
                style={{ fontWeight: 600, fontSize: "1.18rem" }}
              >
                {components[6].watt} kW
              </div>

              {/* ─── เส้นตั้ง + ลูกศรวิ่งลง (ยาวเท่า Gewertz) ─── */}
              <div
                className="absolute left-1/2 bottom-full w-8 h-full -translate-x-1/2 z-0 overflow-visible pointer-events-none"
                /* ความสูงเท่าเส้น Gewertz / PV */
                style={{ height: "calc(53% - 2rem)" }}
              >
                {/* เส้นตรงสีฟ้า */}
                <svg
                  width="4"
                  height="100%"
                  className="absolute left-0 top-0 h-full"
                >
                  <line
                    x1="2"
                    y1="0"
                    x2="2"
                    y2="100%"
                    stroke="#2563eb"
                    strokeWidth="4"
                  />
                </svg>

                {/* ลูกศรวิ่งลง (หมุน 90°) */}
                <ArrowLine
                  className="rotate-90 absolute -left-1 top-0 w-full -translate-x-1/2 z-10 overflow-hidden"
                  count={6}
                />
              </div>
            </div>
          )}

          {/* INNOVATION SPACE */}
          {components[7] && (
            <div
              className="absolute left-[64%] bottom-[9%] flex flex-col items-center group z-10"
              style={{ width: "130px" }}
            >
              <img
                src={components[7].img}
                alt={components[7].name}
                className="w-[96px] h-[128px] object-cover rounded-lg shadow-md bg-white border border-gray-200 cursor-pointer"
                onClick={() => setSelected(components[7])}
              />
              <div
                className="absolute left-25 top-1/2 -translate-y-1/2 ml-6 select-none pointer-events-none whitespace-nowrap px-2 rounded shadow-md border border-gray-300 bg-white/90"
                style={{ fontWeight: 600, fontSize: "1.18rem" }}
              >
                {components[7].watt} kW
              </div>
              <div
                className="absolute left-1/2 bottom-full w-10 h-[90px] -translate-x-1/2 z-0"
                style={{ height: "calc(30%)" }}
              >
                <svg
                  width="4"
                  height="100%"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                  }}
                >
                  <line
                    x1="2"
                    y1="100%"
                    x2="2"
                    y2="0"
                    stroke="#2563eb"
                    strokeWidth="4"
                  />
                </svg>

                <ArrowLine
                  className={
                    "rotate-90 absolute -left-1 w-full -translate-x-1/2 z-5 overflow-hidden"
                  }
                  count={6}
                />
              </div>
            </div>
          )}
        </div>
        {/* Modal/Card for detail on click */}
        {selected && (
          <ComponentCard
            component={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </main>
      {/* Bottom summary */}
      <footer className="w-full bg-white border-t border-gray-200 py-4 flex flex-col items-center shadow-sm">
        <div className="text-gray-700 text-base md:text-lg font-semibold">
          Total Power Usage:{" "}
          <span className="text-blue-600 font-bold">{totalLoad} kW</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          All values are for demonstration only.
        </div>
      </footer>
    </div>
  );
}
