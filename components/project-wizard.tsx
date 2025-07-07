"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, FolderOpen, Settings, Code } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string
  ros2_distro: string
  workspace_path: string
  packages: string[]
  created_at: string
  status: string
}

export function ProjectWizard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ros2_distro: "humble",
    workspace_path: "",
    packages: [] as string[]
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    }
  }

  const createProject = async () => {
    if (!formData.name || !formData.workspace_path) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:8000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newProject = await response.json()
        setProjects([...projects, newProject])
        setFormData({
          name: "",
          description: "",
          ros2_distro: "humble", 
          workspace_path: "",
          packages: []
        })
        setShowCreateForm(false)
        toast({
          title: "Success",
          description: "Project created successfully!"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}`, {
        method: "DELETE"
      })
      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId))
        toast({
          title: "Success",
          description: "Project deleted successfully"
        })
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to delete project",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ROS 2 Project Wizard</h1>
          <p className="text-muted-foreground">
            Create and manage your ROS 2 workspaces with ease
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New ROS 2 Project</CardTitle>
            <CardDescription>
              Set up a new ROS 2 workspace with customizable packages and configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  placeholder="my_robot_project"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="distro">ROS 2 Distribution</Label>
                <Select
                  value={formData.ros2_distro}
                  onValueChange={(value) => setFormData({ ...formData, ros2_distro: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rolling">Rolling</SelectItem>
                    <SelectItem value="iron">Iron</SelectItem>
                    <SelectItem value="humble">Humble</SelectItem>
                    <SelectItem value="galactic">Galactic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your ROS 2 project..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workspace">Workspace Path *</Label>
              <Input
                id="workspace"
                placeholder="/home/user/ros2_ws"
                value={formData.workspace_path}
                onChange={(e) => setFormData({ ...formData, workspace_path: e.target.value })}
              />
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button 
                onClick={createProject} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Project
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <Badge variant={project.status === "active" ? "default" : "secondary"}>
                  {project.status}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                {project.description || "No description provided"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Settings className="h-4 w-4" />
                ROS 2 {project.ros2_distro}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FolderOpen className="h-4 w-4" />
                {project.workspace_path}
              </div>
              {project.packages.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Code className="h-4 w-4" />
                  {project.packages.length} packages
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1">
                  Open
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => deleteProject(project.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && !showCreateForm && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <FolderOpen className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No projects found</h3>
                <p className="text-muted-foreground">
                  Create your first ROS 2 project to get started
                </p>
              </div>
              <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}