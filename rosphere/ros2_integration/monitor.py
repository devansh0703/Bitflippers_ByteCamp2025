#!/usr/bin/env python3

"""
ROS 2 Integration Module
Provides real-time introspection and monitoring of ROS 2 systems
"""

import rclpy
from rclpy.node import Node
from rclpy.executors import SingleThreadedExecutor
import threading
import json
import time
import psutil
from typing import Dict, List, Any, Optional

try:
    import rclpy.graph
    ROS2_AVAILABLE = True
except ImportError:
    ROS2_AVAILABLE = False
    print("Warning: ROS 2 not available. Using mock data.")

class ROS2Monitor(Node):
    """ROS 2 system monitoring node"""
    
    def __init__(self):
        super().__init__('rosphere_monitor')
        self.nodes_info = {}
        self.topics_info = {}
        self.services_info = {}
        self.timer = self.create_timer(1.0, self.update_system_info)
        
    def update_system_info(self):
        """Update system information periodically"""
        try:
            self.update_nodes_info()
            self.update_topics_info()
            self.update_services_info()
        except Exception as e:
            self.get_logger().error(f"Error updating system info: {e}")
    
    def update_nodes_info(self):
        """Update information about active nodes"""
        try:
            node_names = self.get_node_names()
            self.nodes_info = {
                "nodes": [
                    {
                        "name": name,
                        "namespace": namespace,
                        "status": "active",
                        "cpu": self.get_node_cpu_usage(name),
                        "memory": self.get_node_memory_usage(name)
                    }
                    for name, namespace in node_names
                ],
                "count": len(node_names),
                "timestamp": time.time()
            }
        except Exception as e:
            self.get_logger().warn(f"Could not update nodes info: {e}")
    
    def update_topics_info(self):
        """Update information about active topics"""
        try:
            topics_and_types = self.get_topic_names_and_types()
            self.topics_info = {
                "topics": [
                    {
                        "name": name,
                        "type": types[0] if types else "unknown",
                        "publishers": len(self.get_publishers_info_by_topic(name)),
                        "subscribers": len(self.get_subscriptions_info_by_topic(name)),
                        "hz": self.estimate_topic_frequency(name)
                    }
                    for name, types in topics_and_types
                ],
                "count": len(topics_and_types),
                "timestamp": time.time()
            }
        except Exception as e:
            self.get_logger().warn(f"Could not update topics info: {e}")
    
    def update_services_info(self):
        """Update information about active services"""
        try:
            services_and_types = self.get_service_names_and_types()
            self.services_info = {
                "services": [
                    {
                        "name": name,
                        "type": types[0] if types else "unknown"
                    }
                    for name, types in services_and_types
                ],
                "count": len(services_and_types),
                "timestamp": time.time()
            }
        except Exception as e:
            self.get_logger().warn(f"Could not update services info: {e}")
    
    def get_node_cpu_usage(self, node_name: str) -> float:
        """Get CPU usage for a specific node (mock implementation)"""
        # In a real implementation, this would track actual process CPU usage
        import random
        return random.uniform(0.1, 25.0)
    
    def get_node_memory_usage(self, node_name: str) -> float:
        """Get memory usage for a specific node (mock implementation)"""
        # In a real implementation, this would track actual process memory usage
        import random
        return random.uniform(10.0, 200.0)
    
    def estimate_topic_frequency(self, topic_name: str) -> float:
        """Estimate the publishing frequency of a topic (mock implementation)"""
        # In a real implementation, this would measure actual message rates
        import random
        return random.uniform(0.1, 100.0)

