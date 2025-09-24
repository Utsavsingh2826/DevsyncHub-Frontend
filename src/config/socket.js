import socket from 'socket.io-client';


let socketInstance = null;


export const initializeSocket = (projectId) => {
    const token = localStorage.getItem('token');
    console.log('Initializing socket with:', {
        url: import.meta.env.VITE_API_URL || 'http://localhost:3000',
        projectId,
        hasToken: !!token
    });

    socketInstance = socket(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
        auth: {
            token: token
        },
        query: {
            projectId
        }
    });

    socketInstance.on('connect', () => {
        console.log('Socket connected successfully');
    });

    socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
    });

    return socketInstance;
}

export const receiveMessage = (eventName, cb) => {
    socketInstance.on(eventName, cb);
}

export const sendMessage = (eventName, data) => {
    socketInstance.emit(eventName, data);
}