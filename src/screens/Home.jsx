import React, { useContext, useState, useEffect, lazy, Suspense } from 'react'
import { UserContext } from '../context/user.context'
import axios from "../config/axios"
import { useNavigate } from 'react-router-dom'

// Lazy load heavy components
const ProjectCard = lazy(() => import('../components/ProjectCard'))
const CreateProjectModal = lazy(() => import('../components/CreateProjectModal'))

const Home = () => {

    const { user } = useContext(UserContext)
    const [ isModalOpen, setIsModalOpen ] = useState(false)
    const [ projects, setProjects ] = useState([])
    const [ isLoading, setIsLoading ] = useState(true)
    const [ searchTerm, setSearchTerm ] = useState('')
    const [ sortBy, setSortBy ] = useState('recent')

    const navigate = useNavigate()

    const fetchProjects = () => {
        setIsLoading(true)
        axios.get('/projects/all', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then((res) => {
            setProjects(res.data.projects)
            setIsLoading(false)
        })
        .catch((err) => {
            console.log(err)
            setIsLoading(false)
        })
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    const filteredProjects = projects.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const sortedProjects = [...filteredProjects].sort((a, b) => {
        switch(sortBy) {
            case 'name':
                return a.name.localeCompare(b.name)
            case 'recent':
                return new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt)
            case 'collaborators':
                return b.users.length - a.users.length
            default:
                return 0
        }
    })

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <h1 className="text-2xl font-bold text-gray-900">DevSync Hub</h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                        {user?.email?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-700">{user?.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
                    <p className="text-gray-600">Manage your projects and collaborate with your team.</p>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i className="ri-search-line text-gray-400"></i>
                            </div>
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="recent">Recent</option>
                            <option value="name">Name</option>
                            <option value="collaborators">Collaborators</option>
                        </select>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            <i className="ri-add-line mr-2"></i>
                            New Project
                        </button>
                    </div>
                </div>

                {/* Projects Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading projects...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <Suspense fallback={
                            <div className="col-span-full flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-2 text-gray-600">Loading project cards...</span>
                            </div>
                        }>
                            {sortedProjects.map((project) => (
                                <ProjectCard key={project._id} project={project} />
                            ))}
                        </Suspense>

                        {sortedProjects.length === 0 && !isLoading && (
                            <div className="col-span-full flex flex-col items-center justify-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <i className="ri-folder-open-line text-2xl text-gray-400"></i>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                                <p className="text-gray-500 text-center mb-4">
                                    {searchTerm ? 'No projects match your search.' : 'Get started by creating your first project.'}
                                </p>
                                {!searchTerm && (
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        <i className="ri-add-line mr-2"></i>
                                        Create Project
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Create Project Modal */}
            <Suspense fallback={
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-center mt-2 text-gray-600">Loading modal...</p>
                    </div>
                </div>
            }>
                <CreateProjectModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onProjectCreated={fetchProjects}
                />
            </Suspense>
        </div>
    )
}

export default Home