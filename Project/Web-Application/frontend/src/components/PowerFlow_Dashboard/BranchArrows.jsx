function BranchArrows({ count = 22, spacing = 7, direction = "down" }) {
  const isUp = direction === "up";
  const isDown = direction === "down";
  const isRight = direction === "right";
  const isLeft = direction === "left";
  const totalHeight = (count - 1) * spacing + 12;
  const offset = `calc(50% - ${totalHeight / 2}px)`;

  // Arrow shape and rotation for each direction
  let points = "0,0 8,6 0,12";
  let rotate = isUp ? -90 : isDown ? 90 : isRight ? 0 : 180;
  let svgWidth = isRight || isLeft ? count * spacing + 16 : 16;
  let svgHeight = isUp || isDown ? count * spacing + 16 : 16;

  // Debug: Add a border to SVG to check visibility
  const debugBorder = "1px solid red";

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      style={{
        position: "absolute",
        left: isRight ? "110px" : isLeft ? "-60px" : "-6px",
        top: isUp ? "-24px" : isDown ? "24px" : 0,
        height: svgHeight,
        pointerEvents: "none",
        border: debugBorder,
        background: "rgba(99, 193, 255, 0.1)", // light yellow for debug
      }}
    >
      <g transform={isUp || isDown ? `translate(0, ${offset})` : undefined}>
        {Array.from({ length: count }).map((_, i) => (
          <polygon
            key={i}
            className={
              isUp
                ? "animated-arrow-branch-up"
                : isDown
                ? "animated-arrow-branch-down"
                : isRight
                ? "animated-arrow-branch-right"
                : "animated-arrow-branch-left"
            }
            points={points}
            fill={"#2563eb"} // right arrow is red for debug
            style={{
              transform:
                isUp || isDown
                  ? `translateY(${i * spacing}px) rotate(${rotate}deg)`
                  : `translateX(${i * spacing}px) rotate(${rotate}deg)`,
              transformOrigin: "8px 6px",
            }}
          />
        ))}
      </g>
    </svg>
  );
}

export default BranchArrows;
