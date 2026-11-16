import { useState, useEffect } from "react";

const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const res = await fetch(url, { signal: controller.signal });
        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.message || `Failed to fetch data: ${res.status} ${res.statusText}`);
        }
        if (active) setData(result.data ?? result);
      } catch (err) {
        if (err.name !== "AbortError" && active) {
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => {
      active = false;
      controller.abort();
    };
  }, [url]);

  return { data, error, loading };
};

export default useFetch;