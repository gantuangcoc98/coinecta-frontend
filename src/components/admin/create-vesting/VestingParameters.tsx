import { 
    Button, 
    Grid, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableFooter, 
    TableHead, 
    TablePagination, 
    TableRow, 
    TextField, 
    Typography, 
    useTheme 
} from '@mui/material';
import DataSpread from '@components/DataSpread';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { FC } from "react";

// Types
type ProjectItem = {
    id: number,
    name: string,
    assetName: string,
    policyId: string, 
    frequency: number,
    startDate: string,
    cliffDate: string,
    totalTreasury: number,
    ticker: string,
    isComplete: boolean,
    vestingData: VestingDataItem[]
}

type VestingDataItem = {
    address: string,
    vestingAmount: number,
    directAmount: number
}

// Table Pagination Config
const rowsPerPageOptions = [5, 10, 15];

interface VestingParametersProps {
    project: ProjectItem,
    onEdit: boolean,
    onProjectNameInput: boolean
}

const VestingParameters: FC<VestingParametersProps> = ({project, onEdit, onProjectNameInput}) => {
    const theme = useTheme()

    // Global States
    const [_onEdit, setOnEdit] = useState(false);
    const [initialProjectData, setInitialProjectData] = useState<ProjectItem>(project);

    // Table States
    const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
    const [page, setPage] = useState(0);
    const [uploadedFileName, setUploadedFileName] = useState("Empty");

    // Table Event Handlers
    const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFileUploadClick = () => {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.click();
        }
    };

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadedFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const data = parseCSV(text);
                setVestingData(data);
            };
            reader.readAsText(file);
        }
    };

    const parseCSV = (text: string): VestingDataItem[] => {
        const rows = text.trim().split(/\r?\n/);
        return rows.slice(1).map(row => {
            const values = row.split(',');
            return {
                address: values[0].trim(),
                vestingAmount: parseInt(values[1].trim()),
                directAmount: parseInt(values[2].trim())
            };
        });
    };

    // Global Event Handlers
    const handleEditParametersOrPreviewOnClick = () => {
        if (!_onEdit) {
            setOnEdit(true);
        } else {
            const updatedData: ProjectItem = {
                id: initialProjectData.id,
                name: initialProjectData.name,
                assetName: assetName,
                policyId: policyId, 
                frequency: frequency,
                startDate: startDate,
                cliffDate: cliffDate,
                totalTreasury: totalTreasury,
                ticker: ticker,
                isComplete: false,
                vestingData: vestingData
            }

            setInitialProjectData(updatedData);
            setOnEdit(false);
        }
    }

    const handleCancelOnClick = () => {
        setOnEdit(false);
    }

    function shortenPolicyId(policyId: string, maxLength: number = 10): string {
        if (policyId.length <= maxLength) {
            return policyId;
        }
    
        const initialPart = policyId.substring(0, 5);
        const lastPart = policyId.substring(policyId.length - 5);
    
        return `${initialPart}...${lastPart}`;
    }

    const handleCompleteOnClick = () => {
        const updatedData: ProjectItem = {
            id: initialProjectData.id,
            name: initialProjectData.name,
            assetName: assetName,
            policyId: policyId, 
            frequency: frequency,
            startDate: startDate,
            cliffDate: cliffDate,
            totalTreasury: totalTreasury,
            ticker: ticker,
            isComplete: true,
            vestingData: vestingData
        }

        setInitialProjectData(updatedData);
        setOnEdit(false);
    }

    // Project Data Fields
    const [assetName, setAssetName] = useState(initialProjectData.assetName);
    const [policyId, setPolicyId] = useState(initialProjectData.policyId);
    const [frequency, setFrequency] = useState(initialProjectData.frequency);
    const [startDate, setStartDate] = useState(initialProjectData.startDate);
    const [cliffDate, setCliffDate] = useState(initialProjectData.cliffDate);
    const [totalTreasury, setTotalTreasury] = useState(initialProjectData.totalTreasury);
    const [ticker, setTicker] = useState(initialProjectData.ticker);
    const [isComplete, setIsComplete] = useState(initialProjectData.isComplete);
    const [vestingData, setVestingData] = useState<VestingDataItem[]>(initialProjectData.vestingData);

    // Project Data Event Handlers
    const handleAssetNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAssetName(value);
    }

    const handlePolicyIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPolicyId(value);
    }

    const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (!isNaN(parseInt(value))) {
            setFrequency(parseInt(value));
        } else {
            setFrequency(0);
        }
    }

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setStartDate(value);
    }

    const handleCliffDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCliffDate(value);
    }

    const handleTickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTicker(value);
    }

    useEffect(() => {
        setOnEdit(onEdit);
        setInitialProjectData(project);

        setAssetName(project.assetName);
        setPolicyId(project.policyId);
        setFrequency(project.frequency);
        setStartDate(project.startDate);
        setCliffDate(project.cliffDate);
        setTicker(project.ticker);
        setIsComplete(project.isComplete);
        setVestingData(project.vestingData);
        setUploadedFileName("Empty");

        const sum = project.vestingData.reduce((accumulator, currentValue) => {
            return accumulator + currentValue.vestingAmount;
        }, 0);
        setTotalTreasury(sum);
    }, [project]);

    useEffect(() => {
        const sum = vestingData.reduce((accumulator, currentValue) => {
            return accumulator + currentValue.vestingAmount;
        }, 0);
        setTotalTreasury(sum);
    }, [vestingData]);

    return (
        <Box width="100%" height="100%" position="relative">
            {onProjectNameInput &&
                <Box 
                    display="flex"
                    width="100%"
                    height="80%"
                    alignItems="center"
                    justifyContent="center"
                    position="absolute"
                    zIndex="100"
                >
                    <Typography variant="h3">
                        Please provide a project name.
                    </Typography>
                </Box>
            }
            <Box 
                display="flex"
                flexDirection="column"
                gap="20px"
                zIndex="0"
                sx={{ opacity: onProjectNameInput ? 0.1 : 1 }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography variant="h4">
                            Parameters
                        </Typography>
                        <Box 
                            display="flex"
                            gap="5px"
                        >
                            {!isComplete &&
                                <Button 
                                    variant='contained'
                                    color="primary"
                                    disabled={onProjectNameInput}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        fontSize: '18px',
                                        px: '20px',
                                        py: '2px'
                                    }}
                                    onClick={() => handleEditParametersOrPreviewOnClick()}
                                >
                                    {_onEdit ?
                                        <span>Preview</span>
                                        :
                                        <span>Edit Parameters</span>
                                    }
                                </Button>
                            }
                            {_onEdit &&
                                <Button 
                                    variant='outlined'
                                    color="primary"
                                    disabled={onProjectNameInput}
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        fontSize: '18px',
                                        px: '20px',
                                        py: '2px'
                                    }}
                                    onClick={() => handleCancelOnClick()}
                                >
                                    Cancel
                                </Button>
                            }
                        </Box>
                    </Box>
                    {_onEdit ?
                        <Box 
                            display="flex" 
                            flexDirection="column"
                            gap="10px"
                        >
                            <TextField
                                error={!assetName}
                                required
                                id="asset-name"
                                label="Asset Name"
                                variant="filled"
                                size="small"
                                value={assetName}
                                onChange={handleAssetNameChange}
                            />
                            <TextField
                                error={!policyId}
                                required
                                id="policy-id"
                                label="Policy ID"
                                variant="filled"
                                size="small"
                                value={policyId}
                                onChange={handlePolicyIdChange}
                            />
                            <TextField
                                error={!frequency}
                                required
                                id="frequency"
                                label="Frequency"
                                variant="filled"
                                size="small"
                                value={frequency}
                                onChange={handleFrequencyChange}
                            />
                            <TextField
                                error={!startDate}
                                required
                                id="start-date"
                                label="Start Date"
                                variant="filled"
                                size="small"
                                value={startDate}
                                onChange={handleStartDateChange}
                            />
                            <TextField
                                error={!cliffDate}
                                required
                                id="cliff-date"
                                label="Cliff Date"
                                variant="filled"
                                size="small"
                                value={cliffDate}
                                onChange={handleCliffDateChange}
                            />
                            <TextField
                                error={!ticker}
                                required
                                id="ticker"
                                label="Ticker"
                                variant="filled"
                                size="small"
                                value={ticker}
                                onChange={handleTickerChange}
                            />
                        </Box>
                        :
                        <Grid container spacing={2} sx={{ flex: 1 }}>
                            {!_onEdit && 
                                <Grid item xs={6} md={7} sx={{ flex: 1 }}>
                                    <Paper 
                                        sx={{ 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            padding: '16px', 
                                            width: '100%',
                                            height: '100%',
                                            alignItems: 'center'
                                        }} 
                                        variant='outlined'
                                    >
                                        <Typography variant="h2">
                                            Total Treasury
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 500}}>
                                            {totalTreasury} {ticker}
                                        </Typography>
                                    </Paper> 
                                </Grid>
                            }
                            <Grid item xs={6} md={5} sx={{ flex: 1 }}>
                                <Paper 
                                    sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        justifyContent: 'start',
                                        padding: '16px', 
                                        width: '100%',
                                        height: '100%'
                                    }} 
                                    variant='outlined'
                                >   
                                    <DataSpread
                                        title="Asset Name"
                                        data={assetName}
                                        isLoading={false}
                                    />
                                    <DataSpread
                                        title="Policy ID"
                                        data={shortenPolicyId(policyId, 10)}
                                        isLoading={false}
                                    />
                                    <DataSpread
                                        title="Frequency"
                                        data={frequency.toString()}
                                        isLoading={false}
                                    />
                                    <DataSpread
                                        title="Start Date"
                                        data={startDate}
                                        isLoading={false}
                                    />
                                    <DataSpread
                                        title="Cliff Date"
                                        data={cliffDate}
                                        isLoading={false}
                                    />
                                    <DataSpread
                                        title="Ticker"
                                        data={ticker}
                                        isLoading={false}
                                    />
                                </Paper>
                            </Grid>
                        </Grid>
                    }
                </Box>
                <Box width="100%" sx={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                        <Typography variant="h4">
                            Vesting Table
                        </Typography>
                        {_onEdit &&
                            <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Vesting Data: 
                                </Typography>
                                <Typography>
                                    {uploadedFileName}
                                </Typography>
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept=".csv"
                                    hidden
                                    onChange={handleFileInputChange}
                                />
                                <Button
                                    variant='contained'
                                    color="primary"
                                    disabled={onProjectNameInput}
                                    sx={{
                                        fontSize: '18px',
                                        px: '25px',
                                        py: '2px'
                                    }}
                                    onClick={handleFileUploadClick}
                                >
                                    Upload Data
                                </Button>
                            </Box>
                        }
                    </Box>
                    <Box display="flex" flexDirection="column" gap="10px" sx={{ height: 'auto'}}>
                        {vestingData.length > 0 ?
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: theme.shape.borderRadius }}>
                                <Table aria-label="vesting-table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center">Address</TableCell>
                                            <TableCell align="center">Vesting Amount</TableCell>
                                            <TableCell align="center">Direct Amount</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {vestingData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                            <TableRow key={index}
                                                sx={{
                                                    '&:nth-of-type(odd)': { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(205,205,235,0.05)' : 'rgba(0,0,0,0.05)' },
                                                    '&:hover': { background: theme.palette.mode === 'dark' ? 'rgba(205,205,235,0.15)' : 'rgba(0,0,0,0.1)' }
                                                }}
                                            >
                                                <TableCell component="th" scope="row" align="center">
                                                    {row.address}
                                                </TableCell>
                                                <TableCell align="center">{row.vestingAmount}</TableCell>
                                                <TableCell align="center">{row.directAmount}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooter>   
                                        <TablePagination
                                            rowsPerPageOptions={rowsPerPageOptions}
                                            component="td"
                                            count={vestingData.length}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            onPageChange={handleChangePage}
                                            onRowsPerPageChange={handleChangeRowsPerPage}
                                        />
                                    </TableFooter>
                                </Table>
                            </TableContainer>
                            :
                            <Paper 
                                variant='outlined'
                                sx={{
                                    display: 'flex',
                                    height: '150px',
                                    width: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <Typography variant='h6'>
                                    No data available
                                </Typography>
                            </Paper>
                        }
                        {(!isComplete || _onEdit) &&
                            <Box display="flex" width="100%" alignItems="center" justifyContent="end">
                                <Button 
                                    variant='contained'
                                    color="secondary"
                                    disabled={
                                        onProjectNameInput || !assetName || !policyId || frequency == 0 || !startDate || !cliffDate || !ticker || vestingData.length == 0
                                    }
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '20px',
                                        px: '50px',
                                        borderRadius: '6px',
                                    }}
                                    onClick={() => handleCompleteOnClick()}
                                >
                                    Complete
                                </Button>
                            </Box>
                        }
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default VestingParameters;