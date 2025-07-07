from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import asyncio
import uuid
import os
from datetime import datetime

app = FastAPI(title="ROSphere API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo purposes
projects = []
active_connections: List[WebSocket] = []
ros2_nodes = []
ros2_topics = []

# Pydantic models
class ProjectRequest(BaseModel):
    name: str
    description: str
    ros2_distro: str = "humble"
    workspace_path: str
    packages: List[str] = []

class Project(BaseModel):
    id: str
    name: str
    description: str
    ros2_distro: str
    workspace_path: str
    packages: List[str]
    created_at: datetime
    status: str = "active"

class LaunchFileRequest(BaseModel):
    project_id: str
    name: str
    nodes: List[Dict[str, Any]]
    parameters: Dict[str, Any] = {}

class CodeGenerationRequest(BaseModel):
    template_type: str  # "publisher", "subscriber", "service", "action"
    node_name: str
    topic_name: Optional[str] = None
    message_type: Optional[str] = None
    language: str = "python"  # "python" or "cpp"

class MonitoringData(BaseModel):
    timestamp: datetime
    nodes: List[Dict[str, Any]]
    topics: List[Dict[str, Any]]
    cpu_usage: float
    memory_usage: float

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

# API Endpoints
@app.get("/")
async def root():
    return {"message": "ROSphere API v1.0.0", "status": "running"}

@app.get("/api/projects", response_model=List[Project])
async def get_projects():
    return projects

@app.post("/api/projects", response_model=Project)
async def create_project(project_request: ProjectRequest):
    project = Project(
        id=str(uuid.uuid4()),
        name=project_request.name,
        description=project_request.description,
        ros2_distro=project_request.ros2_distro,
        workspace_path=project_request.workspace_path,
        packages=project_request.packages,
        created_at=datetime.now()
    )
    projects.append(project)
    
    # Broadcast project creation to connected clients
    await manager.broadcast(json.dumps({
        "type": "project_created",
        "data": project.dict()
    }))
    
    return project

@app.get("/api/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    project = next((p for p in projects if p.id == project_id), None)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str):
    global projects
    projects = [p for p in projects if p.id != project_id]
    return {"message": "Project deleted successfully"}

@app.post("/api/projects/{project_id}/launch")
async def create_launch_file(project_id: str, launch_request: LaunchFileRequest):
    project = next((p for p in projects if p.id == project_id), None)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Generate launch file content
    launch_content = generate_launch_file(launch_request)
    
    return {
        "message": "Launch file created successfully",
        "content": launch_content,
        "file_path": f"{project.workspace_path}/src/launch/{launch_request.name}.launch.py"
    }

@app.post("/api/generate/code")
async def generate_code(request: CodeGenerationRequest):
    template_content = generate_code_template(request)
    return {
        "message": "Code generated successfully",
        "content": template_content,
        "file_path": f"src/{request.node_name}.{get_file_extension(request.language)}"
    }

@app.get("/api/nodes")
async def get_ros2_nodes():
    # Mock ROS 2 node data - in real implementation, this would query ROS 2
    return [
        {"name": "/teleop_node", "namespace": "/", "status": "active", "cpu": 2.1, "memory": 45.2},
        {"name": "/camera_driver", "namespace": "/sensors", "status": "active", "cpu": 15.3, "memory": 120.5},
        {"name": "/navigation", "namespace": "/nav", "status": "active", "cpu": 8.7, "memory": 89.1}
    ]

@app.get("/api/topics")
async def get_ros2_topics():
    # Mock ROS 2 topic data
    return [
        {"name": "/cmd_vel", "type": "geometry_msgs/Twist", "publishers": 1, "subscribers": 2, "hz": 10.0},
        {"name": "/camera/image_raw", "type": "sensor_msgs/Image", "publishers": 1, "subscribers": 1, "hz": 30.0},
        {"name": "/scan", "type": "sensor_msgs/LaserScan", "publishers": 1, "subscribers": 3, "hz": 20.0}
    ]

@app.get("/api/services")
async def get_ros2_services():
    return [
        {"name": "/clear_costmaps", "type": "nav2_msgs/ClearEntireCostmap"},
        {"name": "/get_map", "type": "nav_msgs/GetMap"}
    ]

@app.websocket("/ws/monitor")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Send real-time monitoring data
            monitoring_data = {
                "type": "monitoring_update",
                "timestamp": datetime.now().isoformat(),
                "data": {
                    "nodes": await get_ros2_nodes(),
                    "topics": await get_ros2_topics(),
                    "cpu_usage": 45.2,
                    "memory_usage": 68.5,
                    "network_io": {"rx": 1.2, "tx": 2.1}
                }
            }
            await manager.send_personal_message(json.dumps(monitoring_data), websocket)
            await asyncio.sleep(1)  # Send updates every second
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Helper functions
def generate_launch_file(launch_request: LaunchFileRequest) -> str:
    template = '''#!/usr/bin/env python3

from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
'''
    
    for node in launch_request.nodes:
        template += f'''        Node(
            package='{node.get("package", "")}',
            executable='{node.get("executable", "")}',
            name='{node.get("name", "")}',
            parameters=[{node.get("parameters", {})}],
            remappings=[{node.get("remappings", [])}]
        ),
'''
    
    template += '''    ])
'''
    return template

def generate_code_template(request: CodeGenerationRequest) -> str:
    if request.language == "python":
        if request.template_type == "publisher":
            return f'''#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from {request.message_type.replace('/', '.msg.')} import {request.message_type.split('/')[-1]}


class {request.node_name.title()}Publisher(Node):
    def __init__(self):
        super().__init__('{request.node_name}')
        self.publisher = self.create_publisher(
            {request.message_type.split('/')[-1]},
            '{request.topic_name}',
            10
        )
        self.timer = self.create_timer(0.5, self.timer_callback)

    def timer_callback(self):
        msg = {request.message_type.split('/')[-1]}()
        # TODO: Fill message data
        self.publisher.publish(msg)
        self.get_logger().info(f'Publishing: {{msg}}')


def main(args=None):
    rclpy.init(args=args)
    node = {request.node_name.title()}Publisher()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()


if __name__ == '__main__':
    main()
'''
        elif request.template_type == "subscriber":
            return f'''#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from {request.message_type.replace('/', '.msg.')} import {request.message_type.split('/')[-1]}


class {request.node_name.title()}Subscriber(Node):
    def __init__(self):
        super().__init__('{request.node_name}')
        self.subscription = self.create_subscription(
            {request.message_type.split('/')[-1]},
            '{request.topic_name}',
            self.listener_callback,
            10
        )

    def listener_callback(self, msg):
        self.get_logger().info(f'Received: {{msg}}')
        # TODO: Process message data


def main(args=None):
    rclpy.init(args=args)
    node = {request.node_name.title()}Subscriber()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()


if __name__ == '__main__':
    main()
'''
    
    return "# Template not implemented yet"

def get_file_extension(language: str) -> str:
    return "py" if language == "python" else "cpp"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)