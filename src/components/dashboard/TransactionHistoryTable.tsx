import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import dayjs from 'dayjs';
import ActionBar, { IActionBarButton } from './ActionBar';
import LaunchIcon from '@mui/icons-material/Launch';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import copy from 'copy-to-clipboard';
import { useWallet } from '@meshsdk/react';
import { coinectaSyncApi } from '@server/services/syncApi';
import { TimeIcon } from '@mui/x-date-pickers';

interface ITransactionHistoryTableProps<T> {
  title?: string;
  data: T[];
  isLoading: boolean;
  error: boolean;
  actions?: IActionBarButton[];
  selectedRows?: Set<number>;
  setSelectedRows?: React.Dispatch<React.SetStateAction<Set<number>>>
  parentContainerRef: React.RefObject<HTMLDivElement>;
  onCancellationSuccessful: (status: boolean) => void;
  onCancellationFailed: (status: boolean) => void;
}

const rowsPerPageOptions = [5, 10, 15];

// NOTE: YOU MAY HAVE TO SET THE PARENT CONTAINER TO overflow: 'clip' TO FIX IPHONE ISSUES

// if you want an action bar (buttons to do actions on specific rows) you need to include
// actions, selectedRows, and setSelectedRows

const TransactionHistoryTable = <T extends Record<string, any>>({
  title,
  data,
  error,
  isLoading,
  actions,
  selectedRows,
  setSelectedRows,
  parentContainerRef,
  onCancellationFailed,
  onCancellationSuccessful
}: ITransactionHistoryTableProps<T>) => {
  const [parentWidth, setParentWidth] = useState(0);
  const [paperWidth, setPaperWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const tableRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  const sensitivityThreshold = 2;

  useEffect(() => {
    const handleResize = () => {
      if (paperRef?.current && parentContainerRef?.current) {
        setPaperWidth(paperRef.current.offsetWidth);
        setParentWidth(parentContainerRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [parentContainerRef]);

  const isTableWiderThanParent = parentWidth < paperWidth

  const onDragStart = (clientX: number, clientY: number) => {
    if (tableRef.current && isTableWiderThanParent) {
      setIsDragging(true);
      setStartX(clientX - translateX)
      setStartY(clientY);
      tableRef.current.style.cursor = 'grabbing';
      tableRef.current.style.userSelect = 'none';
    }
  };

  const onDragMove = (e: React.MouseEvent<Element, MouseEvent> | React.TouchEvent<Element>, clientX: number, clientY: number) => {
    if (!isDragging || !tableRef.current) return;

    let deltaX = clientX - startX;
    const deltaY = clientY - startY;

    // Check if the swipe is more horizontal than vertical using the sensitivity threshold
    if (Math.abs(deltaX) > Math.abs(deltaY) * sensitivityThreshold) {
      e.preventDefault(); // Prevent default only for horizontal swipes
      const maxTranslate = tableRef.current.offsetWidth - tableRef.current.scrollWidth;
      deltaX = Math.min(Math.max(deltaX, maxTranslate), 0);
      setTranslateX(deltaX);
      tableRef.current.style.cursor = 'grabbing'
      tableRef.current.style.transform = `translateX(${deltaX}px)`;
    }
  };

  const onDragEnd = () => {
    if (tableRef.current && isTableWiderThanParent) {
      setIsDragging(false);
      tableRef.current.style.cursor = 'grab';
      tableRef.current.style.removeProperty('user-select');
    }
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const onMouseDown = (e: React.MouseEvent) => onDragStart(e.pageX, e.pageY);
  const onMouseMove = (e: React.MouseEvent) => onDragMove(e, e.pageX, e.pageY);
  const onMouseUpOrLeave = () => onDragEnd();

  const onTouchStart = (e: React.TouchEvent) => onDragStart(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => onDragMove(e, e.touches[0].clientX, e.touches[0].clientY);
  const onTouchEnd = () => onDragEnd();

  const theme = useTheme();
  const columns: (keyof T)[] = data.length > 0 ? Object.keys(data[0]) as (keyof T)[] : [];

  const renderCellContent = (item: T, key: keyof T) => {
    const cellData = item[key];
    if (cellData && typeof cellData === 'object' && 'render' in cellData) {
      if (cellData.render) {
        return cellData.render(cellData.value, item);
      } else {
        return cellData.value;
      }
    } else {
      return formatData(item, key);
    }
  };


  const { name, wallet, connected } = useWallet()
  const [changeAddress, setChangeAddress] = useState<string | undefined>(undefined)
  const [walletUtxosCbor, setWalletUtxosCbor] = useState<string[] | undefined>()
  const [cardanoApi, setCardanoApi] = useState<any>(undefined);

  useEffect(() => {
    const execute = async () => {
      if (connected) {
        const api = await window.cardano[name.toLowerCase()].enable();
        setCardanoApi(api);
        const utxos = await api.getUtxos();
        setWalletUtxosCbor(utxos);
      }
    };
    execute();
  }, [name, connected]);

  useEffect(() => {
    const execute = async () => {
      if (connected) {
        setChangeAddress(await wallet.getChangeAddress());
      }
    };
    execute();
  }, [connected, wallet]);

  const cancelTx = useCallback(async (txHash: string, txIndex: string) => {
    if (connected && walletUtxosCbor !== undefined && cardanoApi !== undefined) {
      try {
        const cancelStakeTxCbor = await coinectaSyncApi.cancelStakeTx({
          stakeRequestOutputReference: {
            txHash,
            index: txIndex
          },
          walletUtxoListCbor: walletUtxosCbor!,
        });
        const witnessSetCbor = await cardanoApi.signTx(cancelStakeTxCbor, true);
        const signedTxCbor = await coinectaSyncApi.finalizeTx({ unsignedTxCbor: cancelStakeTxCbor, txWitnessCbor: witnessSetCbor });
        cardanoApi.submitTx(signedTxCbor);
        onCancellationSuccessful(true);
      } catch (ex) {
        onCancellationFailed(true);
      }
    }
  }, [connected, walletUtxosCbor, cardanoApi]);

  if (error) return <div>Error loading</div>;
  return (
    <Box
      ref={tableRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseUpOrLeave}
      onMouseUp={onMouseUpOrLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      sx={{
        cursor: isDragging ? 'grabbing' : (isTableWiderThanParent ? 'grab' : 'auto'),
        '&:active': {
          cursor: isTableWiderThanParent ? 'grabbing' : 'auto',
        },
        zIndex: 0
      }}
    >
      <Paper variant="outlined"
        ref={paperRef}
        sx={{
          mb: 2,
          overflowX: 'visible',
          width: 'auto',
          minWidth: 'max-content'
        }}
      >
        {title &&
          <Typography variant="h5" sx={{ p: 2 }}>
            {title}
          </Typography>
        }
        {actions && <ActionBar actions={actions} />}
        <Table>
          <TableHead>
            <TableRow sx={{
              '& th': {
                position: 'sticky',
                top: actions ? '121px' : '71px',
                zIndex: 2,
                background: theme.palette.background.paper,
              }
            }}>
              {columns.map((column) => {
                if (column === "txHash" || column === "txIndex") return null;
                return <TableCell key={String(column)}>
                  {camelCaseToTitle(String(column))}
                </TableCell>
              })}
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => (
              <TableRow key={index}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(205,205,235,0.05)' : 'rgba(0,0,0,0.05)' },
                  '&:hover': { background: theme.palette.mode === 'dark' ? 'rgba(205,205,235,0.15)' : 'rgba(0,0,0,0.1)' }
                }}
              >
                {Object.keys(item).map((key, colIndex) => {
                  if (key === "txHash" || key === "txIndex") return null;
                  if (key === "status") {
                    return (
                      <TableCell key={`${key}-${colIndex}`} sx={{ borderBottom: 'none' }}>
                        {isLoading ?
                          (<Skeleton>
                            <Chip icon={<CheckIcon fontSize='small' />} variant='outlined' sx={{ width: '104px' }} />
                          </Skeleton>) :
                          <>
                            {(item[key] === "Executed" &&
                              <Chip icon={<CheckIcon fontSize='small' />} variant='outlined' label="Executed" color='success' sx={{ width: '120px' }} />)}
                            {(item[key] === "Pending" &&
                              <Chip icon={<TimeIcon fontSize='small' />} variant='outlined' label="Pending" color='primary' sx={{ width: '120px' }} />)}
                            {(item[key] === "Cancelled" &&
                              <Chip icon={<ClearIcon fontSize='small' />} variant='outlined' label="Cancelled" color='error' sx={{ width: '120px' }} />)}
                          </>
                        }
                      </TableCell>
                    )
                  }

                  if (key === "actions") {
                    return (
                      <TableCell key={`${key}-${colIndex}`} sx={{ borderBottom: 'none' }}>
                        {isLoading ?
                          (<Box sx={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                            <Skeleton>
                              <LaunchIcon fontSize='small' />
                            </Skeleton>
                            <Skeleton>
                              <ContentCopyIcon fontSize='small' />
                              
                            </Skeleton>
                          </Box>) :
                          (<Box sx={{ display: 'flex', gap: '5px', marginTop: '8px' }}>
                            <Tooltip title='View transaction details'>
                              <IconButton href={item[key].transactionLink} size='small' target='_blank'>
                                <LaunchIcon fontSize='small' sx={{ '&:hover': { color: theme.palette.secondary.main, transition: 'color 0.3s ease 0.2s' } }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title='Copy transaction link' >
                              <IconButton size='small' onClick={() => { copy(item[key].transactionLink) }}>
                                <ContentCopyIcon fontSize='small' sx={{ '&:hover': { color: theme.palette.secondary.main, transition: 'color 0.3s ease 0.2s' } }} />
                              </IconButton>
                            </Tooltip>
                          </Box>)}
                      </TableCell>)
                  }

                  return (
                    <TableCell key={`${key}-${colIndex}`} sx={{ borderBottom: 'none' }}>
                      {isLoading ? <Skeleton width={100} /> : renderCellContent(item, key)}
                    </TableCell>
                  )
                })}
                <TableCell sx={{ borderBottom: 'none' }}>
                  {item.status === "Pending" && !isLoading && <>
                    <Button disabled={isLoading && (walletUtxosCbor?.length ?? 0 > 0)} key={index} variant="contained" color="secondary" onClick={() => cancelTx(item.txHash, item.txIndex)}>
                      Cancel
                    </Button>
                  </>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={rowsPerPageOptions}
                component={'td'}
                colSpan={6}
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                disabled={isLoading} />
            </TableRow>
          </TableFooter>
        </Table>
      </Paper>
    </Box>
  );
};

export default TransactionHistoryTable;

const formatData = <T,>(data: T, key: keyof T): string => {
  const value = data[key];
  if (typeof value === 'number') {
    return value.toLocaleString();
  } else if (value instanceof Date) {
    return dayjs(value).format('YYYY/MM/DD HH:mm:ss a');
  }
  // Default to string conversion
  return String(value);
}

const camelCaseToTitle = (camelCase: string) => {
  const withSpaces = camelCase.replace(/([A-Z])/g, ' $1').trim();
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}
