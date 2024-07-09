import React, { useEffect, useRef } from 'react';
import { FC, useState } from 'react';
import {
    Box,
    Button,
    Divider,
    List,
    ListItemButton,
    ListItemText,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import AdminMenu from '@components/admin/AdminMenu';
import VestingParameters from '../create-vesting/VestingParameters';

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

const projects: ProjectItem[] = [
    {
        id: 1,
        name: "Coinecta",
        assetName: "Coinecta",
        policyId: "c27600f3aff3d94043464a33786429b78e6ab9df5e1d23b774acb34c",
        frequency: 3,
        startDate: '2024-01-07',
        cliffDate: '2024-03-24',
        totalTreasury: 1000000,
        ticker: "CNCT",
        isComplete: true,
        vestingData: [       
            { address: 'addr...2k4u', vestingAmount: 52347, directAmount: 1500 },
            { address: 'addr...1kj3', vestingAmount: 87123, directAmount: 2000 },
            { address: 'addr...2k3j', vestingAmount: 64389, directAmount: 2500 },
            { address: 'addr...2k3j', vestingAmount: 41256, directAmount: 3000 },
            { address: 'addr...2k3j', vestingAmount: 95871, directAmount: 3500 },
            { address: 'addr...2k3j', vestingAmount: 72648, directAmount: 4000 },
            { address: 'addr...2k3j', vestingAmount: 31905, directAmount: 4500 },
        ]
    },
    { 
        id: 2,
        name: "Nuvola Digital",
        assetName: "Token sale",
        policyId: "5b26e685cc5c9ad630bde3e3cd48c694436671f3d25df53777ca60ef",
        frequency: 4,
        startDate: '2024-06-23',
        cliffDate: '2024-09-06',
        totalTreasury: 5000000,
        ticker: "NVL",
        isComplete: true,
        vestingData: [       
            { address: 'addr...2k4u', vestingAmount: 58436, directAmount: 5000 },
            { address: 'addr...1kj3', vestingAmount: 23579, directAmount: 5500 },
            { address: 'addr...2k3j', vestingAmount: 69741, directAmount: 6000 },
            { address: 'addr...2k3j', vestingAmount: 10432, directAmount: 6500 },
            { address: 'addr...2k3j', vestingAmount: 83096, directAmount: 7000 },
            { address: 'addr...2k3j', vestingAmount: 57023, directAmount: 7500 },
            { address: 'addr...2k3j', vestingAmount: 98765, directAmount: 8000 },
        ]
    },
    { 
        id: 3,
        name: "SundaeSwap",
        assetName: "SUNDAE",
        policyId: "9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d77.53554e444145",
        frequency: 5,
        startDate: '2024-10-17',
        cliffDate: '2024-12-16',
        totalTreasury: 475399,
        ticker: "SUNDAE",
        isComplete: true,
        vestingData: [       
            { address: 'addr...2k4u', vestingAmount: 32674, directAmount: 8500 },
            { address: 'addr...1kj3', vestingAmount: 52347, directAmount: 1500 },
            { address: 'addr...2k3j', vestingAmount: 87123, directAmount: 2000 },
            { address: 'addr...2k3j', vestingAmount: 64389, directAmount: 2500 },
            { address: 'addr...2k3j', vestingAmount: 41256, directAmount: 3000 },
            { address: 'addr...2k3j', vestingAmount: 95871, directAmount: 3500 },
            { address: 'addr...2k3j', vestingAmount: 72648, directAmount: 4000 },
        ]
    },
]


const CreateVestingPage: FC = () => {
    const [_projects, setProjects] = useState(projects.sort((a, b) => b.id - a.id));
    const [selectedProject, setSelectedProject] = useState(_projects[0]);
    const [onEdit, setOnEdit] = useState(false);
    const theme = useTheme();

    // Project Name Input Logic
    const [onProjectNameInput, setOnProjectNameInput] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [textFieldError, setTextFieldError] = useState(false);
    const textFieldRef = useRef<HTMLInputElement>(null);
    
    const handleProjectItemOnClick = (project: ProjectItem) => {
        setOnProjectNameInput(false);
        setOnEdit(false);
        setSelectedProject(project);
    }

    const resetTextField = () => {
        setProjectName('');
        setTextFieldError(true);
    }

    const handleAddProjectOrCompleteOnClick = () => {
        if (!onProjectNameInput) {
            resetTextField();
            setOnProjectNameInput(true);
            setOnEdit(true);
        } else if (projectName.trim() === "") {
            textFieldRef.current?.focus();
        } else {
            const newProject: ProjectItem = {
                id: _projects.length + 1,
                name: projectName,
                assetName: "",
                policyId: "",
                frequency: 0,
                startDate: "",
                cliffDate: "",
                totalTreasury: 0,
                ticker: "",
                isComplete: false,
                vestingData: []
            }
            setProjects([..._projects, newProject].sort((a, b) => b.id - a.id));
            setSelectedProject(newProject);
            setOnProjectNameInput(false);
        }
    }

    const handleCancelOnClick = () => {
        setOnProjectNameInput(false);
        setOnEdit(false);
    }

    const handleProjectNameInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setProjectName(value);

        if (value.trim() === "") {
            setTextFieldError(true);
        } else {
            setTextFieldError(false);
        }
    }

    useEffect(() => {
        if (onProjectNameInput && textFieldRef.current) {
            textFieldRef.current.focus();
        }
    }, [onProjectNameInput]);

    return (
        <AdminMenu>
            <Box sx={{ display: 'flex', flexDirection: 'column', padding: '25px', mr: '188px' }}>
                <Typography variant="h3">
                    Coinecta Vesting Admin
                </Typography>
                <Divider />
                <Box sx={{ display: 'flex', mt: '20px', gap: '50px', width: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Box
                            component="nav"
                            aria-label='project-list'
                        >
                            <Typography variant="h4">
                                Projects
                            </Typography>
                            <Box sx={{ maxHeight: 314, overflow: 'auto', width: 250, my: '10px' }}>
                                <List sx={{ width: 240, display: 'flex', flexDirection: 'column', gap: '10px', padding: 0}}>
                                    {_projects.map((project: ProjectItem) => (
                                        <ListItemButton 
                                            key={project.id} 
                                            onClick={() => handleProjectItemOnClick(project)}
                                            sx = {{
                                                background: selectedProject.id === project.id ? theme.palette.background.paper : 'none',
                                                borderRadius: '8px',
                                                transition: 'transform 100ms',
                                                '&:hover': {
                                                    background: theme.palette.background.paper,
                                                    transform: 'scale(1.01)',
                                                }
                                            }}
                                        >
                                            <ListItemText primary={project.name} primaryTypographyProps={{ sx: { fontWeight: 600 } }} />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Box>
                            {projects.length > 6 &&
                                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'end'}}>
                                    <Typography variant="caption">
                                        Scroll to see more projects.
                                    </Typography>
                                </Box>
                            }
                        </Box>
                        <Divider sx={{ my: '5px' }}/>
                        <Box>
                            {onProjectNameInput &&
                                <TextField
                                    error={textFieldError}
                                    required
                                    id="project-name"
                                    label="Project Name"
                                    size="small"
                                    value={projectName}
                                    onChange={handleProjectNameInputOnChange}
                                    inputRef={textFieldRef}
                                    sx={{ mt: '5px' }}
                                />
                            }
                            <Box display="flex" gap="5px" marginTop="5px" width="100%">
                                <Button
                                    variant='contained'
                                    color='primary'
                                    sx={{
                                        width: onProjectNameInput ? '50%' : '100%',
                                        fontWeight: 500,
                                        fontSize: '18px'
                                    }}
                                    onClick={() => handleAddProjectOrCompleteOnClick()}
                                >
                                    {onProjectNameInput ?
                                        <span>Proceed</span>
                                        :
                                        <span>Add a Project</span>
                                    }
                                </Button>
                                {onProjectNameInput &&
                                    <Button
                                        variant='outlined'
                                        color='primary'
                                        sx={{
                                            width: '50%',
                                            fontWeight: 500,
                                            fontSize: '18px'
                                        }}
                                        onClick={() => handleCancelOnClick()}
                                    >
                                        Cancel
                                    </Button>
                                }
                            </Box>
                        </Box>
                    </Box>
                    <VestingParameters project={selectedProject} onEdit={onEdit} onProjectNameInput={onProjectNameInput}/>
                </Box>
            </Box>
        </AdminMenu>
    )
};

export default CreateVestingPage;