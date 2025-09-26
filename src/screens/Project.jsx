import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js';
import { getWebContainer, getWebContainerError, isWebContainerAvailable } from '../config/webContainer.js'
import WebContainerFallback from '../components/WebContainerFallback'


function SyntaxHighlightedCode(props) {
    const ref = useRef(null)

    React.useEffect(() => {
        if (ref.current && props.className?.includes('lang-') && window.hljs) {
            window.hljs.highlightElement(ref.current)

            // hljs won't reprocess the element unless this attribute is removed
            ref.current.removeAttribute('data-highlighted')
        }
    }, [ props.className, props.children ])

    return <code {...props} ref={ref} />
}


const Project = () => {

    const location = useLocation()

    const [ isSidePanelOpen, setIsSidePanelOpen ] = useState(false)
    const [ isModalOpen, setIsModalOpen ] = useState(false)
    const [ selectedUserId, setSelectedUserId ] = useState(new Set()) // Initialized as Set
    const [ project, setProject ] = useState(location.state.project)
    const [ message, setMessage ] = useState('')
    const { user } = useContext(UserContext)
    const messageBox = React.createRef()

    const [ users, setUsers ] = useState([])
    const [ messages, setMessages ] = useState([]) // New state variable for messages
    const [ fileTree, setFileTree ] = useState({})

    const [ currentFile, setCurrentFile ] = useState(null)
    const [ openFiles, setOpenFiles ] = useState([])

    const [ webContainer, setWebContainer ] = useState(null)
    const [ iframeUrl, setIframeUrl ] = useState(null)

    const [ runProcess, setRunProcess ] = useState(null)
    const [ isWebContainerLoading, setIsWebContainerLoading ] = useState(false)
    const [ isRunning, setIsRunning ] = useState(false)
    const [ webContainerError, setWebContainerError ] = useState(null)

    const handleUserClick = (id) => {
        setSelectedUserId(prevSelectedUserId => {
            const newSelectedUserId = new Set(prevSelectedUserId);
            if (newSelectedUserId.has(id)) {
                newSelectedUserId.delete(id);
            } else {
                newSelectedUserId.add(id);
            }

            return newSelectedUserId;
        });


    }


    function addCollaborators() {

        axios.put("/projects/add-user", {
            projectId: location.state.project._id,
            users: Array.from(selectedUserId)
        }).then(res => {
            console.log(res.data)
            setIsModalOpen(false)

        }).catch(err => {
            console.log(err)
        })

    }

    const send = () => {

        sendMessage('project-message', {
            message,
            sender: user
        })
        setMessages(prevMessages => [ ...prevMessages, { sender: user, message } ]) // Update messages state
        setMessage("")

    }

    function WriteAiMessage(message) {
        try {
            const messageObject = JSON.parse(message);
            
            return (
                <div className='overflow-auto bg-slate-950 text-white rounded-sm p-2'>
                    {messageObject.text && (
                        <Markdown
                            children={messageObject.text}
                            options={{
                                overrides: {
                                    code: SyntaxHighlightedCode,
                                },
                            }}
                        />
                    )}
                    {messageObject.fileTree && (
                        <div className='mt-2 p-2 bg-green-900 rounded'>
                            <p className='text-green-300 text-sm'>✅ File tree created and mounted!</p>
                        </div>
                    )}
                </div>
            );
        } catch (error) {
            // If it's not JSON, display as plain text
            return (
                <div className='overflow-auto bg-slate-950 text-white rounded-sm p-2'>
                    <p>{message}</p>
                </div>
            );
        }
    }

    useEffect(() => {

        initializeSocket(project._id)

        if (!webContainer && !webContainerError) {
            console.log("Initializing web container...");
            setIsWebContainerLoading(true);
            setWebContainerError(null);
            
            getWebContainer().then(container => {
                setWebContainer(container)
                setIsWebContainerLoading(false);
                setWebContainerError(null);
                console.log("✅ Web container initialized successfully");
            }).catch(error => {
                console.error("❌ Failed to initialize web container:", error);
                setIsWebContainerLoading(false);
                setWebContainerError(error.message);
                console.log("WebContainer error set:", error.message);
            })
        }


        receiveMessage('project-message', data => {

            console.log('Received message:', data)
            
            if (data.sender._id == 'ai') {
                try {
                    const message = JSON.parse(data.message);
                    console.log('Parsed AI message:', message);

                    // Update file tree if provided
                    if (message.fileTree) {
                        console.log('Updating file tree:', message.fileTree);
                        console.log('File tree keys:', Object.keys(message.fileTree));
                        console.log('Full AI message:', message);
                        setFileTree(message.fileTree);
                        
                        // Auto-open the first file
                        const firstFile = Object.keys(message.fileTree)[0];
                        if (firstFile) {
                            setCurrentFile(firstFile);
                            setOpenFiles([firstFile]);
                        }
                        
                        // Mount to web container if available
                        if (webContainer) {
                            webContainer.mount(message.fileTree).then(() => {
                                console.log('File tree mounted to web container');
                            }).catch(error => {
                                console.error('Error mounting file tree:', error);
                            });
                        }
                    } else {
                        console.log('No fileTree in AI response:', message);
                    }
                    
                    setMessages(prevMessages => [ ...prevMessages, data ]);
                } catch (parseError) {
                    console.error('Error parsing AI message:', parseError);
                    // If parsing fails, treat as plain text
                    setMessages(prevMessages => [ ...prevMessages, data ]);
                }
            } else {
                setMessages(prevMessages => [ ...prevMessages, data ]);
            }
        })


        axios.get(`/projects/get-project/${location.state.project._id}`).then(res => {

            console.log(res.data.project)

            setProject(res.data.project)
            setFileTree(res.data.project.fileTree || {})
        })

        axios.get('/users/all').then(res => {

            setUsers(res.data.users)

        }).catch(err => {

            console.log(err)

        })

    }, [])

    function saveFileTree(ft) {
        axios.put('/projects/update-file-tree', {
            projectId: project._id,
            fileTree: ft
        }).then(res => {
            console.log(res.data)
        }).catch(err => {
            console.log(err)
        })
    }


    // Removed appendIncomingMessage and appendOutgoingMessage functions

    function scrollToBottom() {
        messageBox.current.scrollTop = messageBox.current.scrollHeight
    }

    return (
        <main className='h-screen w-screen flex'>
            <section className="left relative flex flex-col h-screen min-w-96 bg-slate-300">
                <header className='flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute z-10 top-0'>
                    <button className='flex gap-2' onClick={() => setIsModalOpen(true)}>
                        <i className="ri-add-fill mr-1"></i>
                        <p>Add collaborator</p>
                    </button>
                    <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className='p-2'>
                        <i className="ri-group-fill"></i>
                    </button>
                </header>
                <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">

                    <div
                        ref={messageBox}
                        className="message-box p-1 flex-grow flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide">
                        {messages.map((msg, index) => (
                            <div key={index} className={`${msg.sender._id === 'ai' ? 'max-w-80' : 'max-w-52'} ${msg.sender._id == user._id.toString() && 'ml-auto'}  message flex flex-col p-2 bg-slate-50 w-fit rounded-md`}>
                                <small className='opacity-65 text-xs'>{msg.sender.email}</small>
                                <div className='text-sm'>
                                    {msg.sender._id === 'ai' ?
                                        WriteAiMessage(msg.message)
                                        : <p>{msg.message}</p>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="inputField w-full flex absolute bottom-0">
                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className='p-2 px-4 border-none outline-none flex-grow' type="text" placeholder='Enter message' />
                        <button
                            onClick={send}
                            className='px-5 bg-slate-950 text-white'><i className="ri-send-plane-fill"></i></button>
                    </div>
                </div>
                <div className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} top-0`}>
                    <header className='flex justify-between items-center px-4 p-2 bg-slate-200'>

                        <h1
                            className='font-semibold text-lg'
                        >Collaborators</h1>

                        <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className='p-2'>
                            <i className="ri-close-fill"></i>
                        </button>
                    </header>
                    <div className="users flex flex-col gap-2">

                        {project.users && project.users.map(user => {


                            return (
                                <div className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center">
                                    <div className='aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                                        <i className="ri-user-fill absolute"></i>
                                    </div>
                                    <h1 className='font-semibold text-lg'>{user.email}</h1>
                                </div>
                            )


                        })}
                    </div>
                </div>
            </section>

            <section className="right  bg-red-50 flex-grow h-full flex">

                <div className="explorer h-full max-w-64 min-w-52 bg-slate-200">
                    <div className="file-tree w-full">
                        {Object.keys(fileTree).length === 0 ? (
                            <div className="p-4 text-gray-500 text-sm">
                                {webContainerError ? (
                                    <div className="text-red-600">
                                        <div className="font-semibold mb-2">⚠️ WebContainer Error</div>
                                        <div className="text-xs mb-2">{webContainerError}</div>
                                        <div className="text-xs">
                                            <strong>Solutions:</strong><br/>
                                            • Use localhost for development<br/>
                                            • Ensure HTTPS with proper CORS headers<br/>
                                            • Try the retry button above
                                        </div>
                                    </div>
                                ) : (
                                    "No files yet. Ask AI to create a project!"
                                )}
                            </div>
                        ) : (
                            Object.keys(fileTree).map((file, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentFile(file)
                                        setOpenFiles([ ...new Set([ ...openFiles, file ]) ])
                                    }}
                                    className={`tree-element cursor-pointer p-2 px-4 flex items-center gap-2 w-full hover:bg-slate-300 ${
                                        currentFile === file ? 'bg-slate-400' : 'bg-slate-200'
                                    }`}>
                                    <i className={`ri-${file.includes('.') ? 'file-line' : 'folder-line'} text-sm`}></i>
                                    <p className='font-semibold text-sm truncate'>{file}</p>
                                </button>
                            ))
                        )}
                    </div>
                </div>


                <div className="code-editor flex flex-col flex-grow h-full shrink">

                    <div className="top flex justify-between w-full">

                        <div className="files flex">
                            {
                                openFiles.map((file, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentFile(file)}
                                        className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 border-r border-slate-400 ${
                                            currentFile === file ? 'bg-slate-400' : 'bg-slate-300 hover:bg-slate-350'
                                        }`}>
                                        <i className={`ri-${file.includes('.') ? 'file-line' : 'folder-line'} text-sm`}></i>
                                        <p className='font-semibold text-sm'>{file}</p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenFiles(openFiles.filter(f => f !== file));
                                                if (currentFile === file) {
                                                    const remainingFiles = openFiles.filter(f => f !== file);
                                                    setCurrentFile(remainingFiles.length > 0 ? remainingFiles[0] : null);
                                                }
                                            }}
                                            className="ml-2 text-gray-600 hover:text-gray-800"
                                        >
                                            <i className="ri-close-line text-sm"></i>
                                        </button>
                                    </button>
                                ))
                            }
                        </div>

                        <div className="actions flex gap-2">
                            {isWebContainerLoading && (
                                <div className='p-2 px-4 bg-blue-500 text-white rounded flex items-center gap-2'>
                                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                                    Initializing WebContainer...
                                </div>
                            )}
                            {webContainerError && !isWebContainerLoading && (
                                <WebContainerFallback 
                                    error={webContainerError}
                                    onRetry={() => {
                                        setWebContainerError(null);
                                        setWebContainer(null);
                                        setIsWebContainerLoading(true);
                                        getWebContainer().then(container => {
                                            setWebContainer(container);
                                            setIsWebContainerLoading(false);
                                            setWebContainerError(null);
                                        }).catch(error => {
                                            setIsWebContainerLoading(false);
                                            setWebContainerError(error.message);
                                        });
                                    }}
                                />
                            )}
                            {runProcess && (
                                <button
                                    onClick={() => {
                                        if (runProcess) {
                                            console.log('Stopping application...');
                                            runProcess.kill();
                                            setRunProcess(null);
                                            setIframeUrl(null);
                                            setIsRunning(false);
                                            console.log('Application stopped');
                                        }
                                    }}
                                    className='p-2 px-4 bg-red-500 text-white hover:bg-red-600 rounded'
                                >
                                    Stop
                                </button>
                            )}
                            <button
                                onClick={async () => {
                                    try {
                                        // Check if web container is available
                                        if (!webContainer) {
                                            if (isWebContainerLoading) {
                                                alert('Web container is still initializing. Please wait a moment and try again.');
                                            } else if (webContainerError) {
                                                alert(`WebContainer is not available due to an error: ${webContainerError}\n\nPlease try the retry button or check your browser settings.`);
                                            } else {
                                                alert('Web container is not ready yet. Please wait a moment and try again.');
                                            }
                                            return;
                                        }

                                        // Check if file tree is empty
                                        if (Object.keys(fileTree).length === 0) {
                                            alert('No files to run. Please ask AI to create a project first.');
                                            return;
                                        }

                                        // Set loading state
                                        setIsRunning(true);
                                        console.log('Starting run process...');
                                        console.log('File tree to mount:', fileTree);
                                        console.log('File tree keys:', Object.keys(fileTree));
                                        console.log('File tree structure:', JSON.stringify(fileTree, null, 2));

                                        // Kill any existing process
                                        if (runProcess) {
                                            console.log('Killing existing process...');
                                            runProcess.kill();
                                            setRunProcess(null);
                                        }

                                        // Mount the file tree
                                        console.log('Mounting file tree to web container...');
                                        console.log('File tree structure for mounting:', fileTree);
                                        
                                        // Validate file tree structure before mounting
                                        const hasNestedDirs = Object.keys(fileTree).some(file => file.includes('/'));
                                        if (hasNestedDirs) {
                                            console.warn('WARNING: Found nested directories in file tree:', Object.keys(fileTree).filter(file => file.includes('/')));
                                            console.warn('This may cause WebContainer mounting issues');
                                        }
                                        
                                        await webContainer.mount(fileTree);
                                        console.log('File tree mounted successfully');

                                        // Check if package.json exists
                                        if (!fileTree['package.json']) {
                                            console.log('No package.json found, creating a default one...');
                                            // Create a default package.json if it doesn't exist
                                            const defaultPackageJson = {
                                                "name": "generated-project",
                                                "version": "1.0.0",
                                                "main": "server.js",
                                                "scripts": {
                                                    "start": "node server.js"
                                                },
                                                "dependencies": {
                                                    "express": "^4.18.2"
                                                }
                                            };
                                            
                                            const updatedFileTree = {
                                                ...fileTree,
                                                'package.json': {
                                                    file: {
                                                        contents: JSON.stringify(defaultPackageJson, null, 2)
                                                    }
                                                }
                                            };
                                            
                                            console.log('Created default package.json, mounting updated file tree...');
                                            await webContainer.mount(updatedFileTree);
                                            setFileTree(updatedFileTree);
                                        }

                                        // Install dependencies
                                        console.log('Installing dependencies...');
                                        const installProcess = await webContainer.spawn("npm", ["install"]);

                                        // Handle install output with better error handling
                                        try {
                                            installProcess.output.pipeTo(new WritableStream({
                                                write(chunk) {
                                                    const text = new TextDecoder().decode(chunk);
                                                    console.log('Install:', text);
                                                }
                                            }));
                                        } catch (streamError) {
                                            console.warn('Stream handling warning:', streamError);
                                            // Continue execution even if stream handling fails
                                        }

                                        // Wait for install to complete
                                        const installExitCode = await installProcess.exit;
                                        console.log('Install process completed with code:', installExitCode);

                                        if (installExitCode !== 0) {
                                            alert('Failed to install dependencies. Check console for details.');
                                            setIsRunning(false);
                                            return;
                                        }

                                        // Start the application
                                        console.log('Starting application...');
                                        const startProcess = await webContainer.spawn("npm", ["start"]);

                                        // Handle start output with better error handling
                                        try {
                                            startProcess.output.pipeTo(new WritableStream({
                                                write(chunk) {
                                                    const text = new TextDecoder().decode(chunk);
                                                    console.log('Start:', text);
                                                }
                                            }));
                                        } catch (streamError) {
                                            console.warn('Start stream handling warning:', streamError);
                                            // Continue execution even if stream handling fails
                                        }

                                        setRunProcess(startProcess);
                                        setIsRunning(false);

                                        // Listen for server ready event
                                        webContainer.on('server-ready', (port, url) => {
                                            console.log('🚀 Server ready on port:', port, 'URL:', url);
                                            setIframeUrl(url);
                                        });

                                        // Also listen for process exit
                                        startProcess.exit.then((code) => {
                                            console.log('Application process exited with code:', code);
                                            setRunProcess(null);
                                            setIsRunning(false);
                                        });

                                        console.log('✅ Run process initiated successfully');

                                    } catch (error) {
                                        console.error('❌ Error running application:', error);
                                        
                                        // Reset loading states
                                        setIsRunning(false);
                                        
                                        // Provide more specific error messages
                                        let errorMessage = 'Error running application: ' + error.message;
                                        
                                        if (error.message.includes('EIO: invalid file name')) {
                                            errorMessage += '\n\nThis error is usually caused by nested directory structures in the file tree. The AI service has been updated to avoid this issue.';
                                        } else if (error.message.includes('mount')) {
                                            errorMessage += '\n\nWebContainer mounting failed. This might be due to file structure issues.';
                                        } else if (error.message.includes('spawn')) {
                                            errorMessage += '\n\nFailed to start the application process. Check if all dependencies are properly installed.';
                                        } else if (error.message.includes('ReadableStream')) {
                                            errorMessage += '\n\nStream handling error. This is usually temporary and the application should still work.';
                                        }
                                        
                                        alert(errorMessage + '\n\nCheck console for more details.');
                                    }
                                }}
                                className='p-2 px-4 bg-green-500 text-white hover:bg-green-600 rounded'
                                disabled={!webContainer || Object.keys(fileTree).length === 0 || isRunning || isWebContainerLoading || webContainerError}
                            >
                                {isWebContainerLoading ? 'Initializing...' : webContainerError ? 'WebContainer Error' : isRunning ? 'Starting...' : runProcess ? 'Running...' : 'Run'}
                            </button>


                        </div>
                    </div>
                    <div className="bottom flex flex-grow max-w-full shrink overflow-auto">
                        {
                            fileTree[ currentFile ] && (
                                <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50">
                                    <pre
                                        className="hljs h-full">
                                        <code
                                            className="hljs h-full outline-none"
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => {
                                                const updatedContent = e.target.innerText;
                                                const ft = {
                                                    ...fileTree,
                                                    [ currentFile ]: {
                                                        file: {
                                                            contents: updatedContent
                                                        }
                                                    }
                                                }
                                                setFileTree(ft)
                                                saveFileTree(ft)
                                            }}
                                            dangerouslySetInnerHTML={{ __html: hljs.highlight('javascript', fileTree[ currentFile ].file.contents).value }}
                                            style={{
                                                whiteSpace: 'pre-wrap',
                                                paddingBottom: '25rem',
                                                counterSet: 'line-numbering',
                                            }}
                                        />
                                    </pre>
                                </div>
                            )
                        }
                    </div>

                </div>

                {iframeUrl && webContainer &&
                    (<div className="flex min-w-96 flex-col h-full border-l border-gray-300">
                        <div className="address-bar bg-gray-100 p-2 border-b">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">🌐 Live Preview:</span>
                                <input type="text"
                                    onChange={(e) => setIframeUrl(e.target.value)}
                                    value={iframeUrl} 
                                    className="flex-1 p-1 px-2 bg-white border border-gray-300 rounded text-sm" />
                                <button 
                                    onClick={() => window.open(iframeUrl, '_blank')}
                                    className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                >
                                    Open
                                </button>
                            </div>
                        </div>
                        <iframe 
                            src={iframeUrl} 
                            className="w-full h-full border-0"
                            title="Live Preview"
                            onLoad={() => console.log('Iframe loaded:', iframeUrl)}
                            onError={(e) => console.error('Iframe error:', e)}
                        />
                    </div>)
                }


            </section>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-md w-96 max-w-full relative">
                        <header className='flex justify-between items-center mb-4'>
                            <h2 className='text-xl font-semibold'>Select User</h2>
                            <button onClick={() => setIsModalOpen(false)} className='p-2'>
                                <i className="ri-close-fill"></i>
                            </button>
                        </header>
                        <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
                            {users.map(user => (
                                <div key={user.id} className={`user cursor-pointer hover:bg-slate-200 ${Array.from(selectedUserId).indexOf(user._id) != -1 ? 'bg-slate-200' : ""} p-2 flex gap-2 items-center`} onClick={() => handleUserClick(user._id)}>
                                    <div className='aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                                        <i className="ri-user-fill absolute"></i>
                                    </div>
                                    <h1 className='font-semibold text-lg'>{user.email}</h1>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addCollaborators}
                            className='absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-md'>
                            Add Collaborators
                        </button>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Project