class ROS2IntegrationManager:
    """Main manager for ROS 2 integration"""
    
    def __init__(self):
        self.monitor_node: Optional[ROS2Monitor] = None
        self.executor: Optional[SingleThreadedExecutor] = None
        self.thread: Optional[threading.Thread] = None
        self.running = False
        
    def start(self):
        """Start ROS 2 monitoring"""
        if not ROS2_AVAILABLE:
            print("ROS 2 not available, using mock monitoring")
            return self.start_mock_monitoring()
            
        try:
            rclpy.init()
            self.monitor_node = ROS2Monitor()
            self.executor = SingleThreadedExecutor()
            self.executor.add_node(self.monitor_node)
            
            self.running = True
            self.thread = threading.Thread(target=self._spin_thread)
            self.thread.daemon = True
            self.thread.start()
            
            print("ROS 2 monitoring started")
            return True
            
        except Exception as e:
            print(f"Failed to start ROS 2 monitoring: {e}")
            return False
    
    def stop(self):
        """Stop ROS 2 monitoring"""
        self.running = False
        
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=2.0)
            
        if self.executor:
            self.executor.shutdown()
            
        if self.monitor_node:
            self.monitor_node.destroy_node()
            
        if ROS2_AVAILABLE:
            rclpy.shutdown()
            
        print("ROS 2 monitoring stopped")
    
    def _spin_thread(self):
        """Thread function for spinning the ROS 2 executor"""
        while self.running and rclpy.ok():
            try:
                self.executor.spin_once(timeout_sec=0.1)
            except Exception as e:
                print(f"Error in ROS 2 spin: {e}")
                break
    
    def get_system_info(self) -> Dict[str, Any]:
        """Get current system information"""
        if self.monitor_node:
            return {
                "nodes": self.monitor_node.nodes_info,
                "topics": self.monitor_node.topics_info,
                "services": self.monitor_node.services_info,
                "system": self.get_system_metrics()
            }
        else:
            return self.get_mock_system_info()
    
    def get_system_metrics(self) -> Dict[str, Any]:
        """Get system performance metrics"""
        try:
            cpu_percent = psutil.cpu_percent(interval=None)
            memory = psutil.virtual_memory()
            network = psutil.net_io_counters()
            
            return {
                "cpu_usage": cpu_percent,
                "memory_usage": memory.percent,
                "memory_total": memory.total,
                "memory_available": memory.available,
                "network_io": {
                    "bytes_sent": network.bytes_sent,
                    "bytes_recv": network.bytes_recv,
                    "rx": network.bytes_recv / (1024 * 1024),  # MB
                    "tx": network.bytes_sent / (1024 * 1024)   # MB
                }
            }
        except Exception as e:
            print(f"Error getting system metrics: {e}")
            return {
                "cpu_usage": 0.0,
                "memory_usage": 0.0,
                "network_io": {"rx": 0.0, "tx": 0.0}
            }
    
    def start_mock_monitoring(self) -> bool:
        """Start mock monitoring when ROS 2 is not available"""
        self.running = True
        print("Mock ROS 2 monitoring started")
        return True
    
    def get_mock_system_info(self) -> Dict[str, Any]:
        """Generate mock system information"""
        import random
        
        return {
            "nodes": {
                "nodes": [
                    {
                        "name": "/teleop_node",
                        "namespace": "/",
                        "status": "active",
                        "cpu": round(random.uniform(1.0, 5.0), 1),
                        "memory": round(random.uniform(30.0, 60.0), 1)
                    },
                    {
                        "name": "/camera_driver",
                        "namespace": "/sensors",
                        "status": "active", 
                        "cpu": round(random.uniform(10.0, 20.0), 1),
                        "memory": round(random.uniform(100.0, 150.0), 1)
                    },
                    {
                        "name": "/navigation",
                        "namespace": "/nav",
                        "status": "active",
                        "cpu": round(random.uniform(5.0, 15.0), 1),
                        "memory": round(random.uniform(70.0, 120.0), 1)
                    }
                ],
                "count": 3,
                "timestamp": time.time()
            },
            "topics": {
                "topics": [
                    {
                        "name": "/cmd_vel",
                        "type": "geometry_msgs/Twist",
                        "publishers": 1,
                        "subscribers": 2,
                        "hz": round(random.uniform(8.0, 12.0), 1)
                    },
                    {
                        "name": "/camera/image_raw",
                        "type": "sensor_msgs/Image",
                        "publishers": 1,
                        "subscribers": 1,
                        "hz": round(random.uniform(28.0, 32.0), 1)
                    },
                    {
                        "name": "/scan",
                        "type": "sensor_msgs/LaserScan",
                        "publishers": 1,
                        "subscribers": 3,
                        "hz": round(random.uniform(18.0, 22.0), 1)
                    }
                ],
                "count": 3,
                "timestamp": time.time()
            },
            "services": {
                "services": [
                    {"name": "/clear_costmaps", "type": "nav2_msgs/ClearEntireCostmap"},
                    {"name": "/get_map", "type": "nav_msgs/GetMap"}
                ],
                "count": 2,
                "timestamp": time.time()
            },
            "system": self.get_system_metrics()
        }

# Global instance
ros2_manager = ROS2IntegrationManager()

def start_ros2_monitoring():
    """Start ROS 2 monitoring"""
    return ros2_manager.start()

def stop_ros2_monitoring():
    """Stop ROS 2 monitoring"""
    ros2_manager.stop()

def get_ros2_system_info():
    """Get ROS 2 system information"""
    return ros2_manager.get_system_info()

if __name__ == "__main__":
    # Test the monitoring system
    manager = ROS2IntegrationManager()
    manager.start()
    
    try:
        while True:
            info = manager.get_system_info()
            print(json.dumps(info, indent=2))
            time.sleep(2)
    except KeyboardInterrupt:
        manager.stop()