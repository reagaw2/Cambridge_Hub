export default function TableFillInput({ headers, rows, editableCells, value, onChange }) {
  // value: 2D array of cell strings, same shape as rows
  const cellValues = value ?? rows.map(row => row.map(c => c));

  function setCellValue(ri, ci, val) {
    const next = cellValues.map((row, r) =>
      row.map((cell, c) => (r === ri && c === ci) ? val : cell)
    );
    onChange(next);
  }

  function isEditable(ri, ci) {
    if (!editableCells) {
      // Auto-detect: blank or placeholder cells are editable
      const cell = rows[ri]?.[ci] ?? "";
      return cell === "" || cell === null || /^(&nbsp;|\s*)$/.test(String(cell));
    }
    return editableCells.some(([r, c]) => r === ri && c === ci);
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "auto", minWidth: "100%", fontSize: 13 }}>
        {headers?.length > 0 && (
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    border: "1.5px solid hsl(var(--border))",
                    padding: "7px 14px",
                    background: "hsl(var(--secondary))",
                    fontWeight: 600,
                    textAlign: "center",
                    color: "hsl(var(--foreground))",
                    fontSize: 12,
                    whiteSpace: "nowrap",
                  }}
                  dangerouslySetInnerHTML={{ __html: String(h) }}
                />
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {cellValues.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => {
                const editable = isEditable(ri, ci);
                const originalCell = rows[ri]?.[ci] ?? "";
                return (
                  <td
                    key={ci}
                    style={{
                      border: "1px solid hsl(var(--border))",
                      padding: editable ? "4px" : "7px 14px",
                      textAlign: "center",
                      background: editable
                        ? "hsl(var(--card))"
                        : "hsl(var(--secondary) / 0.4)",
                      minWidth: 80,
                    }}
                  >
                    {editable ? (
                      <input
                        type="text"
                        value={cell ?? ""}
                        onChange={e => setCellValue(ri, ci, e.target.value)}
                        style={{
                          width: "100%",
                          minWidth: 80,
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          textAlign: "center",
                          color: "hsl(var(--foreground))",
                          fontSize: 13,
                          padding: "4px 8px",
                        }}
                        placeholder="…"
                      />
                    ) : (
                      <span dangerouslySetInnerHTML={{ __html: String(originalCell) }} />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}