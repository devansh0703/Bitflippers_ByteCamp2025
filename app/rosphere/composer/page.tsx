"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Layers, Plus, Download, Play, Settings, Trash2, Copy, Move } from "lucide-react"
import Link from "next/link"

interface Node {
  id: string
  type: string
  name: string
  package: string
  executable: string
  position: { x: number; y: number }
  parameters: Record<string, any>
  topics: { name: string; type: string; direction: "pub" | "sub" }[]
  qos?: {
    reliability: string
    durability: string
    history: string
  }
}

interface Connection {
  id: string
  from: string
  to: string
  topic: string
}

export default function LaunchComposer() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [draggedNode, setDraggedNode] = useState<Node | null>(null)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [generatedLaunch, setGeneratedLaunch] = useState("")
  const canvasRef = useRef<HTMLDivElement>(null)

  const nodeTemplates = [
    {
      type: "publisher",
      name: "Publisher Node",
      icon: "📤",
      defaultTopics: [{ name: "output_topic", type: "std_msgs/String", direction: "pub" as const }]
    },
    {
      type: "subscriber", 
      name: "Subscriber Node",
      icon: "📥",
      defaultTopics: [{ name: "input_topic", type: "std_msgs/String", direction: "sub" as const }]
    },
    {
      type: "transform",
      name: "Transform Node",
      icon: "🔄",
      defaultTopics: [
        { name: "input_topic", type: "geometry_msgs/Transform", direction: "sub" as const },
        { name: "output_topic", type: "geometry_msgs/Transform", direction: "pub" as const }
      ]
    },
    {
      type: "service",
      name: "Service Node",
      icon: "⚙️",
      defaultTopics: [{ name: "service", type: "std_srvs/SetBool", direction: "pub" as const }]
    },
    {
      type: "camera",
      name: "Camera Node",
      icon: "📷",
      defaultTopics: [
        { name: "image_raw", type: "sensor_msgs/Image", direction: "pub" as const },
        { name: "camera_info", type: "sensor_msgs/CameraInfo", direction: "pub" as const }
      ]
    },
    {
      type: "navigation",
      name: "Navigation Node",
      icon: "🧭",
      defaultTopics: [
        { name: "cmd_vel", type: "geometry_msgs/Twist", direction: "sub" as const },
        { name: "odom", type: "nav_msgs/Odometry", direction: "pub" as const }
      ]
    }
  ]

  const addNode = (template: typeof nodeTemplates[0]) => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: template.type,
      name: `${template.name}_${nodes.length + 1}`,
      package: "example_package",
      executable: `${template.type}_node`,
      position: { x: 100 + nodes.length * 50, y: 100 + nodes.length * 50 },
      parameters: {},
      topics: template.defaultTopics,
      qos: {
        reliability: "reliable",
        durability: "volatile", 
        history: "keep_last"
      }
    }
    setNodes([...nodes, newNode])
  }

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId))
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId))
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null)
    }
  }

  const updateNodePosition = (nodeId: string, position: { x: number; y: number }) => {
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, position } : node
    ))
  }

  const updateNodeProperty = (nodeId: string, property: string, value: any) => {
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, [property]: value } : node
    ))
  }

  const handleNodeDragStart = (e: React.DragEvent, node: Node) => {
    setDraggedNode(node)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setCanvasOffset({
        x: e.clientX - rect.left - node.position.x,
        y: e.clientY - rect.top - node.position.y
      })
    }
  }

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const newPosition = {
        x: e.clientX - rect.left - canvasOffset.x,
        y: e.clientY - rect.top - canvasOffset.y
      }
      updateNodePosition(draggedNode.id, newPosition)
      setDraggedNode(null)
    }
  }

  const generateLaunchFile = () => {
    const launchContent = `from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration

def generate_launch_description():
    return LaunchDescription([
${nodes.map(node => `        Node(
            package='${node.package}',
            executable='${node.executable}',
            name='${node.name}',
            parameters=[${Object.keys(node.parameters).length ? JSON.stringify(node.parameters) : ''}],
            remappings=[
${node.topics.map(topic => `                ('${topic.name}', '${topic.name}'),`).join('\n')}
            ]
        ),`).join('\n')}
    ])
`
    setGeneratedLaunch(launchContent)
  }

  const downloadLaunchFile = () => {
    const blob = new Blob([generatedLaunch], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'launch_file.launch.py'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/rosphere">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to ROSphere
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Layers className="h-6 w-6 text-purple-600" />
              <h1 className="text-3xl font-bold">Launch Composer</h1>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={generateLaunchFile} variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Generate Launch File
            </Button>
            {generatedLaunch && (
              <Button onClick={downloadLaunchFile}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
          {/* Node Palette */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Node Templates</CardTitle>
              <CardDescription>
                Drag nodes onto the canvas to build your launch configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {nodeTemplates.map((template) => (
                <div
                  key={template.type}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => addNode(template)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{template.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-muted-foreground">{template.type}</div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 text-xs text-muted-foreground">
                Click to add nodes to the canvas. Configure them in the properties panel.
              </div>
            </CardContent>
          </Card>

          {/* Canvas */}
          <div className="lg:col-span-2 relative">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Launch Canvas</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{nodes.length} nodes</Badge>
                    <Badge variant="outline">{connections.length} connections</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <div
                  ref={canvasRef}
                  className="relative w-full h-[580px] bg-muted/30 overflow-hidden"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleCanvasDrop}
                >
                  {/* Grid Background */}
                  <div 
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, #000 1px, transparent 1px),
                        linear-gradient(to bottom, #000 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px'
                    }}
                  />
                  
                  {/* Nodes */}
                  {nodes.map((node) => (
                    <div
                      key={node.id}
                      className={`absolute p-3 bg-background border-2 rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow ${
                        selectedNode?.id === node.id ? 'border-primary' : 'border-border'
                      }`}
                      style={{
                        left: node.position.x,
                        top: node.position.y,
                        minWidth: '150px'
                      }}
                      draggable
                      onDragStart={(e) => handleNodeDragStart(e, node)}
                      onClick={() => setSelectedNode(node)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {nodeTemplates.find(t => t.type === node.type)?.icon || '⚙️'}
                          </span>
                          <div className="text-sm font-medium">{node.name}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNode(node.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          {node.package}/{node.executable}
                        </div>
                        {node.topics.map((topic, index) => (
                          <div key={index} className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${
                              topic.direction === 'pub' ? 'bg-green-500' : 'bg-blue-500'
                            }`} />
                            <span className="text-xs">{topic.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Properties Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Properties</CardTitle>
              <CardDescription>
                {selectedNode ? `Configure ${selectedNode.name}` : 'Select a node to configure'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedNode ? (
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="topics">Topics</TabsTrigger>
                    <TabsTrigger value="qos">QoS</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="general" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Node Name</Label>
                      <Input
                        value={selectedNode.name}
                        onChange={(e) => updateNodeProperty(selectedNode.id, 'name', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Package</Label>
                      <Input
                        value={selectedNode.package}
                        onChange={(e) => updateNodeProperty(selectedNode.id, 'package', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Executable</Label>
                      <Input
                        value={selectedNode.executable}
                        onChange={(e) => updateNodeProperty(selectedNode.id, 'executable', e.target.value)}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="topics" className="space-y-4">
                    <div className="space-y-3">
                      {selectedNode.topics.map((topic, index) => (
                        <div key={index} className="p-3 border rounded">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={topic.direction === 'pub' ? 'default' : 'secondary'}>
                              {topic.direction === 'pub' ? 'Publisher' : 'Subscriber'}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <Input
                              placeholder="Topic name"
                              value={topic.name}
                              onChange={(e) => {
                                const newTopics = [...selectedNode.topics]
                                newTopics[index] = { ...topic, name: e.target.value }
                                updateNodeProperty(selectedNode.id, 'topics', newTopics)
                              }}
                            />
                            <Input
                              placeholder="Message type"
                              value={topic.type}
                              onChange={(e) => {
                                const newTopics = [...selectedNode.topics]
                                newTopics[index] = { ...topic, type: e.target.value }
                                updateNodeProperty(selectedNode.id, 'topics', newTopics)
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="qos" className="space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Reliability</Label>
                        <Select
                          value={selectedNode.qos?.reliability}
                          onValueChange={(value) => updateNodeProperty(selectedNode.id, 'qos', {
                            ...selectedNode.qos,
                            reliability: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="reliable">Reliable</SelectItem>
                            <SelectItem value="best_effort">Best Effort</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Durability</Label>
                        <Select
                          value={selectedNode.qos?.durability}
                          onValueChange={(value) => updateNodeProperty(selectedNode.id, 'qos', {
                            ...selectedNode.qos,
                            durability: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="volatile">Volatile</SelectItem>
                            <SelectItem value="transient_local">Transient Local</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>History</Label>
                        <Select
                          value={selectedNode.qos?.history}
                          onValueChange={(value) => updateNodeProperty(selectedNode.id, 'qos', {
                            ...selectedNode.qos,
                            history: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="keep_last">Keep Last</SelectItem>
                            <SelectItem value="keep_all">Keep All</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select a node from the canvas to configure its properties</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Generated Launch File */}
        {generatedLaunch && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Launch File</CardTitle>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(generatedLaunch)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button size="sm" onClick={downloadLaunchFile}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                <code>{generatedLaunch}</code>
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}