"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText, ExternalLink, BookOpen, Terminal, Download } from "lucide-react"
import Link from "next/link"

export default function ROSphereDocumentation() {
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
            <FileText className="h-6 w-6 text-orange-600" />
            <h1 className="text-3xl font-bold">Documentation</h1>
          </div>
        </div>

        {/* Quick Start Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Quick Start Guide</span>
            </CardTitle>
            <CardDescription>
              Get up and running with ROSphere in minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="installation" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="installation">Installation</TabsTrigger>
                <TabsTrigger value="setup">Setup</TabsTrigger>
                <TabsTrigger value="tutorial">Tutorial</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
              </TabsList>
              
              <TabsContent value="installation" className="space-y-4">
                <h3 className="text-lg font-semibold">Prerequisites</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">System Requirements</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Ubuntu 20.04+ or equivalent Linux distribution</li>
                      <li>ROS 2 Humble, Iron, or Jazzy installed</li>
                      <li>Python 3.8+ and Node.js 16+</li>
                      <li>Docker (optional, for containerized development)</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium mb-2">ROS 2 Installation</h4>
                    <pre className="text-sm bg-blue-100 p-2 rounded overflow-x-auto">
{`# Install ROS 2 Humble (Ubuntu 22.04)
sudo apt update && sudo apt install locales
sudo locale-gen en_US en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LANG=en_US.UTF-8

sudo apt install software-properties-common
sudo add-apt-repository universe

sudo apt update && sudo apt install curl -y
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg

echo "deb [arch=\$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu \$(. /etc/os-release && echo \$UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null

sudo apt update
sudo apt upgrade
sudo apt install ros-humble-desktop`}
                    </pre>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="setup" className="space-y-4">
                <h3 className="text-lg font-semibold">ROSphere Setup</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">1. Clone and Install</h4>
                    <pre className="text-sm bg-background p-2 rounded border overflow-x-auto">
{`# Clone the repository
git clone https://github.com/your-org/rosphere.git
cd rosphere

# Install frontend dependencies
npm install

# Install backend dependencies
pip install -r requirements.txt

# Set up environment
source /opt/ros/humble/setup.bash
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc`}
                    </pre>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">2. Start ROSphere</h4>
                    <pre className="text-sm bg-background p-2 rounded border overflow-x-auto">
{`# Start the backend API (Terminal 1)
python main.py

# Start the frontend development server (Terminal 2)
npm run dev

# Access ROSphere at http://localhost:3000`}
                    </pre>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium mb-2">✅ Verification</h4>
                    <p className="text-sm text-green-700">
                      Navigate to http://localhost:3000/rosphere to access the ROSphere dashboard. 
                      You should see the Project Wizard, Launch Composer, and Code Generator tools.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="tutorial" className="space-y-4">
                <h3 className="text-lg font-semibold">First Project Tutorial</h3>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Step 1: Create a Workspace</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Go to the Project Wizard</li>
                      <li>Enter workspace name: <code className="bg-muted px-1">my_robot_ws</code></li>
                      <li>Set path: <code className="bg-muted px-1">/home/user/my_robot_ws</code></li>
                      <li>Select ROS distribution: <Badge variant="outline">Humble</Badge></li>
                      <li>Click "Next: Package Setup"</li>
                    </ol>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Step 2: Configure Package</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Package name: <code className="bg-muted px-1">hello_robot</code></li>
                      <li>Maintainer: Your name</li>
                      <li>Email: Your email</li>
                      <li>Language: <Badge variant="outline">C++</Badge></li>
                      <li>Select node types: Publisher, Subscriber</li>
                      <li>Click "Generate Project"</li>
                    </ol>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Step 3: Build and Run</h4>
                    <pre className="text-sm bg-background p-2 rounded border overflow-x-auto">
{`cd /home/user/my_robot_ws
source /opt/ros/humble/setup.bash
colcon build
source install/setup.bash

# Run the nodes
ros2 run hello_robot publisher_node
ros2 run hello_robot subscriber_node`}
                    </pre>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="examples" className="space-y-4">
                <h3 className="text-lg font-semibold">Example Projects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Simple Publisher/Subscriber</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Basic communication between two nodes using string messages.
                      </p>
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/rosphere/wizard">
                          <Download className="h-4 w-4 mr-2" />
                          Create Project
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Camera Processing Pipeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Image capture, processing, and visualization nodes.
                      </p>
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/rosphere/composer">
                          <Terminal className="h-4 w-4 mr-2" />
                          Design Launch
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Robot Navigation Stack</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Complete navigation setup with mapping and localization.
                      </p>
                      <Button size="sm" variant="outline" disabled>
                        Coming Soon
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Multi-Robot Coordination</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Coordinated behavior between multiple robot instances.
                      </p>
                      <Button size="sm" variant="outline" disabled>
                        Coming Soon
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* API Reference */}
        <Card>
          <CardHeader>
            <CardTitle>API Reference</CardTitle>
            <CardDescription>
              Backend API endpoints for programmatic access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="default">POST</Badge>
                  <code className="text-sm">/rosphere/generate-project</code>
                </div>
                <p className="text-sm text-muted-foreground">
                  Generate a complete ROS 2 project with workspace and package configuration.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary">GET</Badge>
                  <code className="text-sm">/rosphere/templates</code>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get available node templates, languages, and configuration options.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
            <CardDescription>
              Common issues and solutions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">❌ "ROS 2 not found" error</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Make sure ROS 2 is properly sourced in your environment.
                </p>
                <pre className="text-sm bg-muted p-2 rounded">
                  source /opt/ros/humble/setup.bash
                </pre>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">❌ Build fails with "package not found"</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Install missing dependencies or check package.xml configuration.
                </p>
                <pre className="text-sm bg-muted p-2 rounded">
                  rosdep install --from-paths src --ignore-src -r -y
                </pre>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">❌ Frontend build errors</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Clear node_modules and reinstall dependencies.
                </p>
                <pre className="text-sm bg-muted p-2 rounded">
{`rm -rf node_modules package-lock.json
npm install --force`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* External Resources */}
        <Card>
          <CardHeader>
            <CardTitle>External Resources</CardTitle>
            <CardDescription>
              Helpful links and additional documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">ROS 2 Documentation</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://docs.ros.org/en/humble/" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      ROS 2 Humble Docs
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://github.com/ros2/examples" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      ROS 2 Examples
                    </a>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Community</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://discourse.ros.org" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      ROS Discourse
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://github.com/your-org/rosphere/issues" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Report Issues
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}