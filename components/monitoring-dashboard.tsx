"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { 
  Activity, 
  Cpu, 
  MemoryStick, 
  Network, 
  Circle,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle
} from "lucide-react"

interface Node {
  name: string
  namespace: string
  status: string
  cpu: number
  memory: number
}

interface Topic {
  name: string
  type: string
  publishers: number
  subscribers: number
  hz: number
}

interface SystemMetrics {
  cpu_usage: number
  memory_usage: number
  network_io: {
    rx: number
    tx: number
  }
}

interface MonitoringData {
  nodes: Node[]
  topics: Topic[]
  cpu_usage: number
  memory_usage: number
  network_io: {
    rx: number
    tx: number
  }
}

export function MonitoringDashboard() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu_usage: 0,
    memory_usage: 0,
    network_io: { rx: 0, tx: 0 }
  })
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [websocket, setWebsocket] = useState<WebSocket | null>(null)
  const { toast } = useToast()

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/monitor")
    
    ws.onopen = () => {
      setIsMonitoring(true)
      toast({
        title: "Connected",
        description: "Real-time monitoring started"
      })
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "monitoring_update") {
          const monitoringData: MonitoringData = data.data
          setNodes(monitoringData.nodes)
          setTopics(monitoringData.topics)
          setSystemMetrics({
            cpu_usage: monitoringData.cpu_usage,
            memory_usage: monitoringData.memory_usage,
            network_io: monitoringData.network_io
          })
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error)
      }
    }

    ws.onclose = () => {
      setIsMonitoring(false)
      toast({
        title: "Disconnected",
        description: "Real-time monitoring stopped",
        variant: "destructive"
      })
    }

    ws.onerror = () => {
      toast({
        title: "Connection Error",
        description: "Failed to connect to monitoring service",
        variant: "destructive"
      })
    }

    setWebsocket(ws)
  }, [toast])

  const disconnectWebSocket = useCallback(() => {
    if (websocket) {
      websocket.close()
      setWebsocket(null)
    }
  }, [websocket])

  const refreshData = async () => {
    try {
      const [nodesResponse, topicsResponse] = await Promise.all([
        fetch("http://localhost:8000/api/nodes"),
        fetch("http://localhost:8000/api/topics")
      ])

      if (nodesResponse.ok && topicsResponse.ok) {
        const nodesData = await nodesResponse.json()
        const topicsData = await topicsResponse.json()
        setNodes(nodesData)
        setTopics(topicsData)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    refreshData()
    return () => {
      if (websocket) {
        websocket.close()
      }
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500"
      case "inactive": return "bg-red-500"
      case "warning": return "bg-yellow-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active": return "default"
      case "inactive": return "destructive"
      case "warning": return "secondary"
      default: return "outline"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ROS 2 System Monitor</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of nodes, topics, and system performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {isMonitoring ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={disconnectWebSocket}
              className="flex items-center gap-2"
            >
              <Pause className="h-4 w-4" />
              Stop Monitoring
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={connectWebSocket}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start Monitoring
            </Button>
          )}
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.cpu_usage.toFixed(1)}%</div>
            <Progress value={systemMetrics.cpu_usage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.memory_usage.toFixed(1)}%</div>
            <Progress value={systemMetrics.memory_usage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div>RX: {systemMetrics.network_io.rx.toFixed(1)} MB/s</div>
              <div>TX: {systemMetrics.network_io.tx.toFixed(1)} MB/s</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="nodes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="nodes">Nodes ({nodes.length})</TabsTrigger>
          <TabsTrigger value="topics">Topics ({topics.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="nodes" className="space-y-4">
          <div className="grid gap-4">
            {nodes.map((node, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(node.status)}`} />
                      <div>
                        <CardTitle className="text-lg">{node.name}</CardTitle>
                        <CardDescription>{node.namespace}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(node.status)}>
                      {node.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      CPU: {node.cpu.toFixed(1)}%
                    </div>
                    <div className="flex items-center gap-2">
                      <MemoryStick className="h-4 w-4 text-muted-foreground" />
                      Memory: {node.memory.toFixed(1)} MB
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <div className="grid gap-4">
            {topics.map((topic, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{topic.name}</CardTitle>
                      <CardDescription>{topic.type}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{topic.hz.toFixed(1)} Hz</Badge>
                      {topic.publishers === 0 && topic.subscribers > 0 && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Circle className="h-3 w-3 fill-blue-500 text-blue-500" />
                      Publishers: {topic.publishers}
                    </div>
                    <div className="flex items-center gap-2">
                      <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                      Subscribers: {topic.subscribers}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {nodes.length === 0 && topics.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <Activity className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No ROS 2 system detected</h3>
                <p className="text-muted-foreground">
                  Start some ROS 2 nodes to begin monitoring
                </p>
              </div>
              <Button onClick={refreshData} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Scan for Nodes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}