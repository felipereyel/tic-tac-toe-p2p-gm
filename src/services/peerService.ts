import Peer, { type DataConnection } from 'peerjs'
import { ref, type Ref } from 'vue'
import type { Message } from '@/types'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface PeerServiceOptions {
  onConnection?: (conn: DataConnection) => void
  onDisconnection?: (conn: DataConnection) => void
  onMessage?: (conn: DataConnection, message: Message) => void
  onError?: (error: Error) => void
}

export function usePeerService() {
  const peer: Ref<Peer | null> = ref(null)
  const connections: Ref<Map<string, DataConnection>> = ref(new Map())
  const status: Ref<ConnectionStatus> = ref('disconnected')
  const error: Ref<string | null> = ref(null)

  let options: PeerServiceOptions = {}

  function configure(opts: PeerServiceOptions) {
    options = opts
  }

  function connect(peerId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      status.value = 'connecting'
      error.value = null

      peer.value = new Peer(peerId)

      peer.value.on('open', (id) => {
        console.log('Peer connected with ID:', id)
        status.value = 'connected'
        resolve()
      })

      peer.value.on('connection', (conn) => {
        console.log('Incoming connection from:', conn.peer)
        setupConnection(conn)
        options.onConnection?.(conn)
      })

      peer.value.on('error', (err) => {
        console.error('Peer error:', err)
        status.value = 'error'
        error.value = err.message
        options.onError?.(err)
        reject(err)
      })

      peer.value.on('disconnected', () => {
        console.log('Peer disconnected')
        status.value = 'disconnected'
      })
    })
  }

  function connectToPeer(remotePeerId: string): Promise<DataConnection> {
    return new Promise((resolve, reject) => {
      if (!peer.value) {
        reject(new Error('Not connected to peer server'))
        return
      }

      const conn = peer.value.connect(remotePeerId, { reliable: true })

      conn.on('open', () => {
        console.log('Connected to peer:', remotePeerId)
        setupConnection(conn)
        options.onConnection?.(conn)
        resolve(conn)
      })

      conn.on('error', (err) => {
        console.error('Connection error:', err)
        reject(err)
      })
    })
  }

  function setupConnection(conn: DataConnection) {
    connections.value.set(conn.peer, conn)

    conn.on('data', (data) => {
      try {
        const message = data as Message
        console.log('Received message from:', conn.peer, message)
        options.onMessage?.(conn, message)
      } catch (e) {
        console.error('Failed to parse message:', e)
      }
    })

    conn.on('close', () => {
      console.log('Connection closed:', conn.peer)
      connections.value.delete(conn.peer)
      options.onDisconnection?.(conn)
    })

    conn.on('error', (err) => {
      console.error('Connection error:', err)
      options.onError?.(err)
    })
  }

  function send(peerId: string, message: Message): boolean {
    const conn = connections.value.get(peerId)
    if (!conn) {
      console.error('No connection found for peer:', peerId)
      return false
    }

    try {
      conn.send(message)
      return true
    } catch (e) {
      console.error('Failed to send message:', e)
      return false
    }
  }

  function broadcast(message: Message) {
    connections.value.forEach((conn) => {
      try {
        conn.send(message)
      } catch (e) {
        console.error('Failed to broadcast to:', conn.peer, e)
      }
    })
  }

  function disconnect() {
    connections.value.forEach((conn) => {
      conn.close()
    })
    connections.value.clear()

    if (peer.value) {
      peer.value.destroy()
      peer.value = null
    }

    status.value = 'disconnected'
  }

  function getConnection(peerId: string): DataConnection | undefined {
    return connections.value.get(peerId)
  }

  return {
    peer,
    connections,
    status,
    error,
    configure,
    connect,
    connectToPeer,
    send,
    broadcast,
    disconnect,
    getConnection,
  }
}
