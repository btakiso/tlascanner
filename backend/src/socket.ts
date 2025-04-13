import { Server, Socket } from 'socket.io';

/**
 * Set up socket.io event handlers
 * @param io Socket.io server instance
 */
/**
 * Get WebSocket server status information
 * @param io Socket.IO server instance
 * @returns Object containing server status information
 */
export function getSocketServerStatus(io: Server): any {
  const clientCount = io.engine.clientsCount;
  const rooms = Array.from(io.sockets.adapter.rooms.entries())
    .filter(([key]) => !key.includes('#'))
    .map(([key, value]) => ({ room: key, clients: value.size }));
  
  return {
    status: 'running',
    clientCount,
    rooms,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };
}

export function setupSocketHandlers(io: Server): void {
  console.log('Setting up WebSocket handlers');
  
  // Log all socket.io events for debugging
  io.engine.on('connection_error', (err) => {
    console.error('Socket.IO connection error:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      context: err.context,
      stack: err.stack
    });
  });
  
  // Monitor Socket.IO server events
  io.on('connect_error', (err) => {
    console.error('Socket.IO connect_error event:', err.message);
  });
  
  // Log adapter events if supported
  if (io.sockets && io.sockets.adapter && typeof io.sockets.adapter.on === 'function') {
    io.sockets.adapter.on('create-room', (room: string) => {
      console.log(`Room created: ${room}`);
    });
    
    io.sockets.adapter.on('delete-room', (room: string) => {
      console.log(`Room deleted: ${room}`);
    });
    
    io.sockets.adapter.on('join-room', (room: string, id: string) => {
      console.log(`Socket ${id} joined room ${room}`);
    });
    
    io.sockets.adapter.on('leave-room', (room: string, id: string) => {
      console.log(`Socket ${id} left room ${room}`);
    });
  } else {
    console.log('Socket.IO adapter events not supported in this version');
  }
  

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);
    console.log(`Client transport: ${socket.conn.transport.name}`);
    
    // Log detailed connection information
    const connectionInfo = {
      id: socket.id,
      transport: socket.conn.transport.name,
      address: socket.handshake.address,
      userAgent: socket.handshake.headers['user-agent'],
      query: socket.handshake.query,
      time: new Date().toISOString()
    };
    console.log('Client connection details:', connectionInfo);
    
    // Monitor for transport changes
    socket.conn.on('upgrade', (transport) => {
      console.log(`Client ${socket.id} transport upgraded from ${socket.conn.transport.name} to ${transport.name}`);
    });

    // Handle client subscribing to scan updates
    socket.on('subscribe', (data: { scanId: string }) => {
      console.log('Subscribe event received:', data);
      
      if (!data || !data.scanId) {
        console.log('Invalid subscribe data:', data);
        return socket.emit('error', { message: 'Invalid scan ID' });
      }

      console.log(`Client ${socket.id} subscribed to scan ${data.scanId}`);
      socket.join(data.scanId);
      
      // Get room information after joining
      const room = io.sockets.adapter.rooms.get(data.scanId);
      const numClients = room ? room.size : 0;
      console.log(`Room ${data.scanId} now has ${numClients} clients`);
      
      // Log rooms after joining
      const rooms = Array.from(socket.rooms.values());
      console.log(`Client ${socket.id} is now in rooms:`, rooms);
      
      // Confirm subscription to client with additional information
      socket.emit('subscribed', { 
        scanId: data.scanId,
        message: `Subscribed to updates for scan ${data.scanId}`,
        roomSize: numClients,
        timestamp: new Date().toISOString()
      });
      
      // Send a test message to verify the subscription works
      setTimeout(() => {
        socket.emit('subscription-test', {
          scanId: data.scanId,
          message: 'This is a test message to verify your subscription is working',
          timestamp: new Date().toISOString()
        });
      }, 1000);
    });

    // Handle client unsubscribing from scan updates
    socket.on('unsubscribe', (data: { scanId: string }) => {
      console.log('Unsubscribe event received:', data);
      
      if (!data || !data.scanId) {
        console.log('Invalid unsubscribe data:', data);
        return;
      }
      
      console.log(`Client ${socket.id} unsubscribed from scan ${data.scanId}`);
      socket.leave(data.scanId);
      
      // Confirm unsubscription to client
      socket.emit('unsubscribed', { scanId: data.scanId });
    });

    // Log all events for debugging
    socket.onAny((event, ...args) => {
      console.log(`Socket event '${event}' received:`, args);
    });

    // Add ping/pong for connection testing
    socket.on('ping', (callback) => {
      console.log(`Received ping from client ${socket.id}`);
      if (typeof callback === 'function') {
        callback({ time: new Date().toISOString(), status: 'ok' });
      } else {
        socket.emit('pong', { time: new Date().toISOString() });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log('Client disconnected:', socket.id, 'Reason:', reason);
      
      // Log all active rooms after disconnect
      const rooms = Array.from(io.sockets.adapter.rooms.entries())
        .filter(([key]) => !key.startsWith(socket.id))
        .map(([key, value]) => ({ room: key, clients: value.size }));
      
      console.log('Active rooms after disconnect:', rooms);
    });
    
    // Send a welcome message to confirm connection
    socket.emit('welcome', { 
      message: 'Connected to TLAScanner WebSocket server',
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
  });
}

/**
 * Send a scan update to all clients subscribed to a specific scan ID
 * @param io Socket.io server instance
 * @param scanId The scan ID to update
 * @param data The scan data to send
 */
/**
 * Emit a scan update to all clients subscribed to a specific scan
 * @param io Socket.IO server instance
 * @param scanId The ID of the scan to update
 * @param data The scan update data to emit
 */
export function emitScanUpdate(io: Server, scanId: string, data: any): void {
  try {
    console.log(`Emitting scan update for scan ${scanId}`);
    
    // Get number of clients in the room
    const room = io.sockets.adapter.rooms.get(scanId);
    const numClients = room ? room.size : 0;
    console.log(`Number of clients subscribed to scan ${scanId}: ${numClients}`);
    
    // If there are no clients, log but don't exit - clients might connect later
    if (numClients === 0) {
      console.log(`No clients currently subscribed to scan ${scanId}, but emitting anyway`);
    }
    
    // Add timestamp to the data
    const updateData = {
      scanId,
      timestamp: new Date().toISOString(),
      ...data
    };
    
    // Emit the update to all clients in the room
    io.to(scanId).emit('scanUpdate', updateData);
    
    // Log detailed information about the update
    console.log(`Scan update emitted for scan ${scanId}`, {
      numClients,
      status: data.status || 'unknown',
      timestamp: updateData.timestamp
    });
    
    // Also emit to admin room for monitoring if it exists
    if (io.sockets.adapter.rooms.get('admin')) {
      io.to('admin').emit('scan-monitoring', {
        event: 'update-emitted',
        scanId,
        numClients,
        timestamp: updateData.timestamp
      });
    }
  } catch (error) {
    console.error(`Error emitting scan update for scan ${scanId}:`, error);
  }
}
