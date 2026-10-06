import Loader from "./Loader";

export default function ResourceState({
  loading,
  error,
  reload,
}: {
  loading: boolean;
  error: string;
  reload: () => void;
}) {
  return (
    <>
      {loading && <Loader />}
      {error && (
        <div className="error-box mb-5" role="alert">
          {error}
          <button className="ml-3 underline" onClick={reload}>
            Retry
          </button>
        </div>
      )}
    </>
  );
}
