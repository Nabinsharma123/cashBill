import { useCallback, useEffect, useRef, useState } from "react";

interface UsePaginationPayloadReturn<T> {
  payload: T;
  onPageSizeChange: (limit: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  search: string;
  handleFilterChange: <K extends keyof T>(key: K, value: T[K] | undefined) => void;
}

export const usePaginationPayload = <
  T extends { limit: number; page: number; search?: string },
>(
  defaultFilters?: Partial<T>
): UsePaginationPayloadReturn<T> => {
  const [payload, setPayload] = useState<T>({
    ...({ page: 1, limit: 10 } as T),
    ...(defaultFilters as T),
  });

  const [search, setSearch] = useState("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const onPageChange = (page: number) => {
    setPayload((prev) => ({
      ...prev,
      page,
    }));
  };

  const onPageSizeChange = (limit: number) => {
    setPayload((prev) => ({
      ...prev,
      limit,
      page: 1,
    }));
  };

  const onPreviousPage = () => {
    setPayload((prev) => ({
      ...prev,
      page: Math.max(1, prev.page - 1),
    }));
  };

  const onNextPage = () => {
    setPayload((prev) => ({
      ...prev,
      page: prev.page + 1,
    }));
  };

  const onSearchChange = (value: string) => {
    setSearch(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setPayload((prev) => ({
        ...prev,
        page: 1,
        search: value.trim() ? value : undefined,
      }));
    }, 500);
  };

  const handleFilterChange = useCallback(
    <K extends keyof T>(key: K, value: T[K] | undefined) => {
      setPayload((prev) => ({
        ...prev,
        page: 1,
        [key]: value,
      }));
    },
    []
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    payload,
    onPageSizeChange,
    onPreviousPage,
    onNextPage,
    onPageChange,
    onSearchChange,
    search,
    handleFilterChange,
  };
};
