/**
 * QuestionMedia — renders optional image, diagram description, and/or graph
 * for any question object that supports image_url, diagram_description, graph_data.
 * Drop this above the question text in any question card.
 */
import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const CHART_COLORS = ["#4ade80", "#60a5fa", "#f472b6", "#fb923c", "#a78bfa"];

function GraphRenderer({ graphData }) {
  if (!graphData?.type || !graphData?.datasets?.length) return null;

  const { type, title, x_label, y_label, datasets } = graphData;

  // Flatten all data for scatter/line/bar
  const chartData = (() => {
    if (type === "scatter") {
      // For scatter, each dataset's points are separate
      return null; // handled inline
    }
    // For line/bar: merge all datasets by x value
    const xSet = new Set();
    datasets.forEach(ds => ds.data?.forEach(pt => xSet.add(pt.x)));
    const xs = Array.from(xSet).sort((a, b) => a - b);
    return xs.map(x => {
      const row = { x };
      datasets.forEach(ds => {
        const pt = ds.data?.find(p => p.x === x);
        row[ds.label] = pt ? pt.y : null;
      });
      return row;
    });
  })();

  const commonProps = {
    margin: { top: 8, right: 16, left: 0, bottom: 24 },
  };

  return (
    <div className="space-y-1">
      {title && <p className="text-[11px] font-semibold text-center text-muted-foreground uppercase tracking-widest">{title}</p>}
      <ResponsiveContainer width="100%" height={200}>
        {type === "bar" ? (
          <BarChart data={chartData} {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="x" label={{ value: x_label, position: "insideBottom", offset: -16, fill: "#9ca3af", fontSize: 11 }} tick={{ fill: "#9ca3af", fontSize: 10 }} />
            <YAxis label={{ value: y_label, angle: -90, position: "insideLeft", fill: "#9ca3af", fontSize: 11 }} tick={{ fill: "#9ca3af", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8, fontSize: 12 }} />
            {datasets.length > 1 && <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af", paddingTop: 4 }} />}
            {datasets.map((ds, i) => (
              <Bar key={ds.label} dataKey={ds.label} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        ) : type === "scatter" ? (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="x" type="number" name={x_label} label={{ value: x_label, position: "insideBottom", offset: -16, fill: "#9ca3af", fontSize: 11 }} tick={{ fill: "#9ca3af", fontSize: 10 }} />
            <YAxis dataKey="y" type="number" name={y_label} label={{ value: y_label, angle: -90, position: "insideLeft", fill: "#9ca3af", fontSize: 11 }} tick={{ fill: "#9ca3af", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8, fontSize: 12 }} cursor={{ strokeDasharray: "3 3" }} />
            {datasets.length > 1 && <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af", paddingTop: 4 }} />}
            {datasets.map((ds, i) => (
              <Scatter key={ds.label} name={ds.label} data={ds.data} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </ScatterChart>
        ) : (
          // default: line
          <LineChart data={chartData} {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="x" label={{ value: x_label, position: "insideBottom", offset: -16, fill: "#9ca3af", fontSize: 11 }} tick={{ fill: "#9ca3af", fontSize: 10 }} />
            <YAxis label={{ value: y_label, angle: -90, position: "insideLeft", fill: "#9ca3af", fontSize: 11 }} tick={{ fill: "#9ca3af", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 8, fontSize: 12 }} />
            {datasets.length > 1 && <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af", paddingTop: 4 }} />}
            {datasets.map((ds, i) => (
              <Line key={ds.label} type="monotone" dataKey={ds.label} stroke={CHART_COLORS[i % CHART_COLORS.length]} dot={false} strokeWidth={2} />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default function QuestionMedia({ question }) {
  const [imgError, setImgError] = useState(false);

  if (!question) return null;
  const { image_url, diagram_description, graph_data } = question;

  const hasAnything = image_url || diagram_description || graph_data;
  if (!hasAnything) return null;

  return (
    <div className="space-y-3">
      {/* Graph */}
      {graph_data && (
        <div className="bg-secondary/60 border border-border rounded-xl p-3">
          <GraphRenderer graphData={graph_data} />
        </div>
      )}

      {/* Image */}
      {image_url && !imgError && (
        <img
          src={image_url}
          alt={diagram_description || "Question diagram"}
          onError={() => setImgError(true)}
          className="w-full rounded-lg border border-border/60 object-contain max-h-64"
          style={{ background: "#fff" }}
        />
      )}

      {/* Diagram description — shown if no image or image failed */}
      {diagram_description && (!image_url || imgError) && (
        <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
          <span className="text-lg shrink-0 mt-0.5">📊</span>
          <p className="text-sm text-blue-200/80 leading-relaxed italic">
            <span className="not-italic font-semibold text-blue-300/90">Diagram: </span>
            {diagram_description}
          </p>
        </div>
      )}

      {/* Diagram description as supplement when image loads fine */}
      {diagram_description && image_url && !imgError && (
        <p className="text-[11px] text-muted-foreground/60 italic px-1">
          📊 {diagram_description}
        </p>
      )}
    </div>
  );
}