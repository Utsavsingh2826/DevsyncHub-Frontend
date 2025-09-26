import React from 'react'
import { useNavigate } from 'react-router-dom'

const ProjectCard = ({ project }) => {
    const navigate = useNavigate()

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        })
    }

    return (
        <div
            onClick={() => {
                navigate(`/project`, {
                    state: { project }
                })
            }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer group"
        >
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {project.name}
                        </h3>
                        {project.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {project.description}
                            </p>
                        )}
                    </div>
                    <div className="ml-2">
                        <i className="ri-more-2-line text-gray-400 group-hover:text-gray-600"></i>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <i className="ri-user-line mr-1"></i>
                            <span>{project.users?.length || 0} collaborators</span>
                        </div>
                        <div className="flex items-center">
                            <i className="ri-calendar-line mr-1"></i>
                            <span>{formatDate(project.createdAt)}</span>
                        </div>
                    </div>
                    <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                        <span className="text-xs font-medium">Open</span>
                        <i className="ri-arrow-right-line ml-1"></i>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectCard
