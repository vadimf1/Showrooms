type Props = { page: number; total: number; pageSize: number; onChange: (p: number) => void };

const Prev = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m15 6-6 6 6 6"/></svg>;
const Next = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m9 6 6 6-6 6"/></svg>;

const Pagination = ({ page, total, pageSize, onChange }: Props) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onChange(page - 1)} disabled={page === 1}>
        <Prev /> Назад
      </button>
      {pages.map((p, i) =>
        p === "…"
          ? <span key={`e${i}`} className="page-ellipsis">…</span>
          : <button key={p} className={`page-btn ${p === page ? "active" : ""}`} onClick={() => onChange(p as number)}>{p}</button>
      )}
      <button className="page-btn" onClick={() => onChange(page + 1)} disabled={page === totalPages}>
        Вперёд <Next />
      </button>
    </div>
  );
};

export default Pagination;
