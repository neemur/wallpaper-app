// --- src/components/ProjectMenuModal.tsx ---
import React from 'react';
import { Project } from '../lib/types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { FolderPlus, Search, Trash2, XIcon } from './ui/Icons';

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
                                                                      onSearchTermChange
                                                                  }) => {
    if (!isOpen) return null;

    const filteredProjects = projects.filter(proj =>
        proj.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="project-menu-modal-overlay">
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
