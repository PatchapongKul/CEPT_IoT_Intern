import BranchArrows from "./BranchArrows";
function ComponentCard({ component, onClose }) {
  const { img, name, summary, detail, watt, key } = component;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 transition-all duration-200"
      onClick={onClose}
    >
      {/* ลูกศรตกแต่งด้านบนของ Card */}
      
      <div
        className="bg-white rounded-3xl shadow-2xl p-8 w-[95vw] max-w-xl relative animate-fade-in border border-blue-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 text-3xl font-bold focus:outline-none transition-colors duration-150"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="flex items-center gap-5 mb-6">
          <img
            src={img}
            alt={name}
            className="w-16 h-24 rounded-xl bg-blue-50 border border-blue-200 shadow-md"
          />
          <div>
            <div className="text-2xl font-extrabold text-gray-800 leading-tight mb-1 drop-shadow">
              {name}
            </div>
            <div className="text-base text-blue-700 font-semibold mb-1">
              {summary}
            </div>
            <div className="text-xs text-gray-400 tracking-widest uppercase">
              {key.replace(/_/g, " ")}
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-10 mb-5 mt-2 justify-center">
          <div>
            <div className="text-xs text-gray-500 font-semibold">Current Power</div>
            <div className="text-blue-600 font-extrabold text-3xl md:text-4xl leading-tight drop-shadow">
              {watt} kW
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 font-semibold">Status</div>
            <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-base font-bold shadow border border-blue-200">
              Active
            </span>
          </div>
        </div>
        <div className="mb-5">
          <div className="text-base font-bold text-gray-700 mb-1">Description</div>
          <div className="text-gray-600 text-base leading-relaxed">{detail}</div>
        </div>
        
        <div>
          <div className="text-base font-bold text-gray-700 mb-1">Technical Specifications</div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-base">
            {key && (
              <>
                <div className="flex gap-2">
                  <span className="text-gray-500 font-medium">Type:</span>
                  <span className="text-gray-700 font-semibold">
                    {key.includes("battery") ? "Li-ion" : key.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 font-medium">Capacity:</span>
                  <span className="text-gray-700 font-semibold">
                    {key === "battery1" ? "50 kWh" : key === "battery2" ? "30 kWh" : "-"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 font-medium">Voltage:</span>
                  <span className="text-gray-700 font-semibold">
                    {key.includes("battery") ? "400V DC" : "-"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-500 font-medium">Cycles:</span>
                  <span className="text-gray-700 font-semibold">
                    {key === "battery1" ? "6000+" : key === "battery2" ? "4000+" : "-"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComponentCard;
