#!/usr/bin/env python3
"""
ROSphere CLI Tool
Command-line interface for generating ROS 2 projects, packages, and nodes.
"""

import argparse
import os
import sys
import json
import yaml
from pathlib import Path
from typing import Dict, List, Optional
import requests


class ROSphereCLI:
    def __init__(self):
        self.api_base = "http://localhost:8000"
        self.config_dir = Path.home() / ".rosphere"
        self.config_file = self.config_dir / "config.yaml"
        self.templates_dir = self.config_dir / "templates"
        
        # Create config directory if it doesn't exist
        self.config_dir.mkdir(exist_ok=True)
        self.templates_dir.mkdir(exist_ok=True)
        
        # Load configuration
        self.config = self.load_config()

    def load_config(self) -> Dict:
        """Load configuration from file or create default."""
        if self.config_file.exists():
            with open(self.config_file, 'r') as f:
                return yaml.safe_load(f) or {}
        else:
            default_config = {
                'default': {
                    'author': 'Your Name',
                    'email': 'your.email@example.com',
                    'license': 'MIT',
                    'ros_distro': 'humble',
                },
                'workspace': {
                    'default_path': '~/ros2_ws',
                    'build_tool': 'colcon'
                }
            }
            self.save_config(default_config)
            return default_config

    def save_config(self, config: Dict):
        """Save configuration to file."""
        with open(self.config_file, 'w') as f:
            yaml.dump(config, f, default_flow_style=False)

    def create_workspace(self, name: str, path: Optional[str] = None, ros_distro: str = None):
        """Create a new ROS 2 workspace."""
        if path is None:
            path = os.path.expanduser(self.config['workspace']['default_path'])
        
        if ros_distro is None:
            ros_distro = self.config['default']['ros_distro']
        
        workspace_path = Path(path) / name
        
        print(f"Creating ROS 2 workspace: {name}")
        print(f"Path: {workspace_path}")
        
        # Create workspace directory structure
        workspace_path.mkdir(parents=True, exist_ok=True)
        (workspace_path / "src").mkdir(exist_ok=True)
        
        # Create .rosphere workspace metadata
        metadata = {
            'name': name,
            'ros_distro': ros_distro,
            'created_by': 'rosphere-cli',
            'packages': []
        }
        
        with open(workspace_path / ".rosphere-workspace.yaml", 'w') as f:
            yaml.dump(metadata, f)
        
        print(f"✅ Workspace '{name}' created successfully!")
        print(f"Next steps:")
        print(f"  cd {workspace_path}")
        print(f"  rosphere create package <package_name>")

    def create_package(self, name: str, language: str = "cpp", workspace_path: str = None):
        """Create a new ROS 2 package."""
        if workspace_path is None:
            workspace_path = Path.cwd()
        else:
            workspace_path = Path(workspace_path)
        
        # Find workspace root
        current = workspace_path
        while current != current.parent:
            if (current / ".rosphere-workspace.yaml").exists():
                workspace_path = current
                break
            current = current.parent
        else:
            print("❌ Not in a ROSphere workspace. Please run this command from within a workspace.")
            return False
        
        package_path = workspace_path / "src" / name
        
        print(f"Creating ROS 2 package: {name}")
        print(f"Language: {language}")
        print(f"Path: {package_path}")
        
        # Create package directory
        package_path.mkdir(parents=True, exist_ok=True)
        
        # Generate package files
        self._generate_package_xml(package_path, name, language)
        self._generate_cmake_lists(package_path, name, language)
        
        if language in ["python", "both"]:
            self._generate_setup_py(package_path, name)
            (package_path / name).mkdir(exist_ok=True)
            (package_path / name / "__init__.py").touch()
        
        if language in ["cpp", "both"]:
            (package_path / "src").mkdir(exist_ok=True)
            (package_path / "include" / name).mkdir(parents=True, exist_ok=True)
        
        (package_path / "launch").mkdir(exist_ok=True)
        (package_path / "config").mkdir(exist_ok=True)
        
        # Update workspace metadata
        self._update_workspace_metadata(workspace_path, name)
        
        print(f"✅ Package '{name}' created successfully!")
        print(f"Next steps:")
        print(f"  rosphere generate node <node_type> --package {name}")

    def generate_node(self, node_type: str, package: str, topic: str = None, language: str = "cpp"):
        """Generate a ROS 2 node."""
        templates = {
            "publisher": self._get_publisher_template,
            "subscriber": self._get_subscriber_template,
            "service_server": self._get_service_server_template,
            "service_client": self._get_service_client_template
        }
        
        if node_type not in templates:
            print(f"❌ Unknown node type: {node_type}")
            print(f"Available types: {', '.join(templates.keys())}")
            return False
        
        # Find package directory
        package_path = self._find_package_path(package)
        if not package_path:
            print(f"❌ Package '{package}' not found in current workspace")
            return False
        
        print(f"Generating {node_type} node for package '{package}'")
        
        # Generate node code
        template_func = templates[node_type]
        code = template_func(package, topic or "example_topic", language)
        
        # Write to file
        if language == "cpp":
            file_path = package_path / "src" / f"{node_type}_node.cpp"
            with open(file_path, 'w') as f:
                f.write(code)
        else:
            file_path = package_path / package / f"{node_type}_node.py"
            with open(file_path, 'w') as f:
                f.write(code)
            os.chmod(file_path, 0o755)
        
        print(f"✅ Node generated: {file_path}")

    def _generate_package_xml(self, package_path: Path, name: str, language: str):
        """Generate package.xml file."""
        author = self.config['default']['author']
        email = self.config['default']['email']
        license_type = self.config['default']['license']
        
        xml_content = f'''<?xml version="1.0"?>
<?xml-model href="http://download.ros.org/schema/package_format3.xsd" schematyp="xml"?>
<package format="3">
  <name>{name}</name>
  <version>0.0.0</version>
  <description>The {name} package</description>

  <maintainer email="{email}">{author}</maintainer>

  <license>{license_type}</license>

  <buildtool_depend>ament_cmake</buildtool_depend>

  <depend>rclcpp</depend>
  <depend>std_msgs</depend>

  <test_depend>ament_lint_auto</test_depend>
  <test_depend>ament_lint_common</test_depend>

  <export>
    <build_type>ament_cmake</build_type>
  </export>
</package>'''
        
        with open(package_path / "package.xml", 'w') as f:
            f.write(xml_content)

    def _generate_cmake_lists(self, package_path: Path, name: str, language: str):
        """Generate CMakeLists.txt file."""
        cmake_content = f'''cmake_minimum_required(VERSION 3.8)
project({name})

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# find dependencies
find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)

if(BUILD_TESTING)
  find_package(ament_lint_auto REQUIRED)
  ament_lint_auto_find_test_dependencies()
endif()

ament_package()
'''
        
        with open(package_path / "CMakeLists.txt", 'w') as f:
            f.write(cmake_content)

    def _generate_setup_py(self, package_path: Path, name: str):
        """Generate setup.py file for Python packages."""
        author = self.config['default']['author']
        email = self.config['default']['email']
        license_type = self.config['default']['license']
        
        setup_content = f'''from setuptools import find_packages, setup

package_name = '{name}'

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
    maintainer='{author}',
    maintainer_email='{email}',
    description='The {name} package',
    license='{license_type}',
    tests_require=['pytest'],
    entry_points={{
        'console_scripts': [
        ],
    }},
)
'''
        
        with open(package_path / "setup.py", 'w') as f:
            f.write(setup_content)

    def _find_package_path(self, package_name: str) -> Optional[Path]:
        """Find the path to a package in the current workspace."""
        # Start from current directory and look for workspace root
        current = Path.cwd()
        while current != current.parent:
            if (current / ".rosphere-workspace.yaml").exists():
                package_path = current / "src" / package_name
                if package_path.exists():
                    return package_path
                break
            current = current.parent
        return None

    def _update_workspace_metadata(self, workspace_path: Path, package_name: str):
        """Update workspace metadata with new package."""
        metadata_file = workspace_path / ".rosphere-workspace.yaml"
        with open(metadata_file, 'r') as f:
            metadata = yaml.safe_load(f)
        
        if package_name not in metadata.get('packages', []):
            metadata.setdefault('packages', []).append(package_name)
        
        with open(metadata_file, 'w') as f:
            yaml.dump(metadata, f)

    def _get_publisher_template(self, package: str, topic: str, language: str) -> str:
        """Get publisher node template."""
        if language == "cpp":
            return f'''#include <chrono>
#include <functional>
#include <memory>
#include <string>

#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/string.hpp"

using namespace std::chrono_literals;

class PublisherNode : public rclcpp::Node
{{
  public:
    PublisherNode()
    : Node("{package}_publisher")
    {{
      publisher_ = this->create_publisher<std_msgs::msg::String>("{topic}", 10);
      timer_ = this->create_wall_timer(
        500ms, std::bind(&PublisherNode::timer_callback, this));
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
  rclcpp::spin(std::make_shared<PublisherNode>());
  rclcpp::shutdown();
  return 0;
}}'''
        else:  # Python
            return f'''#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class PublisherNode(Node):
    def __init__(self):
        super().__init__('{package}_publisher')
        self.publisher_ = self.create_publisher(String, '{topic}', 10)
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
    node = PublisherNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
'''

    def _get_subscriber_template(self, package: str, topic: str, language: str) -> str:
        """Get subscriber node template."""
        if language == "cpp":
            return f'''#include <functional>
#include <memory>

#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/string.hpp"

using std::placeholders::_1;

class SubscriberNode : public rclcpp::Node
{{
  public:
    SubscriberNode()
    : Node("{package}_subscriber")
    {{
      subscription_ = this->create_subscription<std_msgs::msg::String>(
        "{topic}", 10, std::bind(&SubscriberNode::topic_callback, this, _1));
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
  rclcpp::spin(std::make_shared<SubscriberNode>());
  rclcpp::shutdown();
  return 0;
}}'''
        else:  # Python
            return f'''#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class SubscriberNode(Node):
    def __init__(self):
        super().__init__('{package}_subscriber')
        self.subscription = self.create_subscription(
            String,
            '{topic}',
            self.listener_callback,
            10)
        self.subscription  # prevent unused variable warning

    def listener_callback(self, msg):
        self.get_logger().info(f'I heard: "{{msg.data}}"')

def main(args=None):
    rclpy.init(args=args)
    node = SubscriberNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
'''

    def _get_service_server_template(self, package: str, topic: str, language: str) -> str:
        """Get service server template."""
        return "# Service server template - Coming soon!"

    def _get_service_client_template(self, package: str, topic: str, language: str) -> str:
        """Get service client template."""
        return "# Service client template - Coming soon!"


