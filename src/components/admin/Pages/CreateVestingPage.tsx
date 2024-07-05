import React from 'react';
import { FC, useState } from 'react';
import {
    Box,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography,
    useTheme
} from '@mui/material';
import AdminMenu from '@components/admin/AdminMenu';
import VestingParameters from '../create-vesting/VestingParameters';

type ProjectItem = {
    id: number,
    name: string,
    frequency: number,
    startDate: string,
    cliffDate: string,
    totalTreasury: number,
    currency: string
}

const projects: ProjectItem[] = [
    {
        id: 1,
        name: "Coinecta",
        frequency: 10,
        startDate: '2024-01-07',
        cliffDate: '2024-03-24',
        totalTreasury: 1000000,
        currency: "CNCT"
    },
    { 
        id: 2,
        name: "Crashr",
        frequency: 20,
        startDate: '2024-06-23',
        cliffDate: '2024-09-06',
        totalTreasury: 5000000,
        currency: "CRASH"
    },
    { 
        id: 3,
        name: "SundaeSwap",
        frequency: 30,
        startDate: '2024-10-17',
        cliffDate: '2024-12-16',
        totalTreasury: 475399,
        currency: "SUNDAE"
    },
]


const CreateVestingPage: FC = () => {
    const [selectedProject, setSelectedProject] = useState(projects[0]);
    const theme = useTheme()
    
    const handleProjectOnClick = (project: ProjectItem) => {
        setSelectedProject(project);
    }

    return (
        <AdminMenu>
            <Box sx={{ display: 'flex', flexDirection: 'column', padding: '25px', mr: '188px' }}>
                <Typography variant="h3">
                    Coinecta Vesting Admin
                </Typography>
                <Divider />
                <Box sx={{ display: 'flex', mt: '20px', gap: '50px', width: '100%' }}>
                    <Box
                        component="nav"
                        aria-label='project-list'
                    >
                        <Typography variant="h4">
                            Projects
                        </Typography>
                        <List sx={{ width: 240, mt: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {projects.map((project: ProjectItem) => (
                                <ListItemButton 
                                    key={project.id} 
                                    onClick={() => handleProjectOnClick(project)}
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
                    <VestingParameters {...selectedProject}/>
                </Box>
            </Box>
        </AdminMenu>
    )
};

export default CreateVestingPage;