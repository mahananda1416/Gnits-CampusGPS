import React, { useState } from 'react';
import { MapPin, Navigation, ArrowUp, ArrowDown, ArrowRight, Building2, Search, Home, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ROOM_DATABASE = {
  CSE: {
    name: "CSE Block",
    color: "#9333ea",
    floors: {
      1: {
        rooms: {
          "CL1": { coords: [17.4123724, 78.3985327], pos: { x: 20, y: 50 } },
          "CL2": { coords: [17.4123823, 78.3983269], pos: { x: 80, y: 50 } },
          "CL3": { coords: [17.4124635, 78.3986444], pos: { x: 50, y: 40 } },
          "CL4": { coords: [17.4124370, 78.3986098], pos: { x: 80, y: 30 } },
          "Stairs": { coords: null, pos: { x: 50, y: 70 } }
        }
      },
      2: {
        rooms: {
          "LH1": { coords: [17.4124095, 78.3985307], pos: { x: 20, y: 40 } },
          "CL11": { coords: [17.4124117, 78.3985106], pos: { x: 50, y: 40 } },
          "Staff Room": { coords: [17.4124994, 78.3986789], pos: { x: 80, y: 30 } },
          "Dept. Exam Section": { coords: [17.4125941, 78.3984925], pos: { x: 90, y: 50 } },
          "CSE HOD": { coords: [17.4124421, 78.3987342], pos: { x: 85, y: 40 } },
          "LH3": { coords: [17.4124754, 78.3987399], pos: { x: 80, y: 60 } },
          "Lift": { coords: null, pos: { x: 85, y: 70 } },
          "Stairs": { coords: null, pos: { x: 50, y: 70 } }
        }
      },
      3: {
        rooms: {
          "LH4": { coords: [17.41231, 78.39844], pos: { x: 20, y: 40 } },
          "LH5": { coords: [17.41243, 78.39843], pos: { x: 50, y: 40 } },
          "HOD CSM": { coords: [17.41234, 78.39839], pos: { x: 50, y: 60 } },
          "Staff Room": { coords: [17.41259, 78.39847], pos: { x: 80, y: 30 } },
          "CL10(A)": { coords: [17.41256, 78.39854], pos: { x: 80, y: 50 } },
          "CL10(B)": { coords: [17.41243, 78.39860], pos: { x: 90, y: 50 } },
          "Lift": { coords: null, pos: { x: 85, y: 70 } },
          "Stairs": { coords: null, pos: { x: 50, y: 70 } }
        }
      },
      4: {
        rooms: {
          "LH6": { coords: [17.41234, 78.39841], pos: { x: 20, y: 40 } },
          "LH7": { coords: [17.41236, 78.39832], pos: { x: 30, y: 50 } },
          "Staff Room": { coords: [17.41244, 78.39838], pos: { x: 50, y: 40 } },
          "LH8": { coords: [17.41266, 78.39852], pos: { x: 80, y: 40 } },
          "LH9": { coords: [17.41263, 78.39840], pos: { x: 90, y: 50 } },
          "Lift": { coords: null, pos: { x: 85, y: 70 } },
          "Stairs": { coords: null, pos: { x: 50, y: 70 } }
        }
      }
    }
  },
  ADMIN: {
    name: "Admin Block",
    color: "#f97316",
    floors: {
      0: {
        rooms: {
          "Old Library": { coords: [17.4107690, 78.3987761], pos: { x: 50, y: 40 } },
          "H&M HOD": { coords: [17.4108275, 78.3986313], pos: { x: 20, y: 30 } },
          "ELCS Lab": { coords: [17.4107344, 78.3987862], pos: { x: 70, y: 40 } },
          "English Skills Lab": { coords: [17.4107210, 78.3987855], pos: { x: 80, y: 50 } },
          "Admin Seminar Hall": { coords: [17.4109788, 78.3987647], pos: { x: 50, y: 20 } },
          "Mini Conference Hall": { coords: [17.4109811, 78.3987701], pos: { x: 60, y: 20 } },
          "Stairs": { coords: null, pos: { x: 40, y: 60 } }
        }
      },
      1: {
        rooms: {
          "Python Lab CL-8": { coords: [17.4106947, 78.3988408], pos: { x: 70, y: 50 } },
          "IT CC-1": { coords: [17.4107174, 78.3988536], pos: { x: 80, y: 50 } },
          "IT CC-2": { coords: [17.4108902, 78.3988583], pos: { x: 80, y: 30 } },
          "CL-5": { coords: [17.4109449, 78.3988767], pos: { x: 90, y: 30 } },
          "Admin Office": { coords: [17.4108070, 78.3987597], pos: { x: 50, y: 40 } },
          "Principal Office": { coords: [17.4108067, 78.3987332], pos: { x: 40, y: 40 } },
          "Conference Hall": { coords: [17.4108173, 78.3986071], pos: { x: 20, y: 40 } },
          "Exam Section": { coords: [17.4106218, 78.3987339], pos: { x: 30, y: 60 } },
          "Stairs": { coords: null, pos: { x: 40, y: 60 } }
        }
      },
      2: {
        rooms: {
          "LH1": { coords: [17.4108409, 78.3990041], pos: { x: 80, y: 20 } },
          "LH2": { coords: [17.4107872, 78.3989743], pos: { x: 70, y: 30 } },
          "LH3": { coords: [17.4107370, 78.3989404], pos: { x: 70, y: 40 } },
          "LH4": { coords: [17.4106739, 78.3989180], pos: { x: 70, y: 50 } },
          "ELCS Lab": { coords: [17.4107382, 78.3987872], pos: { x: 50, y: 40 } },
          "ACS Lab": { coords: [17.4106701, 78.3986628], pos: { x: 20, y: 50 } },
          "LH5": { coords: [17.4108291, 78.3986092], pos: { x: 20, y: 30 } },
          "LH6": { coords: [17.4107869, 78.3987382], pos: { x: 40, y: 40 } },
          "LH7": { coords: [17.4109046, 78.3986762], pos: { x: 30, y: 25 } },
          "LH8": { coords: [17.4109331, 78.3987543], pos: { x: 50, y: 25 } },
          "LH9": { coords: [17.4109206, 78.3988026], pos: { x: 60, y: 25 } },
          "Stairs": { coords: null, pos: { x: 40, y: 60 } }
        }
      },
      3: {
        rooms: {
          "Chemistry Lab": { coords: [17.4107504, 78.3988274], pos: { x: 70, y: 40 } },
          "Physics Lab": { coords: [17.4108377, 78.3988747], pos: { x: 80, y: 30 } },
          "Staff Room": { coords: [17.4107776, 78.3987919], pos: { x: 50, y: 40 } },
          "LH10": { coords: [17.4107952, 78.3987768], pos: { x: 50, y: 50 } },
          "LH11": { coords: [17.4108592, 78.3986755], pos: { x: 30, y: 35 } },
          "LH12": { coords: [17.4109088, 78.3987148], pos: { x: 40, y: 30 } },
          "LH13": { coords: [17.4109606, 78.3987483], pos: { x: 50, y: 25 } },
          "Stairs": { coords: null, pos: { x: 40, y: 60 } }
        }
      },
      4: {
        rooms: {
          "SoIM Library": { coords: [17.4107194, 78.3987828], pos: { x: 50, y: 40 } },
          "CL12-13": { coords: [17.4105348, 78.3989136], pos: { x: 70, y: 50 } },
          "Drawing Hall 2": { coords: [17.4106036, 78.3989441], pos: { x: 75, y: 55 } },
          "LH14": { coords: [17.4107136, 78.3990071], pos: { x: 70, y: 25 } },
          "LH15": { coords: [17.4108512, 78.3989837], pos: { x: 60, y: 25 } },
          "Stairs": { coords: null, pos: { x: 40, y: 60 } }
        }
      }
    }
  },
  IT: {
    name: "IT Block",
    color: "#ec4899",
    floors: {
      0: {
        rooms: {
          "CL6": { coords: [17.411903, 78.398613], pos: { x: 20, y: 40 } },
          "CL9": { coords: [17.411895, 78.398755], pos: { x: 70, y: 40 } },
          "Dean Alumni": { coords: [17.4120524, 78.3987962], pos: { x: 80, y: 25 } },
          "Cyber Security Center": { coords: [17.4120253, 78.3988154], pos: { x: 70, y: 25 } },
          "Mac Center": { coords: [17.4119302, 78.3988566], pos: { x: 60, y: 25 } },
          "HOD Mechanical": { coords: [17.411749, 78.398649], pos: { x: 25, y: 35 } },
          "Dean Student Affairs": { coords: [17.411685, 78.398624], pos: { x: 15, y: 45 } },
          "Library": { coords: [17.411910, 78.398475], pos: { x: 50, y: 50 } },
          "Stairs": { coords: null, pos: { x: 45, y: 65 } }
        }
      },
      1: {
        rooms: {
          "F1": { coords: [17.4119251, 78.3987346], pos: { x: 60, y: 40 } },
          "F2": { coords: [17.411803, 78.398617], pos: { x: 30, y: 45 } },
          "CL7": { coords: [17.4116174, 78.3987902], pos: { x: 40, y: 60 } },
          "IT Seminar Hall": { coords: [17.4120800, 78.3986973], pos: { x: 30, y: 25 } },
          "M.Tech CN&IS": { coords: [17.4120345, 78.3988221], pos: { x: 75, y: 25 } },
          "M.Tech PEED": { coords: [17.4115665, 78.3987523], pos: { x: 35, y: 70 } },
          "M.Tech WMC": { coords: [17.4117716, 78.3988760], pos: { x: 70, y: 55 } },
          "Stairs": { coords: null, pos: { x: 45, y: 65 } }
        }
      },
      2: {
        rooms: {
          "F3": { coords: [17.4119395, 78.3987563], pos: { x: 70, y: 40 } },
          "F4": { coords: [17.4116903, 78.3987691], pos: { x: 45, y: 50 } },
          "F5": { coords: [17.4116254, 78.3987895], pos: { x: 35, y: 55 } },
          "F6": { coords: [17.4122012, 78.3986709], pos: { x: 90, y: 35 } },
          "F7": { coords: [17.4120035, 78.3986859], pos: { x: 75, y: 35 } },
          "CC3": { coords: [17.4119344, 78.3984751], pos: { x: 25, y: 35 } },
          "CC4": { coords: [17.4121411, 78.3985914], pos: { x: 85, y: 25 } },
          "CC5": { coords: [17.4121449, 78.3986152], pos: { x: 85, y: 30 } },
          "Staff Room": { coords: [17.4120384, 78.3985186], pos: { x: 30, y: 30 } },
          "HOD IT": { coords: [17.4116929, 78.3987054], pos: { x: 40, y: 50 } },
          "Dean Placements": { coords: [17.4115863, 78.3987262], pos: { x: 30, y: 60 } },
          "Stairs": { coords: null, pos: { x: 45, y: 65 } }
        }
      },
      3: {
        rooms: {
          "F8": { coords: [17.4115646, 78.3985994], pos: { x: 25, y: 50 } },
          "F9": { coords: [17.4117562, 78.3986635], pos: { x: 40, y: 45 } },
          "F10": { coords: [17.4116654, 78.3987369], pos: { x: 45, y: 50 } },
          "CL14": { coords: [17.411842, 78.398440], pos: { x: 30, y: 35 } },
          "F-10B": { coords: [17.411937, 78.398411], pos: { x: 55, y: 35 } },
          "Adjunct Office": { coords: [17.4116298, 78.3987332], pos: { x: 40, y: 55 } },
          "Placement Office": { coords: [17.4119030, 78.3985196], pos: { x: 50, y: 40 } },
          "CL15": { coords: [17.411798, 78.398573], pos: { x: 35, y: 40 } },
          "Stairs": { coords: null, pos: { x: 45, y: 65 } }
        }
      },
      4: {
        rooms: {
          "F11": { coords: [17.4117943, 78.3988328], pos: { x: 70, y: 50 } },
          "F12": { coords: [17.4117853, 78.3987369], pos: { x: 60, y: 45 } },
          "F13": { coords: [17.4112066, 78.3982900], pos: { x: 15, y: 40 } },
          "HOD ETM": { coords: [17.4117639, 78.3982829], pos: { x: 30, y: 35 } },
          "Stairs": { coords: null, pos: { x: 45, y: 65 } }
        }
      }
    }
  },
  ECE: {
    name: "ECE Block",
    color: "#f97316",
    floors: {
      0: {
        rooms: {
          "Entrance": { coords: [17.4128334, 78.3988740], pos: { x: 50, y: 50 } },
          "Stairs": { coords: null, pos: { x: 50, y: 65 } }
        }
      },
      1: {
        rooms: {
          "d101 Staff Room": { coords: [17.4128334, 78.3988740], pos: { x: 15, y: 40 } },
          "d102 LH1": { coords: [17.4129335, 78.3988610], pos: { x: 30, y: 40 } },
          "d103 Simulation Lab": { coords: [17.4129527, 78.3988616], pos: { x: 50, y: 40 } },
          "d104 LH2": { coords: [17.4130989, 78.3989994], pos: { x: 70, y: 40 } },
          "d105 Electronic Devices Lab": { coords: [17.4130864, 78.3989947], pos: { x: 85, y: 40 } },
          "d106 Staff Room": { coords: [17.4129562, 78.3990182], pos: { x: 95, y: 40 } },
          "Stairs": { coords: null, pos: { x: 90, y: 65 } }
        }
      },
      2: {
        rooms: {
          "d201 Seminar Hall": { coords: [17.4127905, 78.3987369], pos: { x: 15, y: 40 } },
          "d202 Wireless Lab": { coords: [17.4128628, 78.3987922], pos: { x: 30, y: 40 } },
          "d203 Common Room": { coords: [17.4129146, 78.3988586], pos: { x: 45, y: 40 } },
          "d204 HOD Cabin": { coords: [17.4129485, 78.3988687], pos: { x: 55, y: 40 } },
          "d205 Digital Lab": { coords: [17.4130039, 78.3989394], pos: { x: 75, y: 40 } },
          "d206 LH3": { coords: [17.4129751, 78.3988445], pos: { x: 85, y: 40 } },
          "Stairs": { coords: null, pos: { x: 90, y: 65 } }
        }
      },
      3: {
        rooms: {
          "d301 LH4": { coords: [17.4129002, 78.3988268], pos: { x: 20, y: 40 } },
          "d302 LH5": { coords: [17.4129156, 78.3988744], pos: { x: 35, y: 40 } },
          "d303 Common Room": { coords: [17.4129575, 78.3989166], pos: { x: 50, y: 40 } },
          "d304 Mini Project Lab": { coords: [17.4130474, 78.3989438], pos: { x: 70, y: 40 } },
          "d305 LH6": { coords: [17.4131558, 78.3988432], pos: { x: 85, y: 40 } },
          "d306 Staff Room": { coords: [17.4131008, 78.3988358], pos: { x: 95, y: 40 } },
          "Stairs": { coords: null, pos: { x: 90, y: 65 } }
        }
      },
      4: {
        rooms: {
          "d401 M.Tech Room": { coords: [17.4128218, 78.3986692], pos: { x: 20, y: 40 } },
          "d402 Embedded Lab": { coords: [17.4128573, 78.3987523], pos: { x: 35, y: 40 } },
          "d403 LH7": { coords: [17.4128605, 78.3986162], pos: { x: 50, y: 40 } },
          "d404 Waiting Room": { coords: [17.4129156, 78.3987684], pos: { x: 60, y: 40 } },
          "d405 ML Lab": { coords: [17.4131213, 78.3989049], pos: { x: 80, y: 40 } },
          "d406 LH8": { coords: [17.4131296, 78.3988713], pos: { x: 95, y: 40 } },
          "Stairs": { coords: null, pos: { x: 90, y: 65 } }
        }
      }
    }
  },
  EEE: {
    name: "EEE Block",
    color: "#fbbf24",
    floors: {
      0: {
        rooms: {
          "Basic Electric Lab": { coords: [17.4119603, 78.3983691], pos: { x: 30, y: 40 } },
          "Electrical Machines Lab": { coords: [17.4120355, 78.3981850], pos: { x: 50, y: 35 } },
          "Power Electronics Lab": { coords: [17.4120352, 78.3982759], pos: { x: 70, y: 40 } },
          "Stairs": { coords: null, pos: { x: 50, y: 65 } }
        }
      },
      1: {
        rooms: {
          "LH1": { coords: [17.4121097, 78.3982759], pos: { x: 25, y: 35 } },
          "Microprocessor Lab": { coords: [17.4120150, 78.3981465], pos: { x: 45, y: 40 } },
          "LH2": { coords: [17.4120025, 78.3981099], pos: { x: 55, y: 45 } },
          "JNTU Research": { coords: [17.4119552, 78.3982424], pos: { x: 35, y: 50 } },
          "LH3": { coords: [17.4119322, 78.3986256], pos: { x: 85, y: 40 } },
          "Stairs": { coords: null, pos: { x: 50, y: 65 } }
        }
      },
      2: {
        rooms: {
          "LH4": { coords: [17.4119891, 78.3983346], pos: { x: 30, y: 40 } },
          "Electric Measures Lab": { coords: [17.4120822, 78.3982544], pos: { x: 50, y: 35 } },
          "Control Systems Lab": { coords: [17.4120582, 78.3982212], pos: { x: 60, y: 38 } },
          "LH5": { coords: [17.4120019, 78.3981911], pos: { x: 70, y: 42 } },
          "LH4-2": { coords: [17.4119648, 78.3982786], pos: { x: 80, y: 45 } },
          "Stairs": { coords: null, pos: { x: 50, y: 65 } }
        }
      },
      3: {
        rooms: {
          "Python Lab": { coords: [17.4119990, 78.3982514], pos: { x: 25, y: 40 } },
          "Simulation Lab": { coords: [17.4120144, 78.3981451], pos: { x: 40, y: 38 } },
          "Circuit Analysis Lab": { coords: [17.4119664, 78.3981475], pos: { x: 55, y: 40 } },
          "Power Systems Lab": { coords: [17.4119795, 78.3981606], pos: { x: 70, y: 42 } },
          "Project Lab": { coords: [17.4119395, 78.3982005], pos: { x: 85, y: 45 } },
          "Stairs": { coords: null, pos: { x: 50, y: 65 } }
        }
      }
    }
  }
};

// Block connections for inter-block navigation
const BLOCK_CONNECTIONS = {
  CSE: { coords: [17.41238, 78.39857], exits: ['ECE', 'ADMIN'] },
  ECE: { coords: [17.41295, 78.39884], exits: ['CSE', 'ADMIN'] },
  ADMIN: { coords: [17.41080, 78.39877], exits: ['CSE', 'IT', 'EEE', 'ECE'] },
  IT: { coords: [17.41190, 78.39870], exits: ['ADMIN', 'EEE'] },
  EEE: { coords: [17.41200, 78.39825], exits: ['IT', 'ADMIN'] }
};

const CampusNavigation = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [fromBlock, setFromBlock] = useState('');
  const [fromFloor, setFromFloor] = useState('');
  const [fromRoom, setFromRoom] = useState('');
  const [toBlock, setToBlock] = useState('');
  const [toFloor, setToFloor] = useState('');
  const [toRoom, setToRoom] = useState('');
  const [route, setRoute] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('input');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate distance between two coordinates
  const calculateDistance = (coord1, coord2) => {
    const R = 6371000;
    const lat1 = coord1[0] * Math.PI / 180;
    const lat2 = coord2[0] * Math.PI / 180;
    const deltaLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const deltaLon = (coord2[1] - coord1[1]) * Math.PI / 180;
    
    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get all nodes in the graph
  const getAllNodes = () => {
    const nodes = [];
    Object.keys(ROOM_DATABASE).forEach(block => {
      Object.keys(ROOM_DATABASE[block].floors).forEach(floor => {
        Object.keys(ROOM_DATABASE[block].floors[floor].rooms).forEach(room => {
          nodes.push(`${block}-${floor}-${room}`);
        });
      });
    });
    return nodes;
  };
  
  // Get neighbors of a node with edge weights
  const getNeighbors = (nodeId) => {
    const parts = nodeId.split('-');
    const block = parts[0];
    const floor = parts[1];
    const room = parts.slice(2).join('-'); // Handle rooms with hyphens in name
    const neighbors = [];
    
    const floorData = ROOM_DATABASE[block]?.floors[floor];
    if (!floorData) return neighbors;
    
    // Same floor connections
    Object.keys(floorData.rooms).forEach(otherRoom => {
      if (otherRoom !== room) {
        const roomData = floorData.rooms[room];
        const otherRoomData = floorData.rooms[otherRoom];
        const weight = roomData.coords && otherRoomData.coords 
          ? calculateDistance(roomData.coords, otherRoomData.coords)
          : 20;
        neighbors.push({ node: `${block}-${floor}-${otherRoom}`, weight });
      }
    });
    
    // Stairs/Lift connections
    if (room === 'Stairs' || room === 'Lift') {
      Object.keys(ROOM_DATABASE[block].floors).forEach(otherFloor => {
        if (otherFloor !== floor) {
          const weight = room === 'Lift' ? 10 : Math.abs(parseInt(otherFloor) - parseInt(floor)) * 15;
          const targetRoom = ROOM_DATABASE[block].floors[otherFloor].rooms[room] ? room : 'Stairs';
          if (ROOM_DATABASE[block].floors[otherFloor].rooms[targetRoom]) {
            neighbors.push({ node: `${block}-${otherFloor}-${targetRoom}`, weight });
          }
        }
      });
    }
    
    // Inter-block connections
    if (floor === '0' && BLOCK_CONNECTIONS[block]) {
      BLOCK_CONNECTIONS[block].exits.forEach(otherBlock => {
        if (ROOM_DATABASE[otherBlock].floors['0']) {
          const weight = calculateDistance(
            BLOCK_CONNECTIONS[block].coords,
            BLOCK_CONNECTIONS[otherBlock].coords
          );
          const firstRoom = Object.keys(ROOM_DATABASE[otherBlock].floors['0'].rooms)[0];
          neighbors.push({ node: `${otherBlock}-0-${firstRoom}`, weight });
        }
      });
    }
    
    return neighbors;
  };
  
  // Dijkstra's Algorithm
  const dijkstraShortestPath = (startNode, endNode) => {
    const distances = {};
    const previous = {};
    const unvisited = new Set();
    
    const allNodes = getAllNodes();
    allNodes.forEach(node => {
      distances[node] = Infinity;
      previous[node] = null;
      unvisited.add(node);
    });
    distances[startNode] = 0;
    
    while (unvisited.size > 0) {
      let currentNode = null;
      let minDistance = Infinity;
      unvisited.forEach(node => {
        if (distances[node] < minDistance) {
          minDistance = distances[node];
          currentNode = node;
        }
      });
      
      if (currentNode === null || currentNode === endNode) break;
      
      unvisited.delete(currentNode);
      
      const neighbors = getNeighbors(currentNode);
      neighbors.forEach(({ node: neighbor, weight }) => {
        if (unvisited.has(neighbor)) {
          const altDistance = distances[currentNode] + weight;
          if (altDistance < distances[neighbor]) {
            distances[neighbor] = altDistance;
            previous[neighbor] = currentNode;
          }
        }
      });
    }
    
    const path = [];
    let current = endNode;
    while (current !== null) {
      path.unshift(current);
      current = previous[current];
    }
    
    return { path, distance: distances[endNode] };
  };

  // Generate navigation route
  const generateRoute = () => {
    if (!fromBlock || !fromFloor || !fromRoom || !toBlock || !toFloor || !toRoom) {
      alert('Please fill in all fields!');
      return;
    }

    const startNode = `${fromBlock}-${fromFloor}-${fromRoom}`;
    const endNode = `${toBlock}-${toFloor}-${toRoom}`;
    
    const { path, distance } = dijkstraShortestPath(startNode, endNode);
    
    const steps = [];
    const fromRoomData = ROOM_DATABASE[fromBlock].floors[fromFloor].rooms[fromRoom];
    const toRoomData = ROOM_DATABASE[toBlock].floors[toFloor].rooms[toRoom];

    if (fromBlock === toBlock) {
      if (fromFloor === toFloor) {
        steps.push({
          type: 'start',
          icon: <MapPin className="w-5 h-5" />,
          text: `Starting from ${fromRoom} in ${ROOM_DATABASE[fromBlock].name}, Floor ${fromFloor}`,
          block: fromBlock,
          floor: fromFloor
        });
        
        const walkDistance = fromRoomData.coords && toRoomData.coords 
          ? calculateDistance(fromRoomData.coords, toRoomData.coords) 
          : 20;
        
        steps.push({
          type: 'walk',
          icon: <ArrowRight className="w-5 h-5" />,
          text: `Walk ${Math.round(walkDistance)}m along the corridor to ${toRoom}`,
          block: fromBlock,
          floor: fromFloor
        });
      } else {
        steps.push({
          type: 'start',
          icon: <MapPin className="w-5 h-5" />,
          text: `Exit ${fromRoom} on Floor ${fromFloor}`,
          block: fromBlock,
          floor: fromFloor
        });

        const floorDiff = Math.abs(parseInt(toFloor) - parseInt(fromFloor));
        const useElevator = floorDiff > 1 && ['CSE', 'ADMIN'].includes(fromBlock);
        
        if (useElevator) {
          steps.push({
            type: 'elevator',
            icon: <ArrowUp className="w-5 h-5" />,
            text: `Take the Lift to Floor ${toFloor}`,
            block: fromBlock,
            floor: 'transit'
          });
        } else {
          const direction = parseInt(toFloor) > parseInt(fromFloor) ? 'up' : 'down';
          steps.push({
            type: 'stairs',
            icon: direction === 'up' ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />,
            text: `Take stairs ${direction} to Floor ${toFloor}`,
            block: fromBlock,
            floor: 'transit'
          });
        }

        steps.push({
          type: 'walk',
          icon: <ArrowRight className="w-5 h-5" />,
          text: `Walk to ${toRoom}`,
          block: toBlock,
          floor: toFloor
        });
      }
    } else {
      steps.push({
        type: 'start',
        icon: <MapPin className="w-5 h-5" />,
        text: `Exit ${fromRoom} on Floor ${fromFloor}`,
        block: fromBlock,
        floor: fromFloor
      });

      if (fromFloor !== '0') {
        steps.push({
          type: 'stairs',
          icon: <ArrowDown className="w-5 h-5" />,
          text: `Take stairs down to Ground Floor`,
          block: fromBlock,
          floor: 'transit'
        });
      }

      steps.push({
        type: 'exit',
        icon: <Building2 className="w-5 h-5" />,
        text: `Exit ${ROOM_DATABASE[fromBlock].name}`,
        block: fromBlock,
        floor: '0'
      });

      const outdoorDistance = calculateDistance(
        BLOCK_CONNECTIONS[fromBlock].coords,
        BLOCK_CONNECTIONS[toBlock].coords
      );

      steps.push({
        type: 'outdoor',
        icon: <Navigation className="w-5 h-5" />,
        text: `Walk ${Math.round(outdoorDistance)}m across campus to ${ROOM_DATABASE[toBlock].name}`,
        block: 'outdoor',
        floor: 'outdoor',
        mapLink: `https://www.google.com/maps/dir/${BLOCK_CONNECTIONS[fromBlock].coords[0]},${BLOCK_CONNECTIONS[fromBlock].coords[1]}/${BLOCK_CONNECTIONS[toBlock].coords[0]},${BLOCK_CONNECTIONS[toBlock].coords[1]}`
      });

      steps.push({
        type: 'enter',
        icon: <Building2 className="w-5 h-5" />,
        text: `Enter ${ROOM_DATABASE[toBlock].name}`,
        block: toBlock,
        floor: '0'
      });

      if (toFloor !== '0') {
        const useElevator = parseInt(toFloor) > 2 && ['CSE', 'ADMIN'].includes(toBlock);
        steps.push({
          type: useElevator ? 'elevator' : 'stairs',
          icon: <ArrowUp className="w-5 h-5" />,
          text: useElevator ? `Take Lift to Floor ${toFloor}` : `Take stairs up to Floor ${toFloor}`,
          block: toBlock,
          floor: 'transit'
        });
      }

      steps.push({
        type: 'walk',
        icon: <ArrowRight className="w-5 h-5" />,
        text: `Walk to ${toRoom}`,
        block: toBlock,
        floor: toFloor
      });
    }

    steps.push({
      type: 'arrive',
      icon: <MapPin className="w-5 h-5" />,
      text: `Arrive at ${toRoom} in ${ROOM_DATABASE[toBlock].name}`,
      block: toBlock,
      floor: toFloor
    });

    setRoute(steps);
    setCurrentView('route');
  };

  // Search rooms
  const searchRooms = () => {
    const results = [];
    Object.entries(ROOM_DATABASE).forEach(([block, blockData]) => {
      Object.entries(blockData.floors).forEach(([floor, floorData]) => {
        Object.keys(floorData.rooms).forEach(room => {
          if (room.toLowerCase().includes(searchQuery.toLowerCase())) {
            results.push({ block, floor, room });
          }
        });
      });
    });
    return results;
  };

  // Floor plan renderer
  const FloorPlan = ({ block, floor, highlightRoom }) => {
    const floorData = ROOM_DATABASE[block]?.floors[floor];
    if (!floorData) return null;

    return (
      <div className="relative w-full h-96 bg-gray-100 rounded-lg border-2 border-gray-300">
        <div className="absolute top-2 left-2 bg-white px-3 py-1 rounded shadow text-sm font-semibold">
          {ROOM_DATABASE[block].name} - Floor {floor}
        </div>
        
        {Object.entries(floorData.rooms).map(([roomName, roomData]) => {
          const isHighlighted = roomName === highlightRoom;
          const isStairsOrLift = roomName === 'Stairs' || roomName === 'Lift';
          
          return (
            <div
              key={roomName}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded text-xs font-medium transition-all cursor-pointer
                ${isHighlighted ? 'bg-green-500 text-white scale-110 shadow-lg z-10' : 
                  isStairsOrLift ? 'bg-gray-400 text-white' : 
                  'bg-blue-500 text-white hover:bg-blue-600'}`}
              style={{
                left: `${roomData.pos.x}%`,
                top: `${roomData.pos.y}%`
              }}
              title={roomName}
            >
              {roomName.length > 15 ? roomName.substring(0, 12) + '...' : roomName}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Navigation className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">GNITS Campus Navigation</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
          <p className="text-gray-600">Internal & External Navigation System</p>
        </div>

        {currentView === 'input' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Room Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for any room (e.g., CL1, LH4, F3)..."
                  className="w-full px-4 py-3 pl-10 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
              {searchQuery && (
                <div className="mt-2 bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {searchRooms().map((result, idx) => (
                    <div key={idx} className="py-1 text-sm">
                      <span className="font-medium">{result.room}</span> - {ROOM_DATABASE[result.block].name}, Floor {result.floor}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Starting Point
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Block</label>
                  <select
                    value={fromBlock}
                    onChange={(e) => { setFromBlock(e.target.value); setFromFloor(''); setFromRoom(''); }}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Block</option>
                    {Object.keys(ROOM_DATABASE).map(block => (
                      <option key={block} value={block}>{ROOM_DATABASE[block].name}</option>
                    ))}
                  </select>
                </div>

                {fromBlock && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
                    <select
                      value={fromFloor}
                      onChange={(e) => { setFromFloor(e.target.value); setFromRoom(''); }}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">Select Floor</option>
                      {Object.keys(ROOM_DATABASE[fromBlock].floors).map(floor => (
                        <option key={floor} value={floor}>Floor {floor}</option>
                      ))}
                    </select>
                  </div>
                )}

                {fromBlock && fromFloor && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                    <select
                      value={fromRoom}
                      onChange={(e) => setFromRoom(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">Select Room</option>
                      {Object.keys(ROOM_DATABASE[fromBlock].floors[fromFloor].rooms)
                        .filter(r => r !== 'Stairs' && r !== 'Lift')
                        .map(room => (
                          <option key={room} value={room}>{room}</option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Destination
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Block</label>
                  <select
                    value={toBlock}
                    onChange={(e) => { setToBlock(e.target.value); setToFloor(''); setToRoom(''); }}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Select Block</option>
                    {Object.keys(ROOM_DATABASE).map(block => (
                      <option key={block} value={block}>{ROOM_DATABASE[block].name}</option>
                    ))}
                  </select>
                </div>

                {toBlock && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
                    <select
                      value={toFloor}
                      onChange={(e) => { setToFloor(e.target.value); setToRoom(''); }}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">Select Floor</option>
                      {Object.keys(ROOM_DATABASE[toBlock].floors).map(floor => (
                        <option key={floor} value={floor}>Floor {floor}</option>
                      ))}
                    </select>
                  </div>
                )}

                {toBlock && toFloor && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                    <select
                      value={toRoom}
                      onChange={(e) => setToRoom(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">Select Room</option>
                      {Object.keys(ROOM_DATABASE[toBlock].floors[toFloor].rooms)
                        .filter(r => r !== 'Stairs' && r !== 'Lift')
                        .map(room => (
                          <option key={room} value={room}>{room}</option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={generateRoute}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Navigation className="w-5 h-5" />
              Generate Navigation Route
            </button>
          </div>
        )}

        {currentView === 'route' && route && (
          <div className="space-y-6">
            <button
              onClick={() => { setCurrentView('input'); setRoute(null); }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
            >
              ← Back to Input
            </button>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Navigation Instructions</h2>
              <div className="space-y-4">
                {route.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`p-2 rounded-full ${
                      step.type === 'start' ? 'bg-green-100 text-green-600' :
                      step.type === 'arrive' ? 'bg-blue-100 text-blue-600' :
                      step.type === 'outdoor' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-indigo-100 text-indigo-600'
                    }`}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{step.text}</p>
                      {step.mapLink && (
                        <a
                          href={step.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-sm mt-1 inline-block"
                        >
                          Open in Google Maps →
                        </a>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-500">Step {idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Floor Plan View</h2>
              <div className="space-y-6">
                {fromBlock && fromFloor && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Starting Location</h3>
                    <FloorPlan block={fromBlock} floor={fromFloor} highlightRoom={fromRoom} />
                  </div>
                )}
                {toBlock && toFloor && (fromBlock !== toBlock || fromFloor !== toFloor) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Destination Location</h3>
                    <FloorPlan block={toBlock} floor={toFloor} highlightRoom={toRoom} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampusNavigation;