export function LogPanel({ log }: { log: string[] }) {
  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <h3>Tour Log</h3>
      <div className="log">
        {log.map((line, i) => (
          <div key={`${i}-${line}`}>{line}</div>
        ))}
      </div>
    </div>
  );
}
