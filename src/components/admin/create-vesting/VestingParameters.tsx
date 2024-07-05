import { Button, Grid, Paper, styled, Typography, useTheme } from '@mui/material';
import DataSpread from '@components/DataSpread';
import { Box } from '@mui/system';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React from 'react';
import { FC } from "react";

type ProjectItem = {
    id: number,
    name: string,
    frequency: number,
    startDate: string,
    cliffDate: string,
    totalTreasury: number,
    currency: string
}

type VestingDataItem = {
    id: number,
    address: string,
    currency: string,
    vestingAmount: number,
    dollarAmount: number,
    status: number
}

const vestingData: VestingDataItem[] = [
    { id: 1, address: 'addr...2k4u', currency: 'CNCT', vestingAmount: 100, dollarAmount: 2000, status: 0},
    { id: 2, address: 'addr...1kj3', currency: 'CRASH', vestingAmount: 50, dollarAmount: 3000, status: 0},
    { id: 3, address: 'addr...2k3j', currency: 'SUNDAE', vestingAmount: 1000, dollarAmount: 1000, status: 0},
];

const columns: GridColDef[] = [
    { field: 'address', headerName: 'Address', width: 260, headerAlign: 'center', align: 'center'},
    { field: 'currency', headerName: 'Currency', width: 260, headerAlign: 'center', align: 'center'},
    { field: 'vestingAmount', headerName: 'Vesting Amount', width: 260, headerAlign: 'center', type: 'number', align: 'center'},
    { field: 'dollarAmount', headerName: 'Dollar Amount', width: 300, headerAlign: 'center', type: 'number', align: 'center'}
];

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
    '& .MuiDataGrid-cell:focus': {
    outline: 'none',
    },
    '& .MuiDataGrid-cell:focus-within': {
        outline: 'none',
    },
    '& .MuiDataGrid-columnHeader:focus': {
        outline: 'none',
    },
    '& .MuiDataGrid-columnHeader:focus-within': {
        outline: 'none',
    }
}));

const VestingParameters: FC<ProjectItem> = (data: ProjectItem) => {
    const theme = useTheme()
    
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', gap: '20px'}}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
                    <Typography variant="h4">
                        Parameters
                    </Typography>
                    <Box sx={{ display: 'flex', height: '100%' }}>
                        <Button 
                            variant='contained'
                            color="primary"
                            sx={{
                                textTransform: 'none',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '20px',
                                px: '30px',
                                py: '5px',
                                borderRadius: '6px',
                            }}
                        >
                            New
                        </Button>
                    </Box>
                </Box>
                <Grid container spacing={2} sx={{ flex: 1 }}>
                    <Grid item xs={6} md={7} sx={{ flex: 1 }}>
                        <Paper 
                            sx={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                justifyContent: 'start',
                                padding: '16px', 
                                width: '100%',
                                height: '100%',
                                alignItems: 'center'
                            }} 
                            variant='outlined'
                        >
                            <Typography variant="h3">
                                Total Treasury
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 500}}>
                                {data.totalTreasury} {data.currency}
                            </Typography>
                        </Paper> 
                    </Grid>
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
                                title="Frequency"
                                data={data.frequency.toString()}
                                isLoading={false}
                            />
                            <DataSpread
                                title="Start Date"
                                data={data.startDate.toString()}
                                isLoading={false}
                            />
                            <DataSpread
                                title="Cliff Date"
                                data={data.cliffDate.toString()}
                                isLoading={false}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <Typography variant="h4">
                    Vesting Table
                </Typography>
                <Box sx={{ height: 'auto'}}>
                        <StyledDataGrid
                            rows={vestingData}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: { page: 0, pageSize: 5 },
                                }
                            }}
                            pageSizeOptions={[5, 10]}
                            sx={{ height: '100%', background: theme.palette.background.paper }}
                        />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Vesting Data: 
                            </Typography>
                            <Typography>
                                Empty
                            </Typography>
                            <Button 
                                variant='contained'
                                color="primary"
                                sx={{
                                    textTransform: 'none',
                                    color: 'white',
                                    fontSize: '18px',
                                    px: '25px',
                                    py: '2px',
                                    borderRadius: '6px',
                                    ml: '10px'
                                }}
                            >
                                Upload Data
                            </Button>
                        </Box>
                        <Button 
                            variant='contained'
                            color="secondary"
                            sx={{
                                textTransform: 'none',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '20px',
                                px: '50px',
                                borderRadius: '6px',
                            }}
                        >
                            Complete
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default VestingParameters;