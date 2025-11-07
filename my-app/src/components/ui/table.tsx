import * as React from "react";
import { cn } from "@/lib/utils";

type TableElementProps<T extends HTMLElement> = React.HTMLAttributes<T> & { className?: string };

const Table = React.forwardRef<HTMLTableElement, TableElementProps<HTMLTableElement>>(function Table(
  { className, ...props },
  ref,
) {
  return (
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm text-neutral-200", className)}
      {...props}
    />
  );
});

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableElementProps<HTMLTableSectionElement>>(
  function TableHeader({ className, ...props }, ref) {
    return <thead ref={ref} className={cn("bg-neutral-900/60 text-xs uppercase tracking-wider text-neutral-500", className)} {...props} />;
  },
);

const TableBody = React.forwardRef<HTMLTableSectionElement, TableElementProps<HTMLTableSectionElement>>(
  function TableBody({ className, ...props }, ref) {
    return <tbody ref={ref} className={cn("divide-y divide-neutral-800/80", className)} {...props} />;
  },
);

const TableRow = React.forwardRef<HTMLTableRowElement, TableElementProps<HTMLTableRowElement>>(function TableRow(
  { className, ...props },
  ref,
) {
  return <tr ref={ref} className={cn("transition hover:bg-neutral-900/70", className)} {...props} />;
});

const TableHead = React.forwardRef<HTMLTableCellElement, TableElementProps<HTMLTableCellElement>>(function TableHead(
  { className, ...props },
  ref,
) {
  return <th ref={ref} className={cn("px-4 py-3 text-left font-semibold text-neutral-400", className)} {...props} />;
});

const TableCell = React.forwardRef<HTMLTableCellElement, TableElementProps<HTMLTableCellElement>>(function TableCell(
  { className, ...props },
  ref,
) {
  return <td ref={ref} className={cn("px-4 py-3 align-middle", className)} {...props} />;
});

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
