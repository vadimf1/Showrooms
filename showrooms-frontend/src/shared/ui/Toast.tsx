type Props = { title: string; sub: string };

const Toast = ({ title, sub }: Props) => (
  <div className="toast">
    <div className="t-icon">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 5 5L20 7"/>
      </svg>
    </div>
    <div className="t-txt">{title}<small>{sub}</small></div>
  </div>
);

export default Toast;
