'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  addDays,
  format,
  isPast,
  subDays,
} from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InvoiceForm } from './invoice-form';
import type { Invoice, InvoiceStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Download, FilePlus2, MoreHorizontal, ArrowUpDown } from 'lucide-react';

const initialInvoices: Invoice[] = [
  { id: 'INV001', projectName: 'Website Redesign', client: 'Tech Corp', amount: 5000, dueDate: addDays(new Date(), 5), status: 'pending' },
  { id: 'INV002', projectName: 'Mobile App Dev', client: 'Innovate LLC', amount: 12000, dueDate: subDays(new Date(), 10), status: 'pending' },
  { id: 'INV003', projectName: 'Marketing Campaign', client: 'Growth Co.', amount: 7500, dueDate: subDays(new Date(), 2), status: 'paid' },
  { id: 'INV004', projectName: 'Cloud Migration', client: 'Data Solutions', amount: 25000, dueDate: addDays(new Date(), 20), status: 'pending' },
  { id: 'INV005', projectName: 'SEO Optimization', client: 'Rank High Inc', amount: 3000, dueDate: subDays(new Date(), 40), status: 'paid' },
];


export function InvoiceTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [invoices, setInvoices] = React.useState<Invoice[]>(initialInvoices);
  const [isFormOpen, setFormOpen] = React.useState(false);
  const { toast } = useToast();

  const handleStatusChange = (invoiceId: string, newStatus: 'paid' | 'pending') => {
    setInvoices(prevInvoices =>
      prevInvoices.map(invoice =>
        invoice.id === invoiceId ? { ...invoice, status: newStatus } : invoice
      )
    );
    toast({
      title: "Status Updated",
      description: `Invoice ${invoiceId} marked as ${newStatus}.`,
    })
  };

  const handleAddInvoice = (data: Omit<Invoice, 'id' | 'status'>) => {
    const newInvoice: Invoice = {
      ...data,
      id: `INV${(Math.random() * 1000).toFixed(0).padStart(3, '0')}`,
      status: 'pending',
    };
    setInvoices(prev => [newInvoice, ...prev]);
    setFormOpen(false);
    toast({
      title: "Invoice Created",
      description: `New invoice for ${data.client} has been added.`,
    })
  };
  
  const getDisplayStatus = (invoice: Invoice): { text: InvoiceStatus; variant: 'default' | 'secondary' | 'destructive' } => {
    if (invoice.status === 'paid') {
      return { text: 'paid', variant: 'default' };
    }
    if (isPast(invoice.dueDate)) {
      return { text: 'overdue', variant: 'destructive' };
    }
    return { text: 'pending', variant: 'secondary' };
  };

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'projectName',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Project
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue('projectName')}</div>,
    },
    {
      accessorKey: 'client',
      header: 'Client',
    },
    {
      accessorKey: 'amount',
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);

        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => format(row.getValue('dueDate'), 'MMM d, yyyy'),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const { text, variant } = getDisplayStatus(row.original);
        return (
            <Badge variant={variant} className="capitalize transition-colors duration-300">
                {text}
            </Badge>
        );
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={invoice.status} onValueChange={(value) => handleStatusChange(invoice.id, value as 'paid' | 'pending')}>
                <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="paid">Paid</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => console.log('Downloading PDF...')}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: invoices,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Invoices</CardTitle>
        <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button>
                <FilePlus2 className="mr-2 h-4 w-4" />
                Add Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <InvoiceForm onSubmit={handleAddInvoice} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
