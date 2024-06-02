/* eslint-disable react/prop-types */
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';

import {
  flexRender,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import {
  Box,
  Button,
  Divider,
  FormControl,
  Input,
  InputLabel,
  TextField,
  Typography,
} from '@mui/material';

export default function TableComponent({ columns = [], data = [] }) {
  const [sorting, setSorting] = useState([]);
  const [filtering, setFiltering] = useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter: filtering,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltering,
  });

  return (
    <>
      <TableContainer component={Paper}>
        <Box component={'header'} p={2}>
          <Input
            id="filled-basic"
            label="Filled"
            startAdornment={<SearchIcon sx={{ py: 1 }} />}
            disabled={!data?.length}
            onChange={(e) => setFiltering(e.currentTarget.value)}
          />
        </Box>

        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow component={'tr'} key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    component={'th'}
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {/* <Box> */}
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}

                    {/* <span className="group-hover:opacity-100 opacity-0 transition-opacity"> */}
                    {/* <img src={sort} alt="asc-desc" /> */}
                    {/* </span> */}
                    {/* </Box> */}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                hover
                component={'tr'}
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell component={'td'} key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Divider />
        <Box
          p={1}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <Box>
            {table.getCanPreviousPage() && (
              <Button onClick={() => table.previousPage()} variant="outlined">
                Prev Page
              </Button>
            )}

            {table.getCanNextPage() && (
              <Button onClick={() => table.nextPage()} variant="outlined">
                Next Page
              </Button>
            )}
          </Box>

          <Box
            component={'form'}
            display={'flex'}
            alignItems={'center'}
            gap={2}
            onSubmit={(e) => {
              e.preventDefault();
              table.setPageIndex(e.currentTarget.page.value);
            }}
          >
            <span>Page</span>

            <FormControl sx={{ width: 100 }} variant="standard">
              {/* <InputLabel htmlFor="page">Page Number</InputLabel> */}
              <Input id="page" name="page" type="number" required={true} />
            </FormControl>

            <Typography sx={{ whiteSpace: 'nowrap' }}>
              de {table.getPageCount()}
            </Typography>
          </Box>
        </Box>
      </TableContainer>
    </>
  );
}
