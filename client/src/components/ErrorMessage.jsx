export default function ErrorMessage({ message }) {
  if (!message) {
    return null;
  }

  return <div className="message error-message">{message}</div>;
}
