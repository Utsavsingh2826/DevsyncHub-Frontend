import React, { useState } from 'react'
import axios from '../config/axios'

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
    const [projectName, setProjectName] = useState('')
    const [projectDescription, setProjectDescription] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const createProject = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await axios.post('/projects/create', {
                name: projectName,
                description: projectDescription,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })

            setProjectName('')
            setProjectDescription('')
            onClose()
            onProjectCreated()
        } catch (error) {
            console.error('Failed to create project:', error)
            alert('Failed to create project. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setProjectName('')
        setProjectDescription('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600"
                            disabled={isLoading}
                        >
                            <i className="ri-close-line text-xl"></i>
                        </button>
                    </div>
                    
                    <form onSubmit={createProject} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project Name
                            </label>
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter project name"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter project description"
                                rows={3}
                                disabled={isLoading}
                            />
                        </div>
                        
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creating...
                                    </div>
                                ) : (
                                    'Create Project'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateProjectModal
