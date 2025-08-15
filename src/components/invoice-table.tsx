'use client';

import * as React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  format,
  isPast,
} from 'date-fns';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  Timestamp,
  query,
  orderBy,
} from 'firebase/firestore';

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
import type { Invoice, InvoiceData, InvoiceStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Download, FilePlus2, MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { db } from '@/lib/firebase';
import { Skeleton } from './ui/skeleton';

export function InvoiceTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFormOpen, setFormOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const q = query(collection(db, 'invoices'), orderBy('dueDate', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const invoicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Invoice));
      setInvoices(invoicesData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (invoiceId: string, newStatus: 'paid' | 'pending') => {
    const invoiceRef = doc(db, 'invoices', invoiceId);
    try {
      await updateDoc(invoiceRef, { status: newStatus });
      toast({
        title: "Status Updated",
        description: `Invoice ${invoiceId} marked as ${newStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: 'destructive',
      });
    }
  };

  const handleAddInvoice = async (data: Omit<Invoice, 'id' | 'status' | 'dueDate'> & { dueDate: Date }) => {
    try {
      const newInvoice: InvoiceData = {
        ...data,
        dueDate: Timestamp.fromDate(data.dueDate),
        status: 'pending',
      };
      await addDoc(collection(db, 'invoices'), newInvoice);
      setFormOpen(false);
      toast({
        title: "Invoice Created",
        description: `New invoice for ${data.client} has been added.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create invoice.",
        variant: 'destructive',
      });
    }
  };
  
  const getDueDate = (dueDate: Invoice['dueDate']): Date => {
    return dueDate instanceof Timestamp ? dueDate.toDate() : dueDate;
  }
  
  const getDisplayStatus = (invoice: Invoice): { text: InvoiceStatus; variant: 'default' | 'secondary' | 'destructive' } => {
    if (invoice.status === 'paid') {
      return { text: 'paid', variant: 'default' };
    }
    if (isPast(getDueDate(invoice.dueDate))) {
      return { text: 'overdue', variant: 'destructive' };
    }
    return { text: 'pending', variant: 'secondary' };
  };

  const downloadPdf = (invoice: Invoice) => {
    const doc = new jsPDF();
    const { text: status } = getDisplayStatus(invoice);
    
    doc.setFontSize(22);
    doc.text("Invoice", 14, 22);

    doc.setFontSize(12);
    doc.text(`Invoice ID: ${invoice.id}`, 14, 32)
    doc.text(`Date: ${format(new Date(), 'MMM d, yyyy')}`, 14, 38)
    
    autoTable(doc, {
      startY: 50,
      head: [['Project', 'Client', 'Due Date', 'Status', 'Amount']],
      body: [
        [
          invoice.projectName,
          invoice.client,
          format(getDueDate(invoice.dueDate), 'MMM d, yyyy'),
          status,
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(invoice.amount)
        ]
      ],
      theme: 'striped',
      headStyles: { fillColor: [34, 139, 230] }
    });
    
    doc.save(`invoice-${invoice.id}.pdf`);
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
      cell: ({ row }) => format(getDueDate(row.original.dueDate), 'MMM d, yyyy'),
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
              <DropdownMenuItem onClick={() => downloadPdf(invoice)}>
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
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
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
        )}
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
