# ROSphere - Complete ROS 2 Operations & Development Sphere

ROSphere is an intuitive, web-based development environment for ROS 2 that streamlines project creation, launch file management, code generation, and real-time monitoring.

## Features

### 🎯 Intuitive Configuration & Project Management
- **Graphical Project Wizard**: Web-based interface for creating ROS 2 workspaces
- **Intelligent Launch Composer**: Visual drag-and-drop interface for launch file creation
- **ROS 2 Boilerplate Generator**: CLI tools for code generation with templates

### 📊 Advanced Monitoring & Diagnostics
- **Real-time Monitoring Dashboard**: Live topology visualization and performance metrics
- **Centralized Logging System**: Aggregated logs with search and filtering
- **QoS Analysis**: Automatic detection and recommendations

## Quick Start

### Prerequisites
- ROS 2 (Humble/Iron/Rolling)
- Node.js 18+
- Python 3.8+
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/devansh0703/Bitflippers_ByteCamp2025.git
cd Bitflippers_ByteCamp2025
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
pip install -r requirements.txt
```

4. Start the development servers:
```bash
# Backend (FastAPI)
python main.py

# Frontend (Next.js)
npm run dev
```

## Architecture

```
rosphere/
├── frontend/           # React web application
├── backend/           # FastAPI backend services  
├── cli/              # Command-line tools
├── ros2_integration/ # ROS 2 specific modules
├── templates/        # Code generation templates
├── docs/            # Documentation
├── scripts/         # Setup and utility scripts
├── docker/          # Docker configurations
└── tests/           # Test suites
```

## CLI Usage

```bash
# Create new ROS 2 project
rosphere create my_robot_project

# Generate boilerplate code
rosphere generate publisher my_topic

# Monitor ROS 2 system
rosphere monitor

# View logs
rosphere logs --filter error
```

## API Endpoints

- `GET /api/projects` - List ROS 2 projects
- `POST /api/projects` - Create new project
- `GET /api/nodes` - List active ROS 2 nodes
- `GET /api/topics` - List topics with QoS info
- `WebSocket /ws/monitor` - Real-time monitoring data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.