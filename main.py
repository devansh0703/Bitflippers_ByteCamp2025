import os
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from supabase import create_client, Client
from datetime import datetime, timedelta

# -----------------------------
# Supabase credentials (hardcoded for now; in production, use environment variables)
# -----------------------------
SUPABASE_URL = "https://lartzlrawidhmcmixnmb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhcnR6bHJhd2lkaG1jbWl4bm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMjgzNzgsImV4cCI6MjA1NzYwNDM3OH0.dlARnACtw2QBoh9l_byup8Ij2ws_8jmEaaomPHq0bnQ"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Smart Circular Cities API")

# -----------------------------
# CORS Middleware
# -----------------------------
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================
# Pydantic models
# ============================
class User(BaseModel):
    id: int
    username: str
    email: str
    role: str
    password: str
    points: int
    badges: List[str] = []
    created_at: Optional[datetime] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    message: str
    user: User

class CreateUserRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = Field(..., pattern="^(user|moderator)$")

class SubmissionRequest(BaseModel):
    user_id: int
    submission_type: str = Field(..., pattern="^(power|waste|tree)$")
    location: str          # Google Maps location description
    latitude: float
    longitude: float
    description: str
    image_url: str
    parent_submission_id: Optional[int] = None  # Null for original submissions

class SubmissionResponse(BaseModel):
    message: str
    submission: dict

class ModeratorApprovalRequest(BaseModel):
    moderator_id: int
    submission_id: int
    decision: str = Field(..., pattern="^(approved|rejected)$")
    remarks: Optional[str] = None

class ApprovalResponse(BaseModel):
    message: str

# ============================
# Stub GenAI function (can be replaced with actual integration)
# ============================
def perform_genai_analysis(submission: dict) -> dict:
    stype = submission.get("submission_type")
    if stype in ["waste", "tree"]:
        return {"authentic": True, "confidence": 0.95}
    elif stype == "power":
        return {"summary": "Detailed power innovation report analysis.", "plausibility": 0.90}
    return {}

# ============================
# New Function: Get GenAI Output
# ============================
def get_genai_output(submission: dict) -> dict:
    """
    Uses the submission's description and image_url to generate a GenAI analysis.
    Returns a hardcoded result along with the detailed analysis from the Gemini API.
    """
    import requests, base64, re, json, google.generativeai as genai

    # Configure Gemini API Key
    genai.configure(api_key="AIzaSyB1Bo_S29PIDaTDz0lbnW6fIzTfARa0BnM")

    description = submission.get("description", "")
    image_url = submission.get("image_url")
    if not image_url:
        return {"result": "No image URL provided"}
    
    try:
        # Set a custom User-Agent header to fetch the image from external sources
        headers = {"User-Agent": "SmartCircularCities/1.0 (your_email@example.com)"}
        response = requests.get(image_url, headers=headers)
        response.raise_for_status()
        image_data = response.content
        image_base64 = base64.b64encode(image_data).decode("utf-8")
    except Exception as e:
        return {"result": "Error fetching image", "error": str(e)}
    
    prompt = f"""
    You are an AI analyzing a submission for waste management and tree plantations.
    The submission description is:
    \"\"\"{description}\"\"\"
    And here is the image (base64 encoded):
    {image_base64}
    
    Provide the result in strict JSON format (no extra text) with the following fields:
    {{
      "authenticity_flag": "Real" or "Fake",
      "confidence_score": "85%",
      "explanation": "Detailed reason why the submission is real or fake."
    }}
    
    Ensure the output is valid JSON format only.
    """
    
    model = genai.GenerativeModel("gemini-1.5-flash")
    result = model.generate_content([
        {"mime_type": "image/jpeg", "data": image_base64},
        prompt
    ])
    print("Raw API Response in get_genai_output:", result.text)
    json_match = re.search(r"\{.*\}", result.text, re.DOTALL)
    json_text = json_match.group(0) if json_match else "{}"
    try:
        analysis = json.loads(json_text)
    except json.JSONDecodeError:
        analysis = {
            "authenticity_flag": "unknown",
            "confidence_score": "Unknown",
            "explanation": "Failed to parse response. Check AI output format."
        }
    return {"result": "Yes, this seems legit", "analysis": analysis}

