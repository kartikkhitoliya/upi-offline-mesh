export default function ActivityFeed({ entries }) {
  return (
    <div className="panel-void">
      <div className="panel-title">ACTIVITY</div>
      <div className="feed">
        {entries.length === 0 && (
          <div className="feed-entry">Nothing yet — inject a payment to start the demo.</div>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className={`feed-entry ${entry.kind}`}>
            {entry.text}
          </div>
        ))}
      </div>
    </div>
  );
}
