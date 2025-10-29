// --- src/components/ProjectMenuModal.tsx ---
import React, { useRef } from 'react'; // Added useRef
import { Project } from '../lib/types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { FolderPlus, Search, Trash2, XIcon, Upload } from './ui/Icons'; // Added Upload

interface ProjectMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    projects: Project[];
    currentProjectId: string | null;
    onSelectProject: (id: string) => void;
    onAddProject: () => void;
    onDeleteProject: (id: string) => void;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    onImportProject: (file: File) => void; // Added
}

export const ProjectMenuModal: React.FC<ProjectMenuModalProps> = ({
                                                                      isOpen,
                                                                      onClose,
                                                                      projects,
                                                                      currentProjectId,
                                                                      onSelectProject,
                                                                      onAddProject,
                                                                      onDeleteProject,
                                                                      searchTerm,
                                                                      onSearchTermChange,
                                                                      onImportProject // Added
                                                                  }) => {

    // Ref for the hidden file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const filteredProjects = projects.filter(proj =>
        proj.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleImportClick = () => {
        // Trigger the hidden file input
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImportProject(file);
        }
        // Reset the input value so the same file can be loaded again
        event.target.value = '';
    };

    return (
        <div className="project-menu-modal-overlay">
            {/* Hidden file input for import */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json,.wallpaper_proj"
                style={{ display: 'none' }}
            />

            <div className="project-menu-modal-backdrop" onClick={onClose}></div>
            <div className={`project-menu-modal-content ${isOpen ? 'open' : ''}`}>
                <div className="project-menu-header">
                    <h2 className="project-menu-title">Projects</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} baseClass="btn" style={{ color: '#64748b' }}>
                        <XIcon />
                    </Button>
                </div>
                <div className="project-menu-search-container">
                    <div className="project-menu-search-input-wrapper">
                        <Input
                            type="search"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                            className="project-menu-search-input"
                        />
                        <Search />
                    </div>
                    {/* Added Import Button */}
                    <Button onClick={handleImportClick} className="project-menu-new-btn" variant="default">
                        <Upload /> Import
                    </Button>
                    <Button onClick={() => { onAddProject(); }} className="project-menu-new-btn">
                        <FolderPlus /> New Project
                    </Button>
                </div>
                <div className="project-menu-list">
                    {filteredProjects.length > 0 ? (
                        filteredProjects.map(proj => (
                            <div key={proj.id} className={`project-menu-item ${currentProjectId === proj.id ? 'current' : ''}`}>
                                <Button
                                    onClick={() => { onSelectProject(proj.id); onClose(); }}
                                    baseClass="btn project-menu-item-button"
                                    variant="ghost"
                                >
                                    {proj.name}
                                </Button>
                                {projects.length > 1 && (
                                    <Button
                                        onClick={(e) => { e.stopPropagation(); onDeleteProject(proj.id); }}
                                        variant="ghost"
                                        size="icon"
                                        baseClass="btn project-menu-item-delete-btn"
                                        aria-label="Delete project"
                                    >
                                        <Trash2 />
                                    </Button>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="project-menu-empty-text">No projects match your search.</p>
                    )}
                    {projects.length === 0 && !searchTerm && (
                        <p className="project-menu-empty-text">No projects yet. Click "New Project" to start.</p>
                    )}
                </div>
            </div>
        </div>
    );
};