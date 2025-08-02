import ArrowLine from "./Arrowline";

function BottomFlow({ className, component, setSelected }) {
  return (
    <div
      className={`${className} absolute bottom-[2%] flex flex-col items-center group z-10`}
      style={{ width: "130px" }}
    >
      {/* รูปอุปกรณ์ */}
      <img
        src={component.img}
        alt={component.name}
        className="w-[96px] h-[128px] object-cover rounded-lg shadow-md bg-white border border-gray-200 cursor-pointer"
        onClick={() => setSelected(component)}
      />

      {/* ป้าย Watt */}
      <div
        className="absolute right-[-70px] top-1/2 -translate-y-1/2 select-none whitespace-nowrap px-2 rounded shadow-md border border-gray-300 bg-white/90"
        style={{ fontWeight: 600, fontSize: "1.18rem" }}
      >
        {component.watt} kW
      </div>

      {/* ─── เส้นตั้ง + ลูกศรวิ่งลง (ยาวเท่า PV) ─── */}
      <div
        className="absolute left-1/2 bottom-full w-23  z-0 overflow-visible pointer-events-none"
        /* ความสูงเท่า PV: 53% - 2rem */
        style={{ height: "calc(50%)" }}
      >
        {/* เส้นตรงสีฟ้า */}
        <svg width="4" height="100%" className="absolute left-0 top-0 h-full">
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
          className=" rotate-90 absolute -left-5 top-0 w-full -translate-x-1/2 z-10 overflow-visible"
          count={1}
          speed={2}
        />
      </div>
    </div>
  );
}

export default BottomFlow;
