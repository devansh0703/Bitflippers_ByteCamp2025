"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Code, Download, Copy, FileText, Zap } from "lucide-react"
import Link from "next/link"

interface CodeTemplate {
  id: string
  name: string
  description: string
  language: "cpp" | "python"
  type: string
  code: string
}

export default function CodeGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate | null>(null)
  const [generatedCode, setGeneratedCode] = useState("")
  const [nodeConfig, setNodeConfig] = useState({
    name: "example_node",
    package: "example_package",
    topicName: "example_topic",
    messageType: "std_msgs/String",
    serviceType: "std_srvs/SetBool",
    frequency: "10"
  })

  const templates: CodeTemplate[] = [
    {
      id: "cpp_publisher",
      name: "C++ Publisher Node",
      description: "Creates a publisher node that publishes messages at regular intervals",
      language: "cpp",
      type: "publisher",
      code: `#include <chrono>
#include <functional>
#include <memory>
#include <string>

#include "rclcpp/rclcpp.hpp"
#include "{{MESSAGE_TYPE}}.hpp"

using namespace std::chrono_literals;

class {{CLASS_NAME}} : public rclcpp::Node
{
  public:
    {{CLASS_NAME}}()
    : Node("{{NODE_NAME}}")
    {
      publisher_ = this->create_publisher<{{MESSAGE_TYPE}}>("{{TOPIC_NAME}}", 10);
      timer_ = this->create_wall_timer(
        {{TIMER_PERIOD}}ms, std::bind(&{{CLASS_NAME}}::timer_callback, this));
    }

  private:
    void timer_callback()
    {
      auto message = {{MESSAGE_TYPE}}();
      message.data = "Hello, world! " + std::to_string(count_++);
      RCLCPP_INFO(this->get_logger(), "Publishing: '%s'", message.data.c_str());
      publisher_->publish(message);
    }
    
    rclcpp::TimerBase::SharedPtr timer_;
    rclcpp::Publisher<{{MESSAGE_TYPE}}>::SharedPtr publisher_;
    size_t count_ = 0;
};

int main(int argc, char * argv[])
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<{{CLASS_NAME}}>());
  rclcpp::shutdown();
  return 0;
}`
    },
    {
      id: "cpp_subscriber",
      name: "C++ Subscriber Node",
      description: "Creates a subscriber node that receives and processes messages",
      language: "cpp",
      type: "subscriber",
      code: `#include <functional>
#include <memory>

#include "rclcpp/rclcpp.hpp"
#include "{{MESSAGE_TYPE}}.hpp"

using std::placeholders::_1;

class {{CLASS_NAME}} : public rclcpp::Node
{
  public:
    {{CLASS_NAME}}()
    : Node("{{NODE_NAME}}")
    {
      subscription_ = this->create_subscription<{{MESSAGE_TYPE}}>(
        "{{TOPIC_NAME}}", 10, std::bind(&{{CLASS_NAME}}::topic_callback, this, _1));
    }

  private:
    void topic_callback(const {{MESSAGE_TYPE}} & msg) const
    {
      RCLCPP_INFO(this->get_logger(), "I heard: '%s'", msg.data.c_str());
    }
    
    rclcpp::Subscription<{{MESSAGE_TYPE}}>::SharedPtr subscription_;
};

int main(int argc, char * argv[])
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<{{CLASS_NAME}}>());
  rclcpp::shutdown();
  return 0;
}`
    },
    {
      id: "python_publisher",
      name: "Python Publisher Node",
      description: "Creates a Python publisher node using rclpy",
      language: "python",
      type: "publisher",
      code: `#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from {{MESSAGE_IMPORT}} import {{MESSAGE_CLASS}}

class {{CLASS_NAME}}(Node):
    def __init__(self):
        super().__init__('{{NODE_NAME}}')
        self.publisher_ = self.create_publisher({{MESSAGE_CLASS}}, '{{TOPIC_NAME}}', 10)
        timer_period = {{TIMER_PERIOD}}  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = {{MESSAGE_CLASS}}()
        msg.data = f'Hello World: {self.i}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Publishing: "{msg.data}"')
        self.i += 1

def main(args=None):
    rclpy.init(args=args)
    node = {{CLASS_NAME}}()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
`
    },
    {
      id: "python_subscriber",
      name: "Python Subscriber Node",
      description: "Creates a Python subscriber node using rclpy",
      language: "python",
      type: "subscriber",
      code: `#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from {{MESSAGE_IMPORT}} import {{MESSAGE_CLASS}}

class {{CLASS_NAME}}(Node):
    def __init__(self):
        super().__init__('{{NODE_NAME}}')
        self.subscription = self.create_subscription(
            {{MESSAGE_CLASS}},
            '{{TOPIC_NAME}}',
            self.listener_callback,
            10)
        self.subscription  # prevent unused variable warning

    def listener_callback(self, msg):
        self.get_logger().info(f'I heard: "{msg.data}"')

def main(args=None):
    rclpy.init(args=args)
    node = {{CLASS_NAME}}()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
`
    },
    {
      id: "cpp_service_server",
      name: "C++ Service Server",
      description: "Creates a service server that handles service requests",
      language: "cpp",
      type: "service",
      code: `#include <memory>

#include "rclcpp/rclcpp.hpp"
#include "{{SERVICE_TYPE}}.hpp"

using {{SERVICE_TYPE}} = {{SERVICE_TYPE}};

class {{CLASS_NAME}} : public rclcpp::Node
{
public:
  {{CLASS_NAME}}()
  : Node("{{NODE_NAME}}")
  {
    service_ = this->create_service<{{SERVICE_TYPE}}>(
      "{{SERVICE_NAME}}", 
      std::bind(&{{CLASS_NAME}}::handle_service, this, std::placeholders::_1, std::placeholders::_2));
    
    RCLCPP_INFO(this->get_logger(), "Service server ready");
  }

private:
  void handle_service(const std::shared_ptr<{{SERVICE_TYPE}}::Request> request,
                     std::shared_ptr<{{SERVICE_TYPE}}::Response> response)
  {
    RCLCPP_INFO(this->get_logger(), "Incoming request: %s", request->data ? "true" : "false");
    response->success = true;
    response->message = "Service call processed successfully";
  }

  rclcpp::Service<{{SERVICE_TYPE}}>::SharedPtr service_;
};

int main(int argc, char * argv[])
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<{{CLASS_NAME}}>());
  rclcpp::shutdown();
  return 0;
}`
    },
    {
      id: "python_service_server",
      name: "Python Service Server",
      description: "Creates a Python service server using rclpy",
      language: "python",
      type: "service",
      code: `#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from {{SERVICE_IMPORT}} import {{SERVICE_CLASS}}

class {{CLASS_NAME}}(Node):
    def __init__(self):
        super().__init__('{{NODE_NAME}}')
        self.srv = self.create_service({{SERVICE_CLASS}}, '{{SERVICE_NAME}}', self.handle_service)
        self.get_logger().info('Service server ready')

    def handle_service(self, request, response):
        self.get_logger().info(f'Incoming request: {request.data}')
        response.success = True
        response.message = 'Service call processed successfully'
        return response

def main(args=None):
    rclpy.init(args=args)
    node = {{CLASS_NAME}}()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
`
    }
  ]

  const generateCode = (template: CodeTemplate) => {
    let code = template.code

    // Create class name from node name
    const className = nodeConfig.name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')

    // Message type processing
    const messageTypeParts = nodeConfig.messageType.split('/')
    const messageImport = messageTypeParts[0]
    const messageClass = messageTypeParts[1] || 'String'

    // Service type processing
    const serviceTypeParts = nodeConfig.serviceType.split('/')
    const serviceImport = serviceTypeParts[0]
    const serviceClass = serviceTypeParts[1] || 'SetBool'

    // Calculate timer period
    const frequency = parseInt(nodeConfig.frequency) || 10
    const timerPeriod = template.language === 'cpp' 
      ? Math.round(1000 / frequency).toString()  // milliseconds for C++
      : (1.0 / frequency).toFixed(2)              // seconds for Python

    // Replace placeholders
    const replacements = {
      '{{CLASS_NAME}}': className,
      '{{NODE_NAME}}': nodeConfig.name,
      '{{TOPIC_NAME}}': nodeConfig.topicName,
      '{{MESSAGE_TYPE}}': nodeConfig.messageType,
      '{{MESSAGE_IMPORT}}': messageImport,
      '{{MESSAGE_CLASS}}': messageClass,
      '{{SERVICE_TYPE}}': nodeConfig.serviceType,
      '{{SERVICE_IMPORT}}': serviceImport,
      '{{SERVICE_CLASS}}': serviceClass,
      '{{SERVICE_NAME}}': `${nodeConfig.name}_service`,
      '{{TIMER_PERIOD}}': timerPeriod,
      '{{PACKAGE_NAME}}': nodeConfig.package
    }

    Object.entries(replacements).forEach(([placeholder, value]) => {
      code = code.replace(new RegExp(placeholder, 'g'), value)
    })

    setGeneratedCode(code)
  }

  const downloadCode = () => {
    if (!selectedTemplate || !generatedCode) return
    
    const extension = selectedTemplate.language === 'cpp' ? 'cpp' : 'py'
    const filename = `${nodeConfig.name}.${extension}`
    
    const blob = new Blob([generatedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode)
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
              <Code className="h-6 w-6 text-green-600" />
              <h1 className="text-3xl font-bold">Code Generator</h1>
            </div>
          </div>
          <div className="flex space-x-2">
            {generatedCode && (
              <>
                <Button onClick={copyCode} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
                <Button onClick={downloadCode}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Code Templates</CardTitle>
              <CardDescription>
                Select a template to generate ROS 2 node code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedTemplate?.id === template.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">{template.name}</h3>
                    <div className="flex space-x-1">
                      <Badge variant="outline" className="text-xs">
                        {template.language}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {template.type}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration</CardTitle>
              <CardDescription>
                Customize the generated code parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Node Name</Label>
                <Input
                  value={nodeConfig.name}
                  onChange={(e) => setNodeConfig({...nodeConfig, name: e.target.value})}
                  placeholder="my_node"
                />
              </div>

              <div className="space-y-2">
                <Label>Package Name</Label>
                <Input
                  value={nodeConfig.package}
                  onChange={(e) => setNodeConfig({...nodeConfig, package: e.target.value})}
                  placeholder="my_package"
                />
              </div>

              {selectedTemplate?.type === 'publisher' || selectedTemplate?.type === 'subscriber' ? (
                <>
                  <div className="space-y-2">
                    <Label>Topic Name</Label>
                    <Input
                      value={nodeConfig.topicName}
                      onChange={(e) => setNodeConfig({...nodeConfig, topicName: e.target.value})}
                      placeholder="my_topic"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Message Type</Label>
                    <Select
                      value={nodeConfig.messageType}
                      onValueChange={(value) => setNodeConfig({...nodeConfig, messageType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="std_msgs/String">std_msgs/String</SelectItem>
                        <SelectItem value="std_msgs/Int32">std_msgs/Int32</SelectItem>
                        <SelectItem value="std_msgs/Float64">std_msgs/Float64</SelectItem>
                        <SelectItem value="geometry_msgs/Twist">geometry_msgs/Twist</SelectItem>
                        <SelectItem value="sensor_msgs/Image">sensor_msgs/Image</SelectItem>
                        <SelectItem value="nav_msgs/Odometry">nav_msgs/Odometry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTemplate?.type === 'publisher' && (
                    <div className="space-y-2">
                      <Label>Publishing Frequency (Hz)</Label>
                      <Input
                        type="number"
                        value={nodeConfig.frequency}
                        onChange={(e) => setNodeConfig({...nodeConfig, frequency: e.target.value})}
                        placeholder="10"
                        min="1"
                        max="1000"
                      />
                    </div>
                  )}
                </>
              ) : selectedTemplate?.type === 'service' ? (
                <div className="space-y-2">
                  <Label>Service Type</Label>
                  <Select
                    value={nodeConfig.serviceType}
                    onValueChange={(value) => setNodeConfig({...nodeConfig, serviceType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="std_srvs/SetBool">std_srvs/SetBool</SelectItem>
                      <SelectItem value="std_srvs/Empty">std_srvs/Empty</SelectItem>
                      <SelectItem value="std_srvs/Trigger">std_srvs/Trigger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              <Button 
                onClick={() => selectedTemplate && generateCode(selectedTemplate)}
                disabled={!selectedTemplate}
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                Generate Code
              </Button>
            </CardContent>
          </Card>

          {/* Generated Code */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Generated Code</CardTitle>
                {generatedCode && (
                  <div className="flex space-x-2">
                    <Badge variant="outline">
                      {selectedTemplate?.language}
                    </Badge>
                    <Badge variant="secondary">
                      {generatedCode.split('\n').length} lines
                    </Badge>
                  </div>
                )}
              </div>
              <CardDescription>
                {selectedTemplate 
                  ? `Preview of ${selectedTemplate.name}` 
                  : 'Select a template and configure to generate code'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedCode ? (
                <div className="relative">
                  <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-[500px]">
                    <code>{generatedCode}</code>
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-center">
                    Select a template and click "Generate Code" to see the output here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Code Templates Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Available Templates</CardTitle>
            <CardDescription>
              Overview of all available code generation templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{template.name}</h3>
                    <div className="flex space-x-1">
                      <Badge variant="outline" className="text-xs">
                        {template.language}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {template.type}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.description}
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setSelectedTemplate(template)}
                    className="w-full"
                  >
                    Select Template
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}