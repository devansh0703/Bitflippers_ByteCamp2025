"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Terminal, Download, Copy, Command, Package, Rocket } from "lucide-react"
import Link from "next/link"

export default function CLITools() {
  const commands = [
    {
      name: "rosphere",
      description: "Main CLI tool for ROSphere operations",
      usage: "rosphere [command] [options]",
      examples: [
        "rosphere create workspace my_ws",
        "rosphere create package my_pkg --lang cpp",
        "rosphere generate node publisher --topic /cmd_vel"
      ]
    },
    {
      name: "rosphere-wizard",
      description: "Interactive project creation wizard",
      usage: "rosphere-wizard [--non-interactive]",
      examples: [
        "rosphere-wizard",
        "rosphere-wizard --config workspace.yaml"
      ]
    },
    {
      name: "rosphere-compose",
      description: "Launch file generation and composition",
      usage: "rosphere-compose [file] [options]",
      examples: [
        "rosphere-compose generate --nodes node1,node2",
        "rosphere-compose validate launch.py"
      ]
    }
  ]

  const copyCommand = (command: string) => {
    navigator.clipboard.writeText(command)
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/rosphere">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to ROSphere
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <Terminal className="h-6 w-6 text-gray-600" />
            <h1 className="text-3xl font-bold">CLI Tools</h1>
          </div>
        </div>

        {/* Installation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Installation</span>
            </CardTitle>
            <CardDescription>
              Install ROSphere CLI tools for command-line project generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="pip" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pip">pip</TabsTrigger>
                <TabsTrigger value="docker">Docker</TabsTrigger>
                <TabsTrigger value="source">From Source</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pip" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Install via pip</h4>
                  <div className="flex items-center space-x-2">
                    <pre className="flex-1 text-sm bg-background p-2 rounded border">
                      pip install rosphere-cli
                    </pre>
                    <Button size="sm" variant="outline" onClick={() => copyCommand("pip install rosphere-cli")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium mb-2">Verify Installation</h4>
                  <div className="flex items-center space-x-2">
                    <pre className="flex-1 text-sm bg-blue-100 p-2 rounded">
                      rosphere --version
                    </pre>
                    <Button size="sm" variant="outline" onClick={() => copyCommand("rosphere --version")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="docker" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Run with Docker</h4>
                  <div className="flex items-center space-x-2">
                    <pre className="flex-1 text-sm bg-background p-2 rounded border">
                      docker run -it rosphere/cli:latest rosphere --help
                    </pre>
                    <Button size="sm" variant="outline" onClick={() => copyCommand("docker run -it rosphere/cli:latest rosphere --help")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium mb-2">Create alias for convenience</h4>
                  <div className="flex items-center space-x-2">
                    <pre className="flex-1 text-sm bg-blue-100 p-2 rounded">
                      alias rosphere='docker run -it -v $(pwd):/workspace rosphere/cli:latest rosphere'
                    </pre>
                    <Button size="sm" variant="outline" onClick={() => copyCommand("alias rosphere='docker run -it -v $(pwd):/workspace rosphere/cli:latest rosphere'")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="source" className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Build from Source</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <pre className="flex-1 text-sm bg-background p-2 rounded border">
                        git clone https://github.com/your-org/rosphere-cli.git
                      </pre>
                      <Button size="sm" variant="outline" onClick={() => copyCommand("git clone https://github.com/your-org/rosphere-cli.git")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <pre className="flex-1 text-sm bg-background p-2 rounded border">
                        cd rosphere-cli && pip install -e .
                      </pre>
                      <Button size="sm" variant="outline" onClick={() => copyCommand("cd rosphere-cli && pip install -e .")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Command Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Command className="h-5 w-5" />
              <span>Command Reference</span>
            </CardTitle>
            <CardDescription>
              Complete reference for all available CLI commands
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {commands.map((cmd, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Badge variant="default">{cmd.name}</Badge>
                  <span className="text-sm text-muted-foreground">{cmd.description}</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Usage:</h4>
                    <pre className="text-sm bg-muted p-2 rounded">{cmd.usage}</pre>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Examples:</h4>
                    <div className="space-y-2">
                      {cmd.examples.map((example, exIndex) => (
                        <div key={exIndex} className="flex items-center space-x-2">
                          <pre className="flex-1 text-sm bg-background p-2 rounded border">{example}</pre>
                          <Button size="sm" variant="outline" onClick={() => copyCommand(example)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Start Commands */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Rocket className="h-5 w-5" />
              <span>Quick Start Commands</span>
            </CardTitle>
            <CardDescription>
              Common command sequences to get started quickly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Create a Simple Publisher/Subscriber Project</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <pre className="flex-1 text-xs bg-background p-2 rounded border">
                      rosphere create workspace my_ws --path ~/ros2_ws
                    </pre>
                    <Button size="sm" variant="outline" onClick={() => copyCommand("rosphere create workspace my_ws --path ~/ros2_ws")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <pre className="flex-1 text-xs bg-background p-2 rounded border">
                      cd ~/ros2_ws && rosphere create package hello_world --lang cpp
                    </pre>
                    <Button size="sm" variant="outline" onClick={() => copyCommand("cd ~/ros2_ws && rosphere create package hello_world --lang cpp")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <pre className="flex-1 text-xs bg-background p-2 rounded border">
                      rosphere generate node publisher --topic /hello --package hello_world
                    </pre>
                    <Button size="sm" variant="outline" onClick={() => copyCommand("rosphere generate node publisher --topic /hello --package hello_world")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <pre className="flex-1 text-xs bg-background p-2 rounded border">
                      colcon build && source install/setup.bash
                    </pre>
                    <Button size="sm" variant="outline" onClick={() => copyCommand("colcon build && source install/setup.bash")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Generate Launch File for Multiple Nodes</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <pre className="flex-1 text-xs bg-background p-2 rounded border">
                      rosphere-compose create --name robot_bringup
                    </pre>
                    <Button size="sm" variant="outline" onClick={() => copyCommand("rosphere-compose create --name robot_bringup")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <pre className="flex-1 text-xs bg-background p-2 rounded border">
                      rosphere-compose add-node camera_node --package camera_pkg
                    </pre>
                    <Button size="sm" variant="outline" onClick={() => copyCommand("rosphere-compose add-node camera_node --package camera_pkg")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <pre className="flex-1 text-xs bg-background p-2 rounded border">
                      rosphere-compose add-node processing_node --package vision_pkg
                    </pre>
                    <Button size="sm" variant="outline" onClick={() => copyCommand("rosphere-compose add-node processing_node --package vision_pkg")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <pre className="flex-1 text-xs bg-background p-2 rounded border">
                      rosphere-compose generate robot_bringup.launch.py
                    </pre>
                    <Button size="sm" variant="outline" onClick={() => copyCommand("rosphere-compose generate robot_bringup.launch.py")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Configuration</span>
            </CardTitle>
            <CardDescription>
              Configure CLI tools for your development environment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Global Configuration</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Set up default values for common options to speed up project creation.
              </p>
              <div className="flex items-center space-x-2">
                <pre className="flex-1 text-sm bg-background p-2 rounded border">
                  rosphere config set default.author "Your Name"
                </pre>
                <Button size="sm" variant="outline" onClick={() => copyCommand('rosphere config set default.author "Your Name"')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Project Templates</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Create custom project templates for your organization.
              </p>
              <div className="flex items-center space-x-2">
                <pre className="flex-1 text-sm bg-background p-2 rounded border">
                  rosphere template create --name company-robot --from ./template.yaml
                </pre>
                <Button size="sm" variant="outline" onClick={() => copyCommand("rosphere template create --name company-robot --from ./template.yaml")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium mb-2">📄 Configuration File</h4>
              <p className="text-sm text-green-700 mb-2">
                CLI tools use <code>~/.rosphere/config.yaml</code> for storing preferences.
              </p>
              <pre className="text-xs bg-green-100 p-2 rounded overflow-x-auto">
{`default:
  author: "Your Name"
  email: "your.email@example.com"
  license: "MIT"
  ros_distro: "humble"
  
templates:
  - name: "company-robot"
    path: "~/.rosphere/templates/company-robot.yaml"
    
workspace:
  default_path: "~/ros2_ws"
  build_tool: "colcon"`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Integration */}
        <Card>
          <CardHeader>
            <CardTitle>CI/CD Integration</CardTitle>
            <CardDescription>
              Use ROSphere CLI in your automated workflows
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">GitHub Actions Example</h4>
              <pre className="text-sm bg-muted p-3 rounded overflow-x-auto">
{`name: Generate ROS 2 Project
on:
  workflow_dispatch:
    inputs:
      project_name:
        description: 'Project name'
        required: true

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install ROSphere CLI
        run: pip install rosphere-cli
      - name: Generate project
        run: |
          rosphere create workspace \${{ github.event.inputs.project_name }}
          rosphere create package \${{ github.event.inputs.project_name }}_pkg
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: generated-project
          path: ./\${{ github.event.inputs.project_name }}/`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}