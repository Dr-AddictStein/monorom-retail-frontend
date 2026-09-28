const SlugFieldError = ({ message }) => {
  if (!message) return null;

  return (
    <div role="alert" className="alert alert-error mt-2 py-2 text-sm">
      <span>{message}</span>
    </div>
  );
};

export default SlugFieldError;
