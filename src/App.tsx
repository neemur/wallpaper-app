// --- src/App.tsx ---
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'; // Added useRef
import { useDebounce } from './lib/hooks';
import {
    Project,
    ClientInfo,
    GeneralProjectInfo,
    Room,
    RoomSpecificInfo,
    Wall
} from './lib/types';
import {
    createNewProject,
    createNewRoom,
    createNewWall,
    createNewGeneralProjectInfo,
    createNewClientInfo,
    createNewRoomSpecificInfo,
    isProject // Added
} from './lib/helpers';
import { calculateWallValues } from './lib/calculations';
import { AUTO_SAVE_DEBOUNCE_TIME } from './lib/constants';
import {
    AlertCircle,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    DollarSign,
    Download, // Added
    FolderPlus,
    Home,
    MenuIcon,
    Plus,
    Save,
    Trash2
} from './components/ui/Icons';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Textarea } from './components/ui/Textarea';
import { Label } from './components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/Card';
import { Alert, AlertDescription, AlertTitle } from './components/ui/Alert';
import { ProjectMenuModal } from './components/ProjectMenuModal';
import { WallInputCard } from './components/WallInputCard';

const App = () => {
    const [projects, setProjects] = useState<Project[]>(() => {
        const savedData = localStorage.getItem('wallpaperCalculatorData_v3');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                return parsedData.projects.map((proj: Project) => ({
                    ...proj,
                    generalProjectInfo: proj.generalProjectInfo || createNewGeneralProjectInfo(),
                    clientInfo: proj.clientInfo || createNewClientInfo(),
                    isClientInfoCollapsed: proj.isClientInfoCollapsed === undefined ? false : proj.isClientInfoCollapsed,
                    isGeneralProjectInfoCollapsed: proj.isGeneralProjectInfoCollapsed === undefined ? false : proj.isGeneralProjectInfoCollapsed,
                    rooms: proj.rooms.map((room: Room) => ({
                        ...room,
                        details: room.details || createNewRoomSpecificInfo(),
                        isCollapsed: room.isCollapsed === undefined ? false : room.isCollapsed,
                        walls: room.walls.map((wall: Wall) => ({
                            // Updated to pass full details object
                            ...calculateWallValues(wall, room.details),
                            isCollapsed: wall.isCollapsed === undefined ? false : wall.isCollapsed
                        }))
                    }))
                })) || [createNewProject(1)];
            } catch (e) { console.error("Failed to parse saved projects:", e); }
        }
        return [createNewProject(1)];
    });
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(() => { const savedData = localStorage.getItem('wallpaperCalculatorData_v3'); if (savedData) { try { const parsedData = JSON.parse(savedData); return parsedData.currentProjectId || (projects.length > 0 ? projects[0].id : null); } catch (e) { } } return projects.length > 0 ? projects[0].id : null; });
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(() => { const savedData = localStorage.getItem('wallpaperCalculatorData_v3'); if (savedData) { try { const parsedData = JSON.parse(savedData); const cpid = parsedData.currentProjectId || (projects.length > 0 ? projects[0].id : null); return parsedData.currentRoomId || projects.find(p => p.id === cpid)?.rooms[0]?.id || null; } catch (e) { } } const cpid = projects.length > 0 ? projects[0].id : null; return projects.find(p => p.id === cpid)?.rooms[0]?.id || null; });
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [projectSearchTerm, setProjectSearchTerm] = useState('');
    const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const debouncedHasUnsavedChanges = useDebounce(hasUnsavedChanges, AUTO_SAVE_DEBOUNCE_TIME);

    const currentProject = useMemo(() => projects.find(p => p.id === currentProjectId), [projects, currentProjectId]);

    useEffect(() => { if (debouncedHasUnsavedChanges && projects && projects.length > 0) { handleSave(true); setHasUnsavedChanges(false); } }, [debouncedHasUnsavedChanges, projects]);
    useEffect(() => { if (infoMessage) { const timer = setTimeout(() => setInfoMessage(null), 3000); return () => clearTimeout(timer); } }, [infoMessage]);
    useEffect(() => { if (error) { const timer = setTimeout(() => setError(null), 5000); return () => clearTimeout(timer); } }, [error]);

    const markUnsaved = () => { setHasUnsavedChanges(true); setSaveStatus('idle'); }
    const handleAddProject = () => { const newProject = createNewProject(projects.length + 1); setProjects(prev => [...prev, newProject]); setCurrentProjectId(newProject.id); setCurrentRoomId(newProject.rooms[0]?.id || null); setInfoMessage(`Project "${newProject.name}" added.`); markUnsaved(); };
    const handleDeleteProject = (projectId: string) => { if (projects.length === 1) { setError("Cannot delete the last project."); return; } const projectName = projects.find(p => p.id === projectId)?.name || "Project"; setProjects(prev => prev.filter(p => p.id !== projectId)); if (currentProjectId === projectId) { const remainingProjects = projects.filter(p => p.id !== projectId); const firstProject = remainingProjects.length > 0 ? remainingProjects[0] : null; setCurrentProjectId(firstProject?.id || null); setCurrentRoomId(firstProject?.rooms[0]?.id || null); } setInfoMessage(`Project "${projectName}" deleted.`); markUnsaved(); if (projects.filter(p => p.id !== projectId).length === 0) { setIsProjectMenuOpen(false); setCurrentProjectId(null); setCurrentRoomId(null); } };
    const handleProjectNameChange = (projectId: string, newName: string) => { setProjects(prev => prev.map(p => p.id === projectId ? { ...p, name: newName } : p)); markUnsaved(); };
    const handleSelectProject = (projectId: string) => { setCurrentProjectId(projectId); setCurrentRoomId(projects.find(p => p.id === projectId)?.rooms[0]?.id || null); };
    const handleNumberInputWheel = (event: React.WheelEvent<HTMLInputElement>) => {
        // Prevent the default scroll behavior only if the input is focused
        if (document.activeElement === event.currentTarget) {
            event.preventDefault();
        }
    };

    const handleAddRoom = () => {
        if (!currentProjectId || !currentProject) return;
        const newRoom = createNewRoom(currentProject.rooms.length + 1);
        setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, rooms: [...p.rooms, newRoom] } : p));
        setCurrentRoomId(newRoom.id);
        setInfoMessage(`Room "${newRoom.name}" added to ${currentProject.name}.`);
        markUnsaved();
    };
    const handleDeleteRoom = (roomId: string) => { if (!currentProjectId || !currentProject) return; if (currentProject.rooms.length === 1) { setError(`Cannot delete the last room in project "${currentProject.name}".`); return; } const roomName = currentProject.rooms.find(r => r.id === roomId)?.name || "Room"; setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, rooms: p.rooms.filter(r => r.id !== roomId) } : p)); if (currentRoomId === roomId) { setCurrentRoomId(currentProject.rooms.filter(r => r.id !== roomId)[0]?.id || null); } setInfoMessage(`Room "${roomName}" deleted.`); markUnsaved(); };
    const handleRoomNameChange = (roomId: string, newName: string) => { if (!currentProjectId || !currentProject) return; setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, rooms: p.rooms.map(r => r.id === roomId ? { ...r, name: newName } : r) } : p)); markUnsaved(); };
    const toggleRoomCollapse = (roomId: string) => { if (!currentProjectId || !currentProject) return; setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, rooms: p.rooms.map(r => r.id === roomId ? { ...r, isCollapsed: !r.isCollapsed } : r) } : p)); markUnsaved(); };

    // Updated per request point #2
    const handleRoomDetailsChange = (roomId: string, field: keyof RoomSpecificInfo, value: any) => {
        if (!currentProjectId) return;
        setProjects(prev => prev.map(p => {
            if (p.id === currentProjectId) {
                return {
                    ...p,
                    rooms: p.rooms.map(r => {
                        if (r.id === roomId) {
                            const updatedDetails = { ...r.details, [field]: value };

                            // Check if the changed field affects wall height or ceiling surcharge
                            const heightFields: (keyof RoomSpecificInfo)[] = ['ceilingHeight', 'baseboardHeight', 'verticalCrownHeight', 'chairRailHeight', 'isCeiling'];

                            if (heightFields.includes(field)) {
                                return {
                                    ...r,
                                    details: updatedDetails,
                                    // Recalculate all walls with the *new* details object
                                    walls: r.walls.map(wall => calculateWallValues(wall, updatedDetails))
                                };
                            }

                            // For other fields, just update details
                            return { ...r, details: updatedDetails };
                        }
                        return r;
                    })
                };
            }
            return p;
        }));
        markUnsaved();
    };
    const handleNumericRoomDetailsChange = (roomId: string, field: keyof RoomSpecificInfo, value: string) => {
        handleRoomDetailsChange(roomId, field, value === '' ? undefined : Number(value));
    };
    const toggleRoomDetailsCollapse = (roomId: string) => {
        if (!currentProjectId) return;
        setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, rooms: p.rooms.map(r => r.id === roomId ? { ...r, details: { ...r.details, isDetailsCollapsed: !r.details.isDetailsCollapsed } } : r) } : p));
        markUnsaved();
    };

    const toggleClientInfoCollapse = (projectId: string) => { setProjects(prev => prev.map(p => p.id === projectId ? { ...p, isClientInfoCollapsed: !p.isClientInfoCollapsed } : p)); markUnsaved(); };
    const toggleGeneralProjectInfoCollapse = (projectId: string) => { setProjects(prev => prev.map(p => p.id === projectId ? { ...p, isGeneralProjectInfoCollapsed: !p.isGeneralProjectInfoCollapsed } : p)); markUnsaved(); };

    const handleAddWall = (targetRoomId: string) => {
        if (!currentProjectId || !currentProject) return;
        let targetRoomNameForMessage = "Unknown Room";
        let wallCountInTargetRoomForNaming = 0;
        const projectInstance = projects.find(p => p.id === currentProjectId);
        let roomDetails: RoomSpecificInfo | undefined = undefined; // Updated
        if (projectInstance) {
            const roomInstance = projectInstance.rooms.find(r => r.id === targetRoomId);
            if (roomInstance) {
                targetRoomNameForMessage = roomInstance.name;
                wallCountInTargetRoomForNaming = roomInstance.walls.length;
                roomDetails = roomInstance.details; // Get full details object
            } else { console.error("Target room not found"); setError("Could not add wall: target room not found."); return; }
        } else { console.error("Current project not found"); setError("Could not add wall: current project not found."); return; }
        const newWall = createNewWall(wallCountInTargetRoomForNaming + 1);
        // Updated to pass full details object
        setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, rooms: p.rooms.map(r => r.id === targetRoomId ? { ...r, walls: [...r.walls, calculateWallValues(newWall, roomDetails)] } : r) } : p));
        // Updated per PDF point #2
        setInfoMessage(`Space "${newWall.name}" added to ${targetRoomNameForMessage}.`);
        markUnsaved();
    };

    const handleDeleteWall = (roomId: string, wallId: string) => { if (!currentProjectId) return; setProjects(prevProjects => prevProjects.map(proj => { if (proj.id !== currentProjectId) return proj; return { ...proj, rooms: proj.rooms.map(room => { if (room.id !== roomId) return room; // Updated per PDF point #2
            if (room.walls.length === 1) { setError(`Cannot delete the last space in room "${room.name}".`); return room; } const wallName = room.walls.find(w => w.id === wallId)?.name || "Space"; // Updated per PDF point #2
            setInfoMessage(`Space "${wallName}" deleted from ${room.name}.`); return { ...room, walls: room.walls.filter(w => w.id !== wallId) }; }) }; })); markUnsaved(); };

    // Updated per request point #2
    const handleWallChange = useCallback((roomId: string, wallId: string, updates: Partial<Wall>) => {
        setProjects(prevProjects => prevProjects.map(proj => {
            if (proj.id !== currentProjectId) return proj;
            const targetRoom = proj.rooms.find(r => r.id === roomId);
            const roomDetails = targetRoom?.details; // Get the room details
            return {
                ...proj, rooms: proj.rooms.map(room => {
                    if (room.id !== roomId) return room;
                    // Updated to pass full details object
                    return { ...room, walls: room.walls.map(wall => wall.id === wallId ? calculateWallValues({ ...wall, ...updates }, roomDetails) : wall) };
                })
            };
        }));
        markUnsaved();
    }, [currentProjectId]);

    const toggleWallCollapse = (roomId: string, wallId: string) => { if (!currentProjectId) return; setProjects(prevProjects => prevProjects.map(proj => { if (proj.id !== currentProjectId) return proj; return { ...proj, rooms: proj.rooms.map(room => { if (room.id !== roomId) return room; return { ...room, walls: room.walls.map(wall => wall.id === wallId ? { ...wall, isCollapsed: !wall.isCollapsed } : wall) }; }) }; })); markUnsaved(); };

    const handleClientInfoChange = (field: keyof ClientInfo, value: any) => {
        if (!currentProjectId || !currentProject) return;
        setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, clientInfo: { ...p.clientInfo, [field]: value } } : p));
        markUnsaved();
    };
    const handleGeneralProjectInfoChange = (field: keyof GeneralProjectInfo, value: any) => {
        if (!currentProjectId || !currentProject) return;
        setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, generalProjectInfo: { ...p.generalProjectInfo, [field]: value } } : p));
        markUnsaved();
    };
    const handleNumericGeneralProjectInfoChange = (field: keyof GeneralProjectInfo, value: string) => { handleGeneralProjectInfoChange(field, value === '' ? undefined : Number(value)); };

    const handleSave = useCallback((isAutoSave = false) => {
        if (!isAutoSave) { setInfoMessage(null); setHasUnsavedChanges(false); }
        setError(null);
        setSaveStatus('saving');
        try {
            const dataToSave = { projects, currentProjectId, currentRoomId };
            const jsonData = JSON.stringify(dataToSave, null, 2);
            localStorage.setItem('wallpaperCalculatorData_v3', jsonData);
            setTimeout(() => {
                setSaveStatus('saved');
                if (!isAutoSave) setInfoMessage('All projects saved successfully!');
                setTimeout(() => setSaveStatus('idle'), 2000);
            }, 500);
        } catch (e: any) {
            setSaveStatus('error');
            setError(`Error saving data: ${e.message}`);
        }
    }, [projects, currentProjectId, currentRoomId]);

    const handleLoad = () => { setError(null); setInfoMessage(null); try { const savedData = localStorage.getItem('wallpaperCalculatorData_v3'); if (savedData) { const parsedData = JSON.parse(savedData); const loadedProjects: Project[] = parsedData.projects.map((proj: Project) => ({ ...proj, generalProjectInfo: proj.generalProjectInfo || createNewGeneralProjectInfo(), clientInfo: proj.clientInfo || createNewClientInfo(), isClientInfoCollapsed: proj.isClientInfoCollapsed === undefined ? false : proj.isClientInfoCollapsed, isGeneralProjectInfoCollapsed: proj.isGeneralProjectInfoCollapsed === undefined ? false : proj.isGeneralProjectInfoCollapsed, rooms: proj.rooms.map((room: Room) => ({ ...room, details: room.details || createNewRoomSpecificInfo(), isCollapsed: room.isCollapsed === undefined ? false : room.isCollapsed, walls: room.walls.map((wall: Wall) => ({ ...calculateWallValues(wall, room.details), isCollapsed: wall.isCollapsed === undefined ? false : wall.isCollapsed })) })) })); setProjects(loadedProjects || [createNewProject(1)]); const cpid = parsedData.currentProjectId || (loadedProjects.length > 0 ? loadedProjects[0].id : null); setCurrentProjectId(cpid); setCurrentRoomId(parsedData.currentRoomId || loadedProjects.find(p => p.id === cpid)?.rooms[0]?.id || null); setInfoMessage('Projects loaded successfully!'); } else { setInfoMessage('No saved data found.'); } } catch (e: any) { setError(`Error loading data: ${e.message}`); } setSaveStatus('idle'); setHasUnsavedChanges(false); };
    useEffect(() => { if (projects.length > 0) { if (!currentProjectId || !projects.find(p => p.id === currentProjectId)) { const firstProject = projects[0]; setCurrentProjectId(firstProject.id); setCurrentRoomId(firstProject.rooms[0]?.id || null); } else { const proj = projects.find(p => p.id === currentProjectId); if (proj && (!currentRoomId || !proj.rooms.find(r => r.id === currentRoomId))) { setCurrentRoomId(proj.rooms[0]?.id || null); } } } else { setCurrentProjectId(null); setCurrentRoomId(null); } }, [projects, currentProjectId, currentRoomId]);

    // --- New Export Function ---
    const handleExportProject = () => {
        if (!currentProject) {
            setError("No project selected to export.");
            return;
        }
        try {
            const projectName = currentProject.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const fileName = `${projectName || 'project'}.wallpaper_proj.json`;
            const dataToExport = JSON.stringify(currentProject, null, 2);
            const blob = new Blob([dataToExport], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setInfoMessage(`Project "${currentProject.name}" exported successfully.`);
        } catch (e: any) {
            setError(`Error exporting project: ${e.message}`);
        }
    };

    // --- New Import Function ---
    const handleImportProject = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("Could not read file.");
                }
                const importedProject = JSON.parse(text);

                // Validate the imported object
                if (!isProject(importedProject)) {
                    throw new Error("Invalid project file format.");
                }

                // Check for ID conflict
                if (projects.some(p => p.id === importedProject.id)) {
                    throw new Error(`A project with ID "${importedProject.id}" (name: "${importedProject.name}") already exists.`);
                }

                // Add the new project
                setProjects(prev => [...prev, importedProject]);
                setCurrentProjectId(importedProject.id);
                setCurrentRoomId(importedProject.rooms[0]?.id || null);
                setInfoMessage(`Project "${importedProject.name}" imported successfully.`);
                markUnsaved();
                setIsProjectMenuOpen(false); // Close modal on success
            } catch (e: any) {
                setError(`Import failed: ${e.message}`);
            }
        };
        reader.onerror = () => {
            setError("Error reading file.");
        };
        reader.readAsText(file);
    };

    // Updated per PDF point #12
    const projectTravelCharges = useMemo(() => {
        if (!currentProject || !currentProject.generalProjectInfo) return 0;
        const { roundTripMileage } = currentProject.generalProjectInfo;
        if (roundTripMileage === undefined || roundTripMileage <= 60) return 0;
        return roundTripMileage * 0.70;
    }, [currentProject]);

    const totalProjectLaborWithTravel = useMemo(() => {
        if (!currentProject) return 0;
        const laborFromWalls = currentProject.rooms.reduce((projectTotal, room) => projectTotal + room.walls.reduce((roomWallTotal, wall) => roomWallTotal + (wall.grandTotalLabor || 0), 0), 0);
        return laborFromWalls + projectTravelCharges;
    }, [currentProject, projectTravelCharges]);

    // Added per request point #3
    const totalProjectPaper = useMemo(() => {
        if (!currentProject) return 0;
        return currentProject.rooms.reduce((projectTotal, room) =>
                projectTotal + room.walls.reduce((roomWallTotal, wall) =>
                        roomWallTotal + (wall.paperGrandTotal || 0)
                    , 0)
            , 0);
    }, [currentProject]);

    const getRoomTotalLabor = useCallback((room: Room | undefined) => { if (!room) return 0; return room.walls.reduce((total, wall) => total + (wall.grandTotalLabor || 0), 0); }, []);

    // Added per request point #1
    const getRoomTotalPaper = useCallback((room: Room | undefined) => { if (!room) return 0; return room.walls.reduce((total, wall) => total + (wall.paperGrandTotal || 0), 0); }, []);

    if (projects.length === 0 && !currentProject) {
        return (
            <div className="no-projects-container">
                <div className="no-projects-content">
                    <FolderPlus className="no-projects-icon" />
                    <h1 className="no-projects-title">No Projects Yet</h1>
                    <p className="no-projects-text">Get started by creating your first project.</p>
                    <Button onClick={handleAddProject} className="no-projects-button">
                        <Plus /> Create New Project
                    </Button>
                </div>
                <footer className="footer-text"> Wallpaper Calculator &copy; {new Date().getFullYear()} </footer>
            </div>
        );
    }

    return (
        <div className="app-container">
            {/* Passed new onImportProject prop */}
            <ProjectMenuModal
                isOpen={isProjectMenuOpen}
                onClose={() => setIsProjectMenuOpen(false)}
                projects={projects}
                currentProjectId={currentProjectId}
                onSelectProject={handleSelectProject}
                onAddProject={handleAddProject}
                onDeleteProject={handleDeleteProject}
                searchTerm={projectSearchTerm}
                onSearchTermChange={setProjectSearchTerm}
                onImportProject={handleImportProject}
            />
            <div className="sticky-header">
                {error && (<Alert variant="destructive"><AlertCircle /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>)}
                {infoMessage && (<Alert variant="success"><CheckCircle /><AlertTitle>Success</AlertTitle><AlertDescription>{infoMessage}</AlertDescription></Alert>)}
                <div className="header-content">
                    <div className="header-left"> <Button variant="ghost" size="icon" onClick={() => setIsProjectMenuOpen(true)} className="btn-open-menu" aria-label="Open project menu"> <MenuIcon /> </Button> <h1 className="app-title">Wallpaper Calculator</h1> </div>
                    {/* Added Export Button */}
                    <div className="header-right">
                        <span className={`save-status ${saveStatus !== 'idle' || hasUnsavedChanges ? 'save-status-visible' : 'save-status-hidden'}`}>
                            {hasUnsavedChanges && saveStatus === 'idle' && <span className="status-unsaved">Unsaved</span>}
                            {saveStatus === 'saving' && <span className="status-saving">Saving...</span>}
                            {saveStatus === 'saved' && <span className="status-saved">Saved</span>}
                            {saveStatus === 'error' && <span className="status-error">Save failed</span>}
                        </span>
                        <Button onClick={handleExportProject} className="btn-manualsave" size="xs-sm" variant="default" disabled={!currentProject}>
                            <Download /> Export
                        </Button>
                        <Button onClick={() => handleSave(false)} className="btn-manualsave" size="xs-sm">
                            <Save /> Manual Save
                        </Button>
                    </div>
                </div>
            </div>

            {!currentProject && projects.length > 0 && (
                <Card className="card-my-8">
                    <CardContent className="text-center py-10" style={{ textAlign: 'center', paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
                        <FolderPlus style={{ height: '3rem', width: '3rem', color: '#94a3b8', margin: '0 auto 0.75rem auto' }} />
                        <p style={{ color: '#475569', marginBottom: '1rem' }}>Please select or create a project to begin.</p>
                        <Button onClick={() => setIsProjectMenuOpen(true)} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white" style={{ marginTop: '1rem', backgroundColor: '#3b82f6', color: 'white' }}>Open Project Menu</Button>
                    </CardContent>
                </Card>
            )}

            {currentProject && (
                <>
                    {/* Updated per request point #3 */}
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3" style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                        <Input value={currentProject.name} onChange={(e) => handleProjectNameChange(currentProject.id, e.target.value)} className="input-project-name" placeholder="Project Name" />
                        <div className="flex flex-wrap gap-x-6 gap-y-2"> {/* Wrapper for totals */}
                            <div className="total-project-labor" style={{ color: '#059669' }}> {/* Green for paper */}
                                <DollarSign /> Total Project Paper: ${totalProjectPaper.toFixed(2)}
                            </div>
                            <div className="total-project-labor"> {/* Default color for labor */}
                                <DollarSign /> Total Project Labor: ${totalProjectLaborWithTravel.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <Card className="card-mb-6">
                        <CardHeader className="card-header-flex card-header-interactive" onClick={() => toggleClientInfoCollapse(currentProject.id)}> <CardTitle className="card-title-sky">Client Information</CardTitle> <Button variant="ghost" size="icon" baseClass="btn" style={{ color: '#64748b' }}> {currentProject.isClientInfoCollapsed ? <ChevronDown /> : <ChevronUp />} </Button> </CardHeader>
                        {!currentProject.isClientInfoCollapsed && (
                            <CardContent className="card-content-grid">
                                <div> <Label htmlFor="clientName">Client Name</Label> <Input id="clientName" value={currentProject.clientInfo.clientName} onChange={(e) => handleClientInfoChange("clientName", e.target.value)} /> </div>
                                <div> <Label htmlFor="clientAddress">Client Address</Label> <Input id="clientAddress" value={currentProject.clientInfo.clientAddress} onChange={(e) => handleClientInfoChange("clientAddress", e.target.value)} /> </div>
                                <div> <Label htmlFor="clientPhone">Client Phone</Label> <Input id="clientPhone" type="tel" value={currentProject.clientInfo.clientPhone} onChange={(e) => handleClientInfoChange("clientPhone", e.target.value)} /> </div>
                                <div> <Label htmlFor="clientEmail">Client Email</Label> <Input id="clientEmail" type="email" value={currentProject.clientInfo.clientEmail} onChange={(e) => handleClientInfoChange("clientEmail", e.target.value)} /> </div>
                            </CardContent>
                        )}
                    </Card>
                    <Card className="card-mb-8">
                        <CardHeader className="card-header-flex card-header-interactive" onClick={() => toggleGeneralProjectInfoCollapse(currentProject.id)}> <CardTitle className="card-title-blue">General Project Details</CardTitle> <Button variant="ghost" size="icon" baseClass="btn" style={{ color: '#64748b' }}> {currentProject.isGeneralProjectInfoCollapsed ? <ChevronDown /> : <ChevronUp />} </Button> </CardHeader>
                        {!currentProject.isGeneralProjectInfoCollapsed && (
                            <CardContent className="card-content-grid card-content-grid-3-cols">
                                {[
                                    { label: "Designer/Builder", field: "designerBuilderName", type: "text" },
                                    { label: "Project Manager", field: "projectManagerName", type: "text" },
                                    { label: "PM Phone", field: "projectManagerPhone", type: "tel" },
                                    { label: "Invoice To", field: "invoiceTo", type: "text" },
                                    { label: "Project Type", field: "projectType", type: "text" },
                                    { label: "Round Trip Mileage", field: "roundTripMileage", type: "number" },
                                    { label: "# Days for Install", field: "numberOfDaysForInstall", type: "number" },
                                    // Updated per PDF point #1
                                    { label: "Input Date", field: "inputDate", type: "text", placeholder: "MM/DD/YY" },
                                    { label: "Estimate Sent", field: "estimateSentDate", type: "text", placeholder: "MM/DD/YY" },
                                    { label: "Approval Date", field: "approvalDate", type: "text", placeholder: "MM/DD/YY" },
                                    { label: "Order Date", field: "orderDate", type: "text", placeholder: "MM/DD/YY" },
                                    { label: "Order Rec'd", field: "orderReceivedDate", type: "text", placeholder: "MM/DD/YY" },
                                    { label: "Est. Ready Install", field: "estimatedDateReadyForInstall", type: "text", placeholder: "MM/DD/YY" },
                                    { label: "Sched. Install", field: "scheduledInstallDate", type: "text", placeholder: "MM/DD/YY" },
                                ].map(item => (
                                    <div key={item.field}>
                                        <Label htmlFor={`genProjInfo-${item.field}`}>{item.label}</Label>
                                        <Input
                                            id={`genProjInfo-${item.field}`}
                                            type={item.type}
                                            value={(currentProject.generalProjectInfo as any)[item.field] || ''}
                                            onChange={(e) => item.type === 'number' ? handleNumericGeneralProjectInfoChange(item.field as keyof GeneralProjectInfo, e.target.value) : handleGeneralProjectInfoChange(item.field as keyof GeneralProjectInfo, e.target.value)}
                                            className="mt-1"
                                            placeholder={(item as any).placeholder} // Added per PDF point #1
                                        />
                                    </div>
                                ))}

                                {/* Added read-only field for calculated mileage charge */}
                                <div>
                                    <Label htmlFor="genProjInfo-travelCharge">Mileage Travel Charge ($)</Label>
                                    <Input
                                        id="genProjInfo-travelCharge"
                                        type="text"
                                        value={projectTravelCharges.toFixed(2)}
                                        className="input-readonly mt-1"
                                        readOnly
                                        tabIndex={-1}
                                    />
                                </div>

                                <div className="md:col-span-2 lg:col-span-3">
                                    <Label htmlFor="genProjInfo-notes">Notes / Site Conditions</Label>
                                    <Textarea id="genProjInfo-notes" value={currentProject.generalProjectInfo.notes} onChange={(e) => handleGeneralProjectInfoChange("notes", e.target.value)} className="mt-1 textarea-h-20" />
                                </div>
                            </CardContent>
                        )}
                    </Card>

                    {/* Rooms Section */}
                    <Card className="card-mb-6">
                        <CardHeader className="card-header-flex-column-sm">
                            <div>
                                <CardTitle className="card-title-green">Rooms in {currentProject.name}</CardTitle>
                                <CardDescription>Manage rooms, their specific details, and walls.</CardDescription>
                            </div>
                            <Button onClick={handleAddRoom} className="btn-add-wall" style={{ backgroundColor: '#14b8a6', marginTop: 0 }}>
                                <Home className="mr-2" style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.5rem' }} /> Add New Room
                            </Button>
                        </CardHeader>
                        {currentProject.rooms.length > 0 && (
                            <CardContent className="space-y-4" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
                                {currentProject.rooms.map(room => {
                                    const roomTotalLabor = getRoomTotalLabor(room);
                                    const roomTotalPaper = getRoomTotalPaper(room); // Added per request
                                    return (
                                        <div key={room.id} className="room-item-container">
                                            <div className="room-header" onClick={() => toggleRoomCollapse(room.id)}>
                                                <div className="room-header-left">
                                                    <Button variant="ghost" size="icon" baseClass="btn" className="mr-2" style={{ height: '2rem', width: '2rem', color: '#64748b' }}>
                                                        {room.isCollapsed ? <ChevronDown /> : <ChevronUp />}
                                                    </Button>
                                                    <Input value={room.name} onChange={(e) => { e.stopPropagation(); handleRoomNameChange(room.id, e.target.value); }} onClick={(e) => e.stopPropagation()} className="input-room-name" placeholder="Room Name" />
                                                </div>
                                                <div className="room-header-right">
                                                    {/* Updated to show paper and labor totals */}
                                                    {room.isCollapsed && (roomTotalPaper > 0 || roomTotalLabor > 0) && (
                                                        <>
                                                            <span className="room-labor-collapsed" style={{ color: '#059669' }}>Paper: ${roomTotalPaper.toFixed(2)}</span>
                                                            <span className="room-labor-collapsed">Labor: ${roomTotalLabor.toFixed(2)}</span>
                                                        </>
                                                    )}
                                                    {!room.isCollapsed && (
                                                        <>
                                                            <span className="room-labor-expanded" style={{ color: '#059669' }}>
                                                                ({room.walls.length} space{room.walls.length === 1 ? '' : 's'}) Paper: ${roomTotalPaper.toFixed(2)}
                                                            </span>
                                                            <span className="room-labor-expanded">
                                                                Labor: ${roomTotalLabor.toFixed(2)}
                                                            </span>
                                                        </>
                                                    )}
                                                    {currentProject.rooms.length > 1 && (
                                                        <Button onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.id); }} variant="ghost" size="icon" baseClass="btn room-delete-btn" aria-label="Delete room">
                                                            <Trash2 />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            {!room.isCollapsed && (
                                                <>
                                                    <Card className="room-details-card" style={{ margin: '1rem', borderTop: '1px solid #e2e8f0' }}>
                                                        <CardHeader className="card-header-flex card-header-interactive room-details-header" onClick={() => toggleRoomDetailsCollapse(room.id)}>
                                                            <CardTitle className="card-title-purple" style={{ fontSize: '1.1rem' }}>Room Paper & Dimension Details</CardTitle>
                                                            <Button variant="ghost" size="icon" baseClass="btn" style={{ color: '#64748b' }}>
                                                                {room.details.isDetailsCollapsed ? <ChevronDown /> : <ChevronUp />}
                                                            </Button>
                                                        </CardHeader>
                                                        {!room.details.isDetailsCollapsed && (
                                                            <CardContent className="card-content-grid card-content-grid-3-cols">
                                                                {/* Added per PDF point #3 */}
                                                                <div className="md:col-span-2 lg:col-span-3 flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`roomDetail-${room.id}-isCeiling`}
                                                                        checked={!!room.details.isCeiling}
                                                                        onChange={(e) => handleRoomDetailsChange(room.id, "isCeiling", e.target.checked)}
                                                                        style={{ height: '1rem', width: '1rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1', textShadow: 'none' }}
                                                                    />
                                                                    <Label htmlFor={`roomDetail-${room.id}-isCeiling`} style={{ marginBottom: 0 }}>
                                                                        This space is a ceiling
                                                                    </Label>
                                                                </div>
                                                                {[
                                                                    { label: "Paper Manufacturer", field: "paperManufacturer", type: "text" },
                                                                    { label: "Paper Pattern #", field: "paperPatternNumber", type: "text" },
                                                                    { label: "Paper Color #", field: "paperColorNumber", type: "text" },
                                                                    { label: "Product Photo Link", field: "paperProductPhotoLink", type: "url" },
                                                                    { label: "Type of Paper", field: "paperType", type: "text" },
                                                                    { label: "Ceiling Height (overall, for surcharge)", field: "ceilingHeight", type: "number" },
                                                                    { label: "Baseboard Height (in)", field: "baseboardHeight", type: "number" },
                                                                    { label: "Crown Height (in)", field: "verticalCrownHeight", type: "number" },
                                                                    { label: "Chair Rail Ht (in)", field: "chairRailHeight", type: "number" },
                                                                ].map(item => (
                                                                    <div
                                                                        key={item.field}>
                                                                        <Label htmlFor={`roomDetail-${room.id}-${item.field}`}>{item.label}</Label>
                                                                        <Input id={`roomDetail-${room.id}-${item.field}`} type={item.type} value={(room.details as any)[item.field] || ''} onChange={(e) => item.type === 'number' ? handleNumericRoomDetailsChange(room.id, item.field as keyof RoomSpecificInfo, e.target.value) : handleRoomDetailsChange(room.id, item.field as keyof RoomSpecificInfo, e.target.value)} className="mt-1" onWheel={item.type === "number" ? handleNumberInputWheel : undefined} />
                                                                    </div>
                                                                ))}
                                                                <div className="md:col-span-2 lg:col-span-3">
                                                                    <Label htmlFor={`roomDetail-${room.id}-paperSpecialRequirements`}>Paper Specific Special Requirements</Label>
                                                                    <Textarea id={`roomDetail-${room.id}-paperSpecialRequirements`} value={room.details.paperSpecialRequirements} onChange={(e) => handleRoomDetailsChange(room.id, "paperSpecialRequirements", e.target.value)} className="mt-1 textarea-h-20" />
                                                                </div>
                                                            </CardContent>
                                                        )}
                                                    </Card>
                                                    <div className="room-content"> {room.walls.map(wall => ( <WallInputCard key={wall.id} wall={wall} onChange={(wallId, updates) => handleWallChange(room.id, wallId, updates)} onDelete={(wallId) => handleDeleteWall(room.id, wallId)} onToggleCollapse={(wallId) => toggleWallCollapse(room.id, wallId)} /> ))}
                                                        {/* Updated per PDF point #2 */}
                                                        <Button onClick={() => handleAddWall(room.id)} className="btn-add-wall"> <Plus /> Add Space to {room.name} </Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </CardContent>
                        )}
                        {currentProject.rooms.length === 0 && (
                            <CardContent style={{ textAlign: 'center', paddingTop: '2rem', paddingBottom: '2rem' }}>
                                <Home style={{ height: '2.5rem', width: '2.5rem', color: '#94a3b8', margin: '0 auto 0.5rem auto' }} />
                                <p style={{ color: '#64748b', marginBottom: '0.75rem' }}>This project has no rooms yet.</p>
                                <Button onClick={handleAddRoom} style={{ backgroundColor: '#14b8a6', color: 'white' }}>
                                    <Plus className="mr-2" style={{ height: '1rem', width: '1rem', marginRight: '0.5rem' }} /> Add First Room
                                </Button>
                            </CardContent>
                        )}
                    </Card>
                </>
            )}
            <footer className="footer-text"> Wallpaper Calculator &copy; {new Date().getFullYear()} </footer>
        </div>
    );
};

export default App;