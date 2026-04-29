/**
 * MockGraphRenderer — renders recharts graph from question.graph_data
 */
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const COLORS = ["#4ade80", "#60a5fa", "#f472b6", "#fb923c", "#a78bfa"];

export default function MockGraphRenderer({ graphData }) {
  if (!graphData?.datasets?.length) return null;

  const { type = "line", title, x_label, y_label, datasets } = graphData;

  // Build merged data for line/bar charts
  const mergedData = (() => {
    if (type === "scatter") return null;
    const xSet = new Set();
    datasets.forEach(ds => ds.data?.forEach(pt => xSet.add(pt.x)));
    const xs = Array.from(xSet).sort((a, b) => Number(a) - Number(b));
    return xs.map(x => {
      const row = { x };
      datasets.forEach(ds => {
        const pt = ds.data?.find(p => p.x === x);
        row[ds.label] = pt ? pt.y : null;
      });
      return row;
    });
  })();

  const axisStyle = { fill: "#9ca3af", fontSize: 11 };
  const gridStyle = { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.06)" };
  const tooltipStyle = { background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8, fontSize: 12 };
  const commonProps = { margin: { top: 8, right: 20, left: 8, bottom: 32 } };

  return (
    <div className="space-y-1.5">
      {title && (
        <p className="text-[11px] font-semibold text-center text-muted-foreground uppercase tracking-widest">{title}</p>
      )}
      <ResponsiveContainer width="100%" height={300}>
        {type === "bar" ? (
          <BarChart data={mergedData} {...commonProps}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="x" tick={axisStyle} label={{ value: x_label, position: "insideBottom", offset: -20, fill: "#9ca3af", fontSize: 11 }} />
            <YAxis tick={axisStyle} label={{ value: y_label, angle: -90, position: "insideLeft", fill: "#9ca3af", fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            {datasets.length > 1 && <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />}
            {datasets.map((ds, i) => (
              <Bar key={ds.label} dataKey={ds.label} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        ) : type === "scatter" ? (
          <ScatterChart {...commonProps}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="x" type="number" name={x_label} tick={axisStyle} label={{ value: x_label, position: "insideBottom", offset: -20, fill: "#9ca3af", fontSize: 11 }} />
            <YAxis dataKey="y" type="number" name={y_label} tick={axisStyle} label={{ value: y_label, angle: -90, position: "insideLeft", fill: "#9ca3af", fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
            {datasets.length > 1 && <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />}
            {datasets.map((ds, i) => (
              <Scatter key={ds.label} name={ds.label} data={ds.data} fill={COLORS[i % COLORS.length]} />
            ))}
          </ScatterChart>
        ) : (
          <LineChart data={mergedData} {...commonProps}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="x" tick={axisStyle} label={{ value: x_label, position: "insideBottom", offset: -20, fill: "#9ca3af", fontSize: 11 }} />
            <YAxis tick={axisStyle} label={{ value: y_label, angle: -90, position: "insideLeft", fill: "#9ca3af", fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            {datasets.length > 1 && <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />}
            {datasets.map((ds, i) => (
              <Line key={ds.label} type="monotone" dataKey={ds.label} stroke={COLORS[i % COLORS.length]} dot={false} strokeWidth={2} />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}