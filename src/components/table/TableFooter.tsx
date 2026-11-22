import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

        {/* Right: Page numbers and controls */}
        <div className="flex items-center gap-4">
          <div className="text-xs font-medium">
            Page {currentPage} of {Math.max(1, totalPage)}
          </div>
          <div className="flex items-center gap-1">
            {/* Go to First Page */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(1)}
              disabled={!previousPageEnable}
              title="Go to first page"
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous Page */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => onPreviousPage()}
              disabled={!previousPageEnable}
              title="Go to previous page"
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Next Page */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => onNextPage()}
              disabled={!nextPageEnable}
              title="Go to next page"
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Go to Last Page */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(totalPage)}
              disabled={!nextPageEnable}
              title="Go to last page"
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableFooter;
