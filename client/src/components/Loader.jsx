export default function Loader({ text = "Loading..." }) {
  return (
    <div className="status-box">
      <div className="loader" />
      <p>{text}</p>
    </div>
  );
}
