import React, { useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TableFooterProps = {
  currentPage: number;
  pageSize: number;
  totalPage: number;
  totalCount?: number;
  onPageChange: (nextPageIndex: number) => void;
  onPageSizeChange: (nextPageSize: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  nextPageEnable: boolean;
  previousPageEnable: boolean;
};

function getPaginationItems(
  currentPage: number,
  totalPage: number,
): Array<number | "ellipsis"> {
  const total = Math.max(1, totalPage);
  const current = Math.min(Math.max(1, currentPage), total);

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(2, current - 1);
  const rightSibling = Math.min(total - 1, current + 1);
  const showLeftEllipsis = leftSibling > 3;
  const showRightEllipsis = rightSibling < total - 2;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftEnd = Math.max(3, rightSibling);
    return [
      ...Array.from({ length: leftEnd }, (_, i) => i + 1),
      "ellipsis",
      total,
    ];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightStart = Math.min(total - 2, leftSibling);
    return [
      1,
      "ellipsis",
      ...Array.from({ length: total - rightStart + 1 }, (_, i) => rightStart + i),
    ];
  }

  return [
    1,
    "ellipsis",
    ...Array.from(
      { length: rightSibling - leftSibling + 1 },
      (_, i) => leftSibling + i,
    ),
    "ellipsis",
    total,
  ];
}

export const TableFooter: React.FC<TableFooterProps> = ({
  onPageChange,
  onPageSizeChange,
  currentPage,
  pageSize,
  totalPage,
  totalCount,
  onPreviousPage,
  onNextPage,
  nextPageEnable,
  previousPageEnable,
}) => {
  const paginationItems = useMemo(
    () => getPaginationItems(currentPage, totalPage),
    [currentPage, totalPage],
  );

  return (
    <div className="w-full border-t pt-4">
      <div className="flex w-full flex-col sm:flex-row items-center gap-4 justify-between px-2 text-xs text-muted-foreground">
        {/* Left: Rows per page selector and count */}
        <div className="flex items-center gap-3">
          <Label htmlFor="rows-per-page" className="text-xs font-medium cursor-pointer">
            Rows per page
          </Label>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              onPageSizeChange(Number(value));
            }}
          >
            <SelectTrigger className="w-[70px] h-8 text-xs" id="rows-per-page">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`} className="text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {totalCount !== undefined && (
            <span className="hidden md:inline-block">
              Total {totalCount} {totalCount === 1 ? "record" : "records"}
            </span>
          )}
        </div>

        {/* Right: Numbered pagination controls */}
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPreviousPage()}
                disabled={!previousPageEnable}
                title="Go to previous page"
              />
            </PaginationItem>

            {paginationItems.map((item, idx) =>
              item === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    isActive={item === currentPage}
                    onClick={() => onPageChange(item)}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => onNextPage()}
                disabled={!nextPageEnable}
                title="Go to next page"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default TableFooter;