# ============================
# Helper function: Update user points
# ============================
def update_user_points(user_id: int, additional_points: int):
    res = supabase.table("users").select("points").eq("id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found for updating points")
    current_points = res.data[0]["points"]
    new_points = current_points + additional_points
    update_res = supabase.table("users").update({"points": new_points}).eq("id", user_id).execute()
    if not update_res.data:
        raise HTTPException(status_code=500, detail="Failed to update user points")
    return new_points

# ============================
# Email Sending Function using Gmail SMTP
# ============================
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email(recipient_email: str, subject: str, text: str):
    sender_email = "devansh2020raulo@gmail.com"  # Replace with your Gmail address
    sender_password = "wwac orzx cluo cndb"  # Your Gmail App Password
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = sender_email
    message["To"] = recipient_email
    part1 = MIMEText(text, "plain")
    message.attach(part1)
    
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, recipient_email, message.as_string())
        print(f"Email sent to {recipient_email}")
    except Exception as e:
        print(f"Error sending email to {recipient_email}: {e}")

# ============================
# API Endpoints
# ============================
@app.get("/")
def root():
    return {"message": "Smart Circular Cities API is running."}

# User login
@app.post("/login", response_model=LoginResponse)
def login(login_req: LoginRequest):
    response = supabase.table("users").select("*").eq("username", login_req.username).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    user = response.data[0]
    if user["password"] != login_req.password:
        raise HTTPException(status_code=401, detail="Incorrect password")
    return LoginResponse(message="Login successful", user=User(**user))

# Create a new user (or moderator)
@app.post("/users/create", response_model=User)
def create_user(new_user: CreateUserRequest):
    check = supabase.table("users").select("*").or_(f"username.eq.{new_user.username},email.eq.{new_user.email}").execute()
    if check.data:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    insert_res = supabase.table("users").insert(new_user.dict()).execute()
    if not insert_res.data:
        raise HTTPException(status_code=400, detail="Error creating user")
    return User(**insert_res.data[0])

@app.get("/users", response_model=List[User])
def get_users():
    response = supabase.table("users").select("*").execute()
    return [User(**u) for u in response.data] if response.data else []

# Create a new submission
@app.post("/submissions", response_model=SubmissionResponse)
def create_submission(sub_req: SubmissionRequest):
    submission_data = sub_req.dict()
    # Duplicate check: For original submissions, if same image_url exists within past week, reject.
    if submission_data.get("parent_submission_id") is None:
        one_week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        dup = supabase.table("submissions").select("*")\
            .eq("image_url", submission_data["image_url"])\
            .is_("parent_submission_id", None)\
            .gte("created_at", one_week_ago).execute()
        if dup.data:
            raise HTTPException(status_code=400, detail="Submission for this image URL already exists within the past week")
    
    # Use the new GenAI function to generate output
    genai_output = get_genai_output(submission_data)
    submission_data["genai_analysis"] = genai_output
    
    insert_response = supabase.table("submissions").insert(submission_data).execute()
    if not insert_response.data:
        raise HTTPException(status_code=400, detail="Error creating submission")
    
    # Send email notifications to the submitting user and all moderators.
    user_res = supabase.table("users").select("email").eq("id", submission_data["user_id"]).execute()
    if user_res.data:
        user_email = user_res.data[0]["email"]
        send_email(user_email, "Submission Created", f"Your submission '{submission_data['description']}' has been created.")
    
    mod_res = supabase.table("users").select("email").eq("role", "moderator").execute()
    if mod_res.data:
        for mod in mod_res.data:
            send_email(mod["email"], "New Submission Alert", f"A new submission '{submission_data['description']}' has been created.")
    
    return SubmissionResponse(message="Submission created successfully", submission=insert_response.data[0])

# Get submissions (filter by status and type)
@app.get("/submissions")
def get_submissions(status: Optional[str] = Query("approved", pattern="^(pending|approved|rejected)$"),
                    submission_type: Optional[str] = Query(None, pattern="^(power|waste|tree)$")):
    query = supabase.table("submissions").select("*").eq("status", status)
    if submission_type:
        query = query.eq("submission_type", submission_type)
    response = query.execute()
    return response.data if response.data is not None else []