def main():
    parser = argparse.ArgumentParser(description="ROSphere CLI - ROS 2 Development Tools")
    parser.add_argument("--version", action="version", version="1.0.0")
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Create command
    create_parser = subparsers.add_parser("create", help="Create workspace or package")
    create_subparsers = create_parser.add_subparsers(dest="create_type")
    
    # Create workspace
    workspace_parser = create_subparsers.add_parser("workspace", help="Create a new workspace")
    workspace_parser.add_argument("name", help="Workspace name")
    workspace_parser.add_argument("--path", help="Path to create workspace")
    workspace_parser.add_argument("--ros-distro", help="ROS 2 distribution")
    
    # Create package
    package_parser = create_subparsers.add_parser("package", help="Create a new package")
    package_parser.add_argument("name", help="Package name")
    package_parser.add_argument("--lang", choices=["cpp", "python", "both"], default="cpp", help="Programming language")
    package_parser.add_argument("--workspace", help="Workspace path")
    
    # Generate command
    generate_parser = subparsers.add_parser("generate", help="Generate code")
    generate_subparsers = generate_parser.add_subparsers(dest="generate_type")
    
    # Generate node
    node_parser = generate_subparsers.add_parser("node", help="Generate a node")
    node_parser.add_argument("type", choices=["publisher", "subscriber", "service_server", "service_client"], help="Node type")
    node_parser.add_argument("--package", required=True, help="Package name")
    node_parser.add_argument("--topic", help="Topic name")
    node_parser.add_argument("--lang", choices=["cpp", "python"], default="cpp", help="Programming language")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    cli = ROSphereCLI()
    
    if args.command == "create":
        if args.create_type == "workspace":
            cli.create_workspace(args.name, args.path, args.ros_distro)
        elif args.create_type == "package":
            cli.create_package(args.name, args.lang, args.workspace)
        else:
            create_parser.print_help()
    
    elif args.command == "generate":
        if args.generate_type == "node":
            cli.generate_node(args.type, args.package, args.topic, args.lang)
        else:
            generate_parser.print_help()
    
    else:
        parser.print_help()


if __name__ == "__main__":
    main()