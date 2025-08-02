export const CHART_CATEGORIES = [
  "Gewertz",
  "ESID",
  "Innovation Space",
  "EV Charger",
  "Total Load",
  "Solar Power",
  "Battery 1",
  "Battery 2",
  "Compare",
];

export function generateChartData(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  const labels = [];
  const chartData = {};

  const step = diffDays <= 3 ? 1 : diffDays <= 6 ? 2 : 24;
  const stepsPerDay = 24 / step;

  for (let i = 0; i < diffDays * stepsPerDay; i++) {
    const time = new Date(start.getTime() + i * step * 60 * 60 * 1000);
    const label =
      diffDays > 6
        ? `${time.getDate().toString().padStart(2, "0")}/${(time.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${time.getFullYear()}`
        : `${time.getDate().toString().padStart(2, "0")}/${(time.getMonth() + 1)
            .toString()
            .padStart(2, "0")} ${time
            .getHours()
            .toString()
            .padStart(2, "0")}:00`;
    labels.push(label);
  }

  CHART_CATEGORIES.forEach((cat) => {
    const real = [];
    const predicted = [];
    for (let i = 0; i < labels.length; i++) {
      const base = Math.random() * 10 + (cat === "Solar Power" ? 10 : 0);
      const pred = base + Math.random() * 2 - 1;
      real.push(parseFloat(base.toFixed(1)));
      predicted.push(parseFloat(pred.toFixed(1)));
    }
    chartData[cat] = { real, predicted };
  });

  return { labels, chartData, diffDays, step };
}