# Get single submission details
@app.get("/submissions/{submission_id}")
def get_submission_details(submission_id: int):
    response = supabase.table("submissions").select("*").eq("id", submission_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Submission not found")
    return response.data[0]

# Moderator: Get pending submissions for a given type
@app.get("/moderator/submissions")
def get_pending_submissions(submission_type: Optional[str] = Query(..., pattern="^(power|waste|tree)$")):
    response = supabase.table("submissions").select("*").eq("status", "pending").eq("submission_type", submission_type).execute()
    return response.data if response.data is not None else []

# Moderator: Approve a submission (for both original and solution submissions)
@app.post("/moderator/approve", response_model=ApprovalResponse)
def moderator_approve(approval_req: ModeratorApprovalRequest):
    sub_response = supabase.table("submissions").select("*").eq("id", approval_req.submission_id).execute()
    if not sub_response.data:
        raise HTTPException(status_code=404, detail="Submission not found")
    submission = sub_response.data[0]
    
    update_response = supabase.table("submissions").update({"status": approval_req.decision}).eq("id", approval_req.submission_id).execute()
    if not update_response.data:
        raise HTTPException(status_code=500, detail="Failed to update submission status")
    
    mod_response = supabase.table("moderator_approvals").insert({
        "submission_id": approval_req.submission_id,
        "moderator_id": approval_req.moderator_id,
        "decision": approval_req.decision,
        "remarks": approval_req.remarks
    }).execute()
    if not mod_response.data:
        raise HTTPException(status_code=500, detail="Failed to log moderator decision")
    
    if approval_req.decision == "approved":
        # For original submissions:
        if submission.get("parent_submission_id") is None:
            update_user_points(submission["user_id"], 10)
            user_email = supabase.table("users").select("email").eq("id", submission["user_id"]).execute().data[0]["email"]
            send_email(user_email, "Submission Approved", f"Your submission '{submission['description']}' has been approved.")
        else:
            # For solution submissions:
            update_user_points(submission["user_id"], 100)
            parent_id = submission["parent_submission_id"]
            supabase.table("submissions").update({"status": "resolved"}).eq("id", parent_id).execute()
            orig_user = supabase.table("submissions").select("user_id").eq("id", parent_id).execute().data[0]["user_id"]
            orig_email = supabase.table("users").select("email").eq("id", orig_user).execute().data[0]["email"]
            send_email(orig_email, "Your Request Has Been Solved", f"Your submission has been solved by a solution.")
            solver_email = supabase.table("users").select("email").eq("id", submission["user_id"]).execute().data[0]["email"]
            send_email(solver_email, "Solution Accepted", f"Your solution for the submission '{submission['description']}' has been accepted.")
    
    return ApprovalResponse(message=f"Submission {approval_req.decision} and points awarded if approved.")

# Moderator: Manually resolve a submission (if moderator solves it)
@app.post("/moderator/resolve", response_model=ApprovalResponse)
def moderator_resolve(submission_id: int, moderator_id: int):
    update_response = supabase.table("submissions").update({"status": "resolved"}).eq("id", submission_id).execute()
    if not update_response.data:
        raise HTTPException(status_code=500, detail="Failed to update submission status")
    update_user_points(moderator_id, 50)
    sub = supabase.table("submissions").select("*").eq("id", submission_id).execute().data[0]
    user_email = supabase.table("users").select("email").eq("id", sub["user_id"]).execute().data[0]["email"]
    send_email(user_email, "Your Request Has Been Solved", f"Your submission '{sub['description']}' has been solved.")
    return ApprovalResponse(message="Submission resolved; moderator awarded 50 points.")

# Moderator: Get all moderator approval logs
@app.get("/moderator/approvals")
def get_moderator_approvals():
    response = supabase.table("moderator_approvals").select("*").execute()
    return response.data if response.data is not None else []

# Leaderboard: Get users sorted by points descending
@app.get("/leaderboard")
def leaderboard():
    response = supabase.table("users").select("*").order("points", desc=True).execute()
    return response.data if response.data is not None else []

# ============================
# ROSphere API Endpoints
# ============================

# ROSphere Data Models
class WorkspaceConfig(BaseModel):
    name: str
    description: Optional[str] = ""
    rosDistro: str
    buildTool: str
    path: str

class PackageConfig(BaseModel):
    name: str
    description: Optional[str] = ""
    maintainer: str
    email: str
    license: str
    language: str
    packageType: str
    dependencies: Optional[List[str]] = []
    nodeTypes: Optional[List[str]] = []

class ProjectGenerationRequest(BaseModel):
    workspace: WorkspaceConfig
    package: PackageConfig

class GeneratedFile(BaseModel):
    path: str
    content: str
    type: str

class ProjectGenerationResponse(BaseModel):
    success: bool
    message: str
    files: List[GeneratedFile]
    workspace_path: str

# ROS 2 Project Generator Functions
def generate_package_xml(package: PackageConfig) -> str:
    """Generate package.xml content"""
    dependencies = package.dependencies or []
    
    xml_content = f'''<?xml version="1.0"?>
<?xml-model href="http://download.ros.org/schema/package_format3.xsd" schematyp="xml"?>
<package format="3">
  <name>{package.name}</name>
  <version>0.0.0</version>
  <description>{package.description or f"The {package.name} package"}</description>

  <maintainer email="{package.email}">{package.maintainer}</maintainer>

  <license>{package.license}</license>

  <buildtool_depend>ament_cmake</buildtool_depend>

'''
    
    # Add dependencies
    for dep in dependencies:
        xml_content += f'  <depend>{dep}</depend>\n'
    
    # Add default test dependencies
    xml_content += '''
  <test_depend>ament_lint_auto</test_depend>
  <test_depend>ament_lint_common</test_depend>

  <export>
    <build_type>ament_cmake</build_type>
  </export>
</package>'''
    
    return xml_content

def generate_cmake_lists(package: PackageConfig) -> str:
    """Generate CMakeLists.txt content"""
    cmake_content = f'''cmake_minimum_required(VERSION 3.8)
project({package.name})

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# find dependencies
find_package(ament_cmake REQUIRED)
'''
    
    dependencies = package.dependencies or []
    for dep in dependencies:
        cmake_content += f'find_package({dep} REQUIRED)\n'
    
    cmake_content += '''
if(BUILD_TESTING)
  find_package(ament_lint_auto REQUIRED)
  ament_lint_auto_find_test_dependencies()
endif()

ament_package()
'''
    
    return cmake_content

def generate_cpp_node(package: PackageConfig, node_type: str) -> str:
    """Generate C++ node code"""
    class_name = f"{node_type.title().replace('_', '')}Node"
    
    if node_type == "publisher":
        return f'''#include <chrono>
#include <functional>
#include <memory>
#include <string>

#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/string.hpp"

using namespace std::chrono_literals;

class {class_name} : public rclcpp::Node
{{
  public:
    {class_name}()
    : Node("{package.name}_{node_type}")
    {{
      publisher_ = this->create_publisher<std_msgs::msg::String>("topic", 10);
      timer_ = this->create_wall_timer(
        500ms, std::bind(&{class_name}::timer_callback, this));
    }}

  private:
    void timer_callback()
    {{
      auto message = std_msgs::msg::String();
      message.data = "Hello, world! " + std::to_string(count_++);
      RCLCPP_INFO(this->get_logger(), "Publishing: '%s'", message.data.c_str());
      publisher_->publish(message);
    }}
    
    rclcpp::TimerBase::SharedPtr timer_;
    rclcpp::Publisher<std_msgs::msg::String>::SharedPtr publisher_;
    size_t count_ = 0;
}};

int main(int argc, char * argv[])
{{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<{class_name}>());
  rclcpp::shutdown();
  return 0;
}}'''
    
    elif node_type == "subscriber":
        return f'''#include <functional>
#include <memory>

#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/string.hpp"

using std::placeholders::_1;

class {class_name} : public rclcpp::Node
{{
  public:
    {class_name}()
    : Node("{package.name}_{node_type}")
    {{
      subscription_ = this->create_subscription<std_msgs::msg::String>(
        "topic", 10, std::bind(&{class_name}::topic_callback, this, _1));
    }}

  private:
    void topic_callback(const std_msgs::msg::String & msg) const
    {{
      RCLCPP_INFO(this->get_logger(), "I heard: '%s'", msg.data.c_str());
    }}
    
    rclcpp::Subscription<std_msgs::msg::String>::SharedPtr subscription_;
}};

int main(int argc, char * argv[])
{{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<{class_name}>());
  rclcpp::shutdown();
  return 0;
}}'''
    
    return f"// {node_type} node implementation placeholder"

def generate_python_node(package: PackageConfig, node_type: str) -> str:
    """Generate Python node code"""
    class_name = f"{node_type.title().replace('_', '')}Node"
    
    if node_type == "publisher":
        return f'''#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class {class_name}(Node):
    def __init__(self):
        super().__init__('{package.name}_{node_type}')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello World: {{self.i}}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Publishing: "{{msg.data}}"')
        self.i += 1

def main(args=None):
    rclpy.init(args=args)
    node = {class_name}()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
'''
    
    elif node_type == "subscriber":
        return f'''#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class {class_name}(Node):
    def __init__(self):
        super().__init__('{package.name}_{node_type}')
        self.subscription = self.create_subscription(
            String,
            'topic',
            self.listener_callback,
            10)
        self.subscription  # prevent unused variable warning

    def listener_callback(self, msg):
        self.get_logger().info(f'I heard: "{{msg.data}}"')

def main(args=None):
    rclpy.init(args=args)
    node = {class_name}()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
'''
    
    return f"# {node_type} node implementation placeholder"

# ROSphere API Endpoints
@app.post("/rosphere/generate-project", response_model=ProjectGenerationResponse)
def generate_ros2_project(request: ProjectGenerationRequest):
    """Generate a ROS 2 project with workspace and package"""
    try:
        generated_files = []
        workspace = request.workspace
        package = request.package
        
        # Generate package.xml
        package_xml = generate_package_xml(package)
        generated_files.append(GeneratedFile(
            path=f"{workspace.path}/src/{package.name}/package.xml",
            content=package_xml,
            type="package_xml"
        ))
        
        # Generate CMakeLists.txt
        cmake_lists = generate_cmake_lists(package)
        generated_files.append(GeneratedFile(
            path=f"{workspace.path}/src/{package.name}/CMakeLists.txt",
            content=cmake_lists,
            type="cmake"
        ))
        
        # Generate setup.py for Python packages
        if package.language in ["python", "both"]:
            setup_py = f'''from setuptools import find_packages, setup

package_name = '{package.name}'

setup(
    name=package_name,
    version='0.0.0',
    packages=find_packages(exclude=['test']),
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='{package.maintainer}',
    maintainer_email='{package.email}',
    description='{package.description or f"The {package.name} package"}',
    license='{package.license}',
    tests_require=['pytest'],
    entry_points={{
        'console_scripts': [
        ],
    }},
)
'''
            generated_files.append(GeneratedFile(
                path=f"{workspace.path}/src/{package.name}/setup.py",
                content=setup_py,
                type="setup_py"
            ))
        
        # Generate node files based on selected node types
        if package.nodeTypes:
            for node_type in package.nodeTypes:
                if package.language in ["cpp", "both"]:
                    cpp_node = generate_cpp_node(package, node_type)
                    generated_files.append(GeneratedFile(
                        path=f"{workspace.path}/src/{package.name}/src/{node_type}_node.cpp",
                        content=cpp_node,
                        type="cpp_node"
                    ))
                
                if package.language in ["python", "both"]:
                    python_node = generate_python_node(package, node_type)
                    generated_files.append(GeneratedFile(
                        path=f"{workspace.path}/src/{package.name}/{package.name}/{node_type}_node.py",
                        content=python_node,
                        type="python_node"
                    ))
        
        # Generate basic launch file
        launch_content = f'''from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='{package.name}',
            executable='{package.name}_node',
            name='{package.name}_node'
        ),
    ])
'''
        generated_files.append(GeneratedFile(
            path=f"{workspace.path}/src/{package.name}/launch/{package.name}_launch.py",
            content=launch_content,
            type="launch_file"
        ))
        
        return ProjectGenerationResponse(
            success=True,
            message="Project generated successfully",
            files=generated_files,
            workspace_path=workspace.path
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Project generation failed: {str(e)}")

@app.get("/rosphere/templates")
def get_available_templates():
    """Get available ROS 2 project templates"""
    return {
        "node_types": [
            {"id": "publisher", "name": "Publisher Node", "description": "Publishes messages to a topic"},
            {"id": "subscriber", "name": "Subscriber Node", "description": "Subscribes to messages from a topic"},
            {"id": "service_server", "name": "Service Server", "description": "Provides a service"},
            {"id": "service_client", "name": "Service Client", "description": "Calls a service"},
            {"id": "action_server", "name": "Action Server", "description": "Provides an action"},
            {"id": "action_client", "name": "Action Client", "description": "Calls an action"},
            {"id": "timer_node", "name": "Timer Node", "description": "Executes code at regular intervals"},
            {"id": "lifecycle_node", "name": "Lifecycle Node", "description": "Managed lifecycle node"},
        ],
        "languages": ["cpp", "python", "both"],
        "ros_distributions": ["humble", "iron", "jazzy"],
        "build_tools": ["colcon", "ament_cmake", "ament_python"],
        "licenses": ["MIT", "Apache-2.0", "BSD-3-Clause", "GPL-3.0"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", reload=True)

