import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, CheckCircle, XCircle, AlertCircle, Home, LogOut } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

// ...existing code...
const timetableData = {
  // II Year CSE
  'LH-1': {
    name: 'Lecture Hall 1',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'II Year CSE-A', subject: 'P&S' },
        { time: '10:00-11:00', class: 'II Year CSE-A', subject: 'Pre Placement Training' },
        { time: '11:10-12:10', class: 'II Year CSE-A', subject: 'DBMS' },
        { time: '1:00-2:00', class: 'II Year CSE-A', subject: 'DBMS' },
        { time: '2:00-3:00', class: 'II Year CSE-A', subject: 'PP Lab' }
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'II Year CSE-A', subject: 'DLD' },
        { time: '10:00-11:00', class: 'II Year CSE-A', subject: 'DAA' },
        { time: '11:10-12:10', class: 'II Year CSE-A', subject: 'DAA' },
        { time: '1:00-2:00', class: 'II Year CSE-A', subject: 'DLD' },
        { time: '2:00-3:00', class: 'II Year CSE-A', subject: 'DBMS Lab(B1)' }
      ],
      'WED': [
        { time: '9:00-10:00', class: 'II Year CSE-A', subject: 'PP' },
        { time: '10:00-11:00', class: 'II Year CSE-A', subject: 'P&S' },
        { time: '11:10-12:10', class: 'II Year CSE-A', subject: 'P&S' },
        { time: '1:00-2:00', class: 'II Year CSE-A', subject: 'DAA' },
        { time: '2:00-3:00', class: 'II Year CSE-A', subject: 'PP' }
      ],
      'THU': [
        { time: '9:00-10:00', class: 'II Year CSE-A', subject: 'DBMS(T)' },
        { time: '10:00-11:00', class: 'II Year CSE-A', subject: 'ITWS Lab (B1)' },
        { time: '11:10-12:10', class: 'II Year CSE-A', subject: 'DAA(T)' },
        { time: '2:00-3:00', class: 'II Year CSE-A', subject: 'DBMS Lab(B1)' }
      ],
      'FRI': [
        { time: '10:00-11:00', class: 'II Year CSE-A', subject: 'DBMS' },
        { time: '11:10-12:10', class: 'II Year CSE-A', subject: 'COI' },
        { time: '1:00-2:00', class: 'II Year CSE-A', subject: 'Library' },
        { time: '2:00-3:00', class: 'II Year CSE-A', subject: 'COI' },
        { time: '3:00-4:00', class: 'II Year CSE-A', subject: 'Library' }
      ],
      'SAT': [
        { time: '3:00-4:00', class: 'II Year CSE-A', subject: 'MBC' }
      ]
    }
  },
  'LH-3': {
    name: 'Lecture Hall 3',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'II Year CSE-C', subject: 'DLD' },
        { time: '10:00-11:00', class: 'II Year CSE-C', subject: 'Pre Placement Training' },
        { time: '11:10-12:10', class: 'II Year CSE-C', subject: 'P&S' },
        { time: '1:00-2:00', class: 'II Year CSE-C', subject: 'DLD' },
        { time: '2:00-3:00', class: 'II Year CSE-C', subject: 'DBMS' }
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'II Year CSE-C', subject: 'DAA' },
        { time: '10:00-11:00', class: 'II Year CSE-C', subject: 'DAA' },
        { time: '11:10-12:10', class: 'II Year CSE-C', subject: 'COI' }
      ]
    }
  },
  'LH-5': {
    name: 'Lecture Hall 5',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'III Year CSE-A', subject: 'FSD' },
        { time: '10:00-11:00', class: 'III Year CSE-A', subject: 'ML-Lab' },
        { time: '11:10-12:10', class: 'III Year CSE-A', subject: 'FSD' }
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'III Year CSE-A', subject: 'CN' },
        { time: '10:00-11:00', class: 'III Year CSE-A', subject: 'CN' }
      ]
    }
  },
  'F1': {
    name: 'Faculty Building - Room 1',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'II Year CSE(AI&ML)-A', subject: 'DBMS' },
        { time: '11:10-12:10', class: 'II Year CSE(AI&ML)-A', subject: 'DLD' },
        { time: '1:00-2:00', class: 'II Year CSE(AI&ML)-A', subject: 'DAA' },
        { time: '2:00-3:00', class: 'II Year CSE(AI&ML)-A', subject: 'PP' }
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'II Year CSE(AI&ML)-A', subject: 'DAA' },
        { time: '11:10-12:10', class: 'II Year CSE(AI&ML)-A', subject: 'P&S' }
      ]
    }
  },
  'F2': {
    name: 'Faculty Building - Room 2',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'II Year CSE(AI&ML)-B', subject: 'DBMS' },
        { time: '10:00-11:00', class: 'II Year CSE(AI&ML)-B', subject: 'DLD' }
      ]
    }
  },
  'LH-9': {
    name: 'Lecture Hall 9',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'IV Year CSE-A', subject: 'DSUR' },
        { time: '10:00-11:00', class: 'IV Year CSE-A', subject: 'FM' },
        { time: '11:10-12:10', class: 'IV Year CSE-A', subject: 'BDA' }
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'IV Year CSE-A', subject: 'FM' },
        { time: '10:00-11:00', class: 'IV Year CSE-A', subject: 'CNS' },
        { time: '11:10-12:10', class: 'IV Year CSE-A', subject: 'BDA' }
      ],
      'WED': [
        { time: '9:00-10:00', class: 'IV Year CSE-A', subject: 'BSPC' },
        { time: '10:00-11:00', class: 'IV Year CSE-A', subject: 'DSUR' },
        { time: '11:10-12:10', class: 'IV Year CSE-A', subject: 'FM' }
      ],
      'THUR': [
        { time: '11:10-12:10', class: 'IV Year CSE-A', subject: 'DSUR' },
        { time: '1:00-2:00', class: 'IV Year CSE-A', subject: 'CNS' },
        { time: '2:00-3:00', class: 'IV Year CSE-A', subject: 'BSPC' }
      ],
      'FRI': [
        { time: '9:00-10:00', class: 'IV Year CSE-A', subject: 'CNS' },
        { time: '10:00-11:00', class: 'IV Year CSE-A', subject: 'BDA' },
        { time: '11:10-12:10', class: 'IV Year CSE-A', subject: 'BSPC' }
      ],
    }
  },
  'D403': {
    name: 'ECE Block - Floor 4',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'IV Year CSE-B', subject: 'DSUR' },
        { time: '10:00-11:00', class: 'IV Year CSE-B', subject: 'BSPC' },
        { time: '11:10-12:10', class: 'IV Year CSE-B', subject: 'BDA' }        
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'IV Year CSE-B', subject: 'CNS' },
        { time: '10:00-11:00', class: 'IV Year CSE-B', subject: 'BDA' },
        { time: '11:10-12:10', class: 'IV Year CSE-B', subject: 'FM' }        
      ],
      'WED': [
        { time: '1:00-2:00', class: 'IV Year CSE-B', subject: 'BSPC' },
        { time: '2:00-3:00', class: 'IV Year CSE-B', subject: 'DSUR' },
        { time: '11:10-12:10', class: 'IV Year CSE-B', subject: 'FM' }        
      ],
      'THUR': [
        { time: '9:00-10:00', class: 'IV Year CSE-B', subject: 'FM' },
        { time: '10:00-11:00', class: 'IV Year CSE-B', subject: 'DSUR' },
        { time: '11:10-12:10', class: 'IV Year CSE-B', subject: 'CNS' }        
      ],
      'FRI': [
        { time: '9:00-10:00', class: 'IV Year CSE-B', subject: 'BDA' },
        { time: '10:00-11:00', class: 'IV Year CSE-B', subject: 'CNS' },
        { time: '11:10-12:10', class: 'IV Year CSE-B', subject: 'BSPC' }        
      ],
    }
  },
  'F3': {
    name: 'Faculty Building - Room 3',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'II Year IT-A', subject: 'DLD' },
        { time: '10:00-11:00', class: 'II Year IT-A', subject: 'P&S' },
        { time: '11:10-12:10', class: 'II Year IT-A', subject: 'DAA' },
        { time: '1:00-2:00', class: 'II Year IT-A', subject: 'COI' },
        { time: '2:00-3:00', class: 'II Year IT-A', subject: 'DBMS' },
        { time: '3:00-4:00', class: 'II Year IT-A', subject: 'Library' }
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'II Year IT-A', subject: 'DBMS Lab(B1)' },
        { time: '1:00-2:00', class: 'II Year IT-A', subject: 'P&S' },
        { time: '2:00-3:00', class: 'II Year IT-A', subject: 'DLD' },
        { time: '3:00-4:00', class: 'II Year IT-A', subject: 'Sports' }
      ],
      'WED': [
        { time: '9:00-10:00', class: 'II Year IT-A', subject: 'PP' },
        { time: '10:00-11:00', class: 'II Year IT-A', subject: 'DBMS' },
        { time: '11:10-12:10', class: 'II Year IT-A', subject: 'Library' },
        { time: '1:00-2:00', class: 'II Year IT-A', subject: 'DAA' },
        { time: '2:00-3:00', class: 'II Year IT-A', subject: 'PP LAB' }
      ],
      'THU': [
        { time: '9:00-10:00', class: 'II Year IT-A', subject: 'DAA' },
        { time: '10:00-11:00', class: 'II Year IT-A', subject: 'DBMS' },
        { time: '11:10-12:10', class: 'II Year IT-A', subject: 'PP' },
        { time: '1:00-2:00', class: 'II Year IT-A', subject: 'Pre Placement Training' }
      ],
      'FRI': [
        { time: '9:00-10:00', class: 'II Year IT-A', subject: 'P&S' },
        { time: '10:00-11:00', class: 'II Year IT-A', subject: 'DLD' },
        { time: '11:10-12:10', class: 'II Year IT-A', subject: 'Library' },
        { time: '1:00-2:00', class: 'II Year IT-A', subject: 'DBMS Lab(B2)' }
      ],
      'SAT': [
        { time: '9:00-10:00', class: 'II Year IT-A', subject: 'DBMS' },
        { time: '10:00-11:00', class: 'II Year IT-A', subject: 'DAA' },
        { time: '11:10-12:10', class: 'II Year IT-A', subject: 'COI' },
        { time: '1:00-2:00', class: 'II Year IT-A', subject: 'Sports' },
        { time: '2:00-3:00', class: 'II Year IT-A', subject: 'Maths Bridge Course' }
      ]
    }
  },
  'F4': {
    name: 'Faculty Building - Room 4',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'II Year IT-B', subject: 'DBMS Lab' },
        { time: '1:00-2:00', class: 'II Year IT-B', subject: 'DLD' },
        { time: '2:00-3:00', class: 'II Year IT-B', subject: 'DBMS' },
        { time: '3:00-4:00', class: 'II Year IT-B', subject: 'Library' }
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'II Year IT-B', subject: 'DAA' },
        { time: '10:00-11:00', class: 'II Year IT-B', subject: 'PP' },
        { time: '11:10-12:10', class: 'II Year IT-B', subject: 'DBMS' },
        { time: '1:00-2:00', class: 'II Year IT-B', subject: 'P&S' },
        { time: '2:00-3:00', class: 'II Year IT-B', subject: 'PP Lab' }
      ],
      'WED': [
        { time: '9:00-10:00', class: 'II Year IT-B', subject: 'DBMS Lab' },
        { time: '1:00-2:00', class: 'II Year IT-B', subject: 'DAA' },
        { time: '2:00-3:00', class: 'II Year IT-B', subject: 'PP' },
        { time: '3:00-4:00', class: 'II Year IT-B', subject: 'Sports' }
      ],
      'THU': [
        { time: '9:00-10:00', class: 'II Year IT-B', subject: 'P&S' },
        { time: '10:00-11:00', class: 'II Year IT-B', subject: 'DBMS' },
        { time: '11:10-12:10', class: 'II Year IT-B', subject: 'Library' },
        { time: '1:00-2:00', class: 'II Year IT-B', subject: 'COI' },
        { time: '2:00-3:00', class: 'II Year IT-B', subject: 'DLD' },
        { time: '3:00-4:00', class: 'II Year IT-B', subject: 'Sports' }
      ],
      'FRI': [
        { time: '9:00-10:00', class: 'II Year IT-B', subject: 'DLD' },
        { time: '10:00-11:00', class: 'II Year IT-B', subject: 'P&S' },
        { time: '11:10-12:10', class: 'II Year IT-B', subject: 'DAA' },
        { time: '1:00-2:00', class: 'II Year IT-B', subject: 'Pre Placement Training' }
      ],
      'SAT': [
        { time: '9:00-10:00', class: 'II Year IT-B', subject: 'COI' },
        { time: '10:00-11:00', class: 'II Year IT-B', subject: 'DAA' },
        { time: '11:10-12:10', class: 'II Year IT-B', subject: 'DBMS' },
        { time: '1:00-2:00', class: 'II Year IT-B', subject: 'Sports' },
        { time: '2:00-3:00', class: 'II Year IT-B', subject: 'Maths Bridge Course' }
      ]
    }
  },
  'F5': {
    name: 'Faculty Building - Room 5',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'III Year IT-A', subject: 'Pre Placement Training' },
        { time: '1:00-2:00', class: 'III Year IT-A', subject: 'Pre Placement Training' }
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'III Year IT-A', subject: 'CN' },
        { time: '10:00-11:00', class: 'III Year IT-A', subject: 'CC' },
        { time: '11:10-12:10', class: 'III Year IT-A', subject: 'PE-2' },
        { time: '1:00-2:00', class: 'III Year IT-A', subject: 'FSD Lab(B1)' }
      ],
      'WED': [
        { time: '9:00-10:00', class: 'III Year IT-A', subject: 'CC' },
        { time: '10:00-11:00', class: 'III Year IT-A', subject: 'PE-1' },
        { time: '11:10-12:10', class: 'III Year IT-A', subject: 'FSD' },
        { time: '1:00-2:00', class: 'III Year IT-A', subject: 'CN' },
        { time: '2:00-3:00', class: 'III Year IT-A', subject: 'CC Lab(B1)' }
      ],
      'THU': [
        { time: '9:00-10:00', class: 'III Year IT-A', subject: 'FSD Lab(B2)' },
        { time: '1:00-2:00', class: 'III Year IT-A', subject: 'CC' },
        { time: '2:00-3:00', class: 'III Year IT-A', subject: 'FSD' },
        { time: '3:00-4:00', class: 'III Year IT-A', subject: 'Library' }
      ],
      'FRI': [
        { time: '9:00-10:00', class: 'III Year IT-A', subject: 'PE-1' },
        { time: '10:00-11:00', class: 'III Year IT-A', subject: 'FSD' },
        { time: '11:10-12:10', class: 'III Year IT-A', subject: 'CN' },
        { time: '1:00-2:00', class: 'III Year IT-A', subject: 'PE-2' },
        { time: '2:00-3:00', class: 'III Year IT-A', subject: 'CC Lab(B2)' }
      ],
      'SAT': [
        { time: '9:00-10:00', class: 'III Year IT-A', subject: 'PE-2' },
        { time: '10:00-11:00', class: 'III Year IT-A', subject: 'PE-1' },
        { time: '11:10-12:10', class: 'III Year IT-A', subject: 'FSD' }
      ]
    }
  },
  'F6': {
    name: 'Faculty Building - Room 6',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'III Year IT-B', subject: 'CC' },
        { time: '10:00-11:00', class: 'III Year IT-B', subject: 'CN' },
        { time: '11:10-12:10', class: 'III Year IT-B', subject: 'PE-2' },
        { time: '1:00-2:00', class: 'III Year IT-B', subject: 'FSD Lab(B1)' }
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'III Year IT-B', subject: 'Pre Placement Training' },
        { time: '1:00-2:00', class: 'III Year IT-B', subject: 'Pre Placement Training' }
      ],
      'WED': [
        { time: '9:00-10:00', class: 'III Year IT-B', subject: 'PE-1' },
        { time: '10:00-11:00', class: 'III Year IT-B', subject: 'FSD' },
        { time: '11:10-12:10', class: 'III Year IT-B', subject: 'CN' },
        { time: '1:00-2:00', class: 'III Year IT-B', subject: 'CC Lab(B1)' },
        { time: '3:00-4:00', class: 'III Year IT-B', subject: 'Library' }
      ],
      'THU': [
        { time: '9:00-10:00', class: 'III Year IT-B', subject: 'CN' },
        { time: '10:00-11:00', class: 'III Year IT-B', subject: 'CC' },
        { time: '11:10-12:10', class: 'III Year IT-B', subject: 'FSD' },
        { time: '1:00-2:00', class: 'III Year IT-B', subject: 'PE-2' },
        { time: '2:00-3:00', class: 'III Year IT-B', subject: 'CC Lab(B2)' }
      ],
      'FRI': [
        { time: '9:00-10:00', class: 'III Year IT-B', subject: 'FSD Lab(B2)' },
        { time: '1:00-2:00', class: 'III Year IT-B', subject: 'FSD' },
        { time: '2:00-3:00', class: 'III Year IT-B', subject: 'CC' },
        { time: '3:00-4:00', class: 'III Year IT-B', subject: 'PE-1' }
      ],
      'SAT': [
        { time: '9:00-10:00', class: 'III Year IT-B', subject: 'FSD' },
        { time: '10:00-11:00', class: 'III Year IT-B', subject: 'PE-1' },
        { time: '11:10-12:10', class: 'III Year IT-B', subject: 'PE-2' }
      ]
    }
  },
  'F8': {
    name: 'Faculty Building - Room 8',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'IV Year IT-A', subject: 'CNS' },
        { time: '10:00-11:00', class: 'IV Year IT-A', subject: 'PE-4' },
        { time: '11:10-12:10', class: 'IV Year IT-A', subject: 'PE-5' },
        { time: '1:00-2:00', class: 'IV Year IT-A', subject: 'CNS Lab(B1)' },
        { time: '3:00-4:00', class: 'IV Year IT-A', subject: 'Library' }
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'IV Year IT-A', subject: 'PE-4' },
        { time: '10:00-11:00', class: 'IV Year IT-A', subject: 'CNS' },
        { time: '11:10-12:10', class: 'IV Year IT-A', subject: 'Library' },
        { time: '1:00-2:00', class: 'IV Year IT-A', subject: 'FM' },
        { time: '2:00-3:00', class: 'IV Year IT-A', subject: 'OE-2' },
        { time: '3:00-4:00', class: 'IV Year IT-A', subject: 'PE-5' }
      ],
      'WED': [
        { time: '9:00-10:00', class: 'IV Year IT-A', subject: 'CNS Lab(B2)' },
        { time: '11:10-12:10', class: 'IV Year IT-A', subject: 'PE-5' },
        { time: '1:00-2:00', class: 'IV Year IT-A', subject: 'Projects Phase-1' },
        { time: '3:00-4:00', class: 'IV Year IT-A', subject: 'Library' }
      ],
      'THU': [
        { time: '9:00-10:00', class: 'IV Year IT-A', subject: 'FM' },
        { time: '10:00-11:00', class: 'IV Year IT-A', subject: 'OE-2' },
        { time: '11:10-12:10', class: 'IV Year IT-A', subject: 'CNS' },
        { time: '1:00-2:00', class: 'IV Year IT-A', subject: 'Projects Phase-1' },
        { time: '3:00-4:00', class: 'IV Year IT-A', subject: 'Sports' }
      ],
      'FRI': [
        { time: '9:00-10:00', class: 'IV Year IT-A', subject: 'OE-2' },
        { time: '10:00-11:00', class: 'IV Year IT-A', subject: 'PE-4' },
        { time: '11:10-12:10', class: 'IV Year IT-A', subject: 'FM' },
        { time: '1:00-2:00', class: 'IV Year IT-A', subject: 'Projects Phase-1' },
        { time: '3:00-4:00', class: 'IV Year IT-A', subject: 'Library' }
      ],
      'SAT': [
        { time: '9:00-10:00', class: 'IV Year IT-A', subject: 'PPT' },
        { time: '3:00-4:00', class: 'IV Year IT-A', subject: 'Sports' }
      ]
    }
  },
  'F9': {
    name: 'Faculty Building - Room 9',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'IV Year IT-B', subject: 'PE-5' },
        { time: '10:00-11:00', class: 'IV Year IT-B', subject: 'CNS' },
        { time: '11:10-12:10', class: 'IV Year IT-B', subject: 'PE-4' },
        { time: '1:00-2:00', class: 'IV Year IT-B', subject: 'OE-2' },
        { time: '2:00-3:00', class: 'IV Year IT-B', subject: 'FM' },
        { time: '3:00-4:00', class: 'IV Year IT-B', subject: 'Library' }
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'IV Year IT-B', subject: 'CNS' },
        { time: '10:00-11:00', class: 'IV Year IT-B', subject: 'PE-4' },
        { time: '11:10-12:10', class: 'IV Year IT-B', subject: 'PE-5' },
        { time: '1:00-2:00', class: 'IV Year IT-B', subject: 'CNS Lab(B1)' },
        { time: '3:00-4:00', class: 'IV Year IT-B', subject: 'Sports' }
      ],
      'WED': [
        { time: '9:00-10:00', class: 'IV Year IT-B', subject: 'FM' },
        { time: '10:00-11:00', class: 'IV Year IT-B', subject: 'OE-2' },
        { time: '11:10-12:10', class: 'IV Year IT-B', subject: 'CNS' },
        { time: '1:00-2:00', class: 'IV Year IT-B', subject: 'Projects Phase-1' },
        { time: '3:00-4:00', class: 'IV Year IT-B', subject: 'Library' }
      ],
      'THU': [
        { time: '9:00-10:00', class: 'IV Year IT-B', subject: 'CNS Lab(B2)' },
        { time: '11:10-12:10', class: 'IV Year IT-B', subject: 'PE-5' },
        { time: '1:00-2:00', class: 'IV Year IT-B', subject: 'Projects Phase-1' },
        { time: '3:00-4:00', class: 'IV Year IT-B', subject: 'Sports' }
      ],
      'FRI': [
        { time: '9:00-10:00', class: 'IV Year IT-B', subject: 'OE-2' },
        { time: '10:00-11:00', class: 'IV Year IT-B', subject: 'PE-4' },
        { time: '11:10-12:10', class: 'IV Year IT-B', subject: 'FM' },
        { time: '1:00-2:00', class: 'IV Year IT-B', subject: 'Projects Phase-1' },
        { time: '3:00-4:00', class: 'IV Year IT-B', subject: 'Library' }
      ],
      'SAT': [
        { time: '9:00-10:00', class: 'IV Year IT-B', subject: 'PPT' }
      ]
    }
  },
  'LH-2': {
    name: 'Lecture Hall 2',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'III Year EEE-B', subject: 'PS-II' },
        { time: '10:00-11:00', class: 'III Year EEE-B', subject: 'CO' },
        { time: '11:10-12:10', class: 'III Year EEE-B', subject: 'PE' },
        { time: '1:00-2:00', class: 'III Year EEE-B', subject: 'PE' },
        { time: '2:00-3:00', class: 'III Year EEE-B', subject: 'MPMC Lab' },
        { time: '3:00-4:00', class: 'III Year EEE-B', subject: 'PS-II/PE' }
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'III Year EEE-B', subject: 'MPMC' },
        { time: '10:00-11:00', class: 'III Year EEE-B', subject: 'MPMC Lab' },
        { time: '11:10-12:10', class: 'III Year EEE-B', subject: 'CO' },
        { time: '1:00-2:00', class: 'III Year EEE-B', subject: 'JAVAP' },
        { time: '2:00-3:00', class: 'III Year EEE-B', subject: 'MPMC Lab' }
      ],
      'WED': [
        { time: '9:00-10:00', class: 'III Year EEE-B', subject: 'PE' },
        { time: '10:00-11:00', class: 'III Year EEE-B', subject: 'JAVAP' },
        { time: '11:10-12:10', class: 'III Year EEE-B', subject: 'CO' },
        { time: '1:00-2:00', class: 'III Year EEE-B', subject: 'PLACEMENTS TRAINING' },
        { time: '3:00-4:00', class: 'III Year EEE-B', subject: 'Library' }
      ],
      'THU': [
        { time: '10:00-11:00', class: 'III Year EEE-B', subject: 'PLACEMENTS TRAINING' },
        { time: '11:10-12:10', class: 'III Year EEE-B', subject: 'Library' },
        { time: '2:00-3:00', class: 'III Year EEE-B', subject: 'MPMC' }
      ],
      'FRI': [
        { time: '9:00-10:00', class: 'III Year EEE-B', subject: 'MPMC' },
        { time: '10:00-11:00', class: 'III Year EEE-B', subject: 'PS-II' },
        { time: '2:00-3:00', class: 'III Year EEE-B', subject: 'PLACEMENTS TRAINING' },
        { time: '3:00-4:00', class: 'III Year EEE-B', subject: 'PE' }
      ],
      'SAT': [
        { time: '3:00-4:00', class: 'III Year EEE-B', subject: 'Sports' }
      ]
    }
  },
  'LH-4': {
    name: 'Lecture Hall 4',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'II Year EEE-B', subject: 'SFCVT' },
        { time: '10:00-11:00', class: 'II Year EEE-B', subject: 'ECA' },
        { time: '11:10-12:10', class: 'II Year EEE-B', subject: 'FT&DC' },
        { time: '1:00-2:00', class: 'II Year EEE-B', subject: 'PP' },
        { time: '2:00-3:00', class: 'II Year EEE-B', subject: 'PP LAB' }
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'II Year EEE-B', subject: 'PP' },
        { time: '10:00-11:00', class: 'II Year EEE-B', subject: 'AE' },
        { time: '11:10-12:10', class: 'II Year EEE-B', subject: 'ECA' },
        { time: '2:00-3:00', class: 'II Year EEE-B', subject: 'SFCVT' }
      ],
      'WED': [
        { time: '9:00-10:00', class: 'II Year EEE-B', subject: 'AE' },
        { time: '10:00-11:00', class: 'II Year EEE-B', subject: 'ECA Lab(B2)' },
        { time: '11:10-12:10', class: 'II Year EEE-B', subject: 'SFCVT' },
        { time: '1:00-2:00', class: 'II Year EEE-B', subject: 'PRE-PLACEMENT TRAINING' },
        { time: '2:00-3:00', class: 'II Year EEE-B', subject: 'ECA Lab(B1)' },
        { time: '3:00-4:00', class: 'II Year EEE-B', subject: 'MBC/VAC/LIBRARY' }
      ],
      'THU': [
        { time: '9:00-10:00', class: 'II Year EEE-B', subject: 'COI' },
        { time: '10:00-11:00', class: 'II Year EEE-B', subject: 'FT&DC' },
        { time: '11:10-12:10', class: 'II Year EEE-B', subject: 'AE' }
      ],
      'FRI': [
        { time: '10:00-11:00', class: 'II Year EEE-B', subject: 'FT&DC' },
        { time: '2:00-3:00', class: 'II Year EEE-B', subject: 'FT&DC' },
        { time: '3:00-4:00', class: 'II Year EEE-B', subject: 'ECA(T)' }
      ],
      'SAT': [
        { time: '9:00-10:00', class: 'II Year EEE-B', subject: 'Pre-Placement Training' },
        { time: '10:00-11:00', class: 'II Year EEE-B', subject: 'COI' },
        { time: '3:00-4:00', class: 'II Year EEE-B', subject: 'FT&DC(T)' }
      ]
    }
  },
  'LH-6': {
    name: 'Lecture Hall 6',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'III Year EEE-A', subject: 'PE' },
        { time: '10:00-11:00', class: 'III Year EEE-A', subject: 'MPMC Lab' },
        { time: '11:10-12:10', class: 'III Year EEE-A', subject: 'JAVAP' },
        { time: '1:00-2:00', class: 'III Year EEE-A', subject: 'PS-II' },
        { time: '2:00-3:00', class: 'III Year EEE-A', subject: 'CO' },
        { time: '3:00-4:00', class: 'III Year EEE-A', subject: 'PS-II/PE' }
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'III Year EEE-A', subject: 'CO' },
        { time: '10:00-11:00', class: 'III Year EEE-A', subject: 'PS-II' },
        { time: '11:10-12:10', class: 'III Year EEE-A', subject: 'PE' },
        { time: '1:00-2:00', class: 'III Year EEE-A', subject: 'JAVAP' },
        { time: '2:00-3:00', class: 'III Year EEE-A', subject: 'MPMC Lab' }
      ],
      'WED': [
        { time: '9:00-10:00', class: 'III Year EEE-A', subject: 'MPMC' },
        { time: '10:00-11:00', class: 'III Year EEE-A', subject: 'PE' },
        { time: '11:10-12:10', class: 'III Year EEE-A', subject: 'CO' },
        { time: '3:00-4:00', class: 'III Year EEE-A', subject: 'Library' }
      ],
      'THU': [
        { time: '10:00-11:00', class: 'III Year EEE-A', subject: 'PLACEMENTS TRAINING' },
        { time: '11:10-12:10', class: 'III Year EEE-A', subject: 'Library' },
        { time: '2:00-3:00', class: 'III Year EEE-A', subject: 'MPMC Lab' }
      ],
      'FRI': [
        { time: '9:00-10:00', class: 'III Year EEE-A', subject: 'PE' },
        { time: '10:00-11:00', class: 'III Year EEE-A', subject: 'MPMC' },
        { time: '1:00-2:00', class: 'III Year EEE-A', subject: 'PLACEMENTS TRAINING' },
        { time: '2:00-3:00', class: 'III Year EEE-A', subject: 'PE' }
      ],
      'SAT': [
        { time: '3:00-4:00', class: 'III Year EEE-A', subject: 'Sports' }
      ]
    }
  },
  'S8': {
    name: 'S Block - Room 8',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'II Year CSE(DS)-B', subject: 'DLD' },
        { time: '10:00-11:00', class: 'II Year CSE(DS)-B', subject: 'P&S' },
        { time: '11:10-12:10', class: 'II Year CSE(DS)-B', subject: 'DAA' },
        { time: '1:00-2:00', class: 'II Year CSE(DS)-B', subject: 'DAA' },
        { time: '2:00-3:00', class: 'II Year CSE(DS)-B', subject: 'DBMS Lab' }
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'II Year CSE(DS)-B', subject: 'DBMS' },
        { time: '10:00-11:00', class: 'II Year CSE(DS)-B', subject: 'Pre Placement Training' },
        { time: '11:10-12:10', class: 'II Year CSE(DS)-B', subject: 'Library' },
        { time: '1:00-2:00', class: 'II Year CSE(DS)-B', subject: 'P&S' },
        { time: '2:00-3:00', class: 'II Year CSE(DS)-B', subject: 'PP/ITWS Lab' }
      ],
      'WED': [
        { time: '9:00-10:00', class: 'II Year CSE(DS)-B', subject: 'PP' },
        { time: '10:00-11:00', class: 'II Year CSE(DS)-B', subject: 'DLD' },
        { time: '11:10-12:10', class: 'II Year CSE(DS)-B', subject: 'DLD' },
        { time: '1:00-2:00', class: 'II Year CSE(DS)-B', subject: 'COI' },
        { time: '2:00-3:00', class: 'II Year CSE(DS)-B', subject: 'PP/ITWS Lab' }
      ],
      'THU': [
        { time: '9:00-10:00', class: 'II Year CSE(DS)-B', subject: 'PP' },
        { time: '10:00-11:00', class: 'II Year CSE(DS)-B', subject: 'PP/ITWS Lab' },
        { time: '11:10-12:10', class: 'II Year CSE(DS)-B', subject: 'DBMS' },
        { time: '1:00-2:00', class: 'II Year CSE(DS)-B', subject: 'Library' }
      ],
      'FRI': [
        { time: '9:00-10:00', class: 'II Year CSE(DS)-B', subject: 'COI' },
        { time: '10:00-11:00', class: 'II Year CSE(DS)-B', subject: 'DBMS' },
        { time: '11:10-12:10', class: 'II Year CSE(DS)-B', subject: 'DAA' },
        { time: '1:00-2:00', class: 'II Year CSE(DS)-B', subject: 'DAA(T)' },
        { time: '2:00-3:00', class: 'II Year CSE(DS)-B', subject: 'DBMS(T)' },
        { time: '3:00-4:00', class: 'II Year CSE(DS)-B', subject: 'Sports' }
      ],
      'SAT': [
        { time: '3:00-4:00', class: 'II Year CSE(DS)-B', subject: 'Library' }
      ]
    }
  },
  'LH-14': {
    name: 'Lecture Hall 14',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'III Year CSE(AI&ML)-B', subject: 'DMDW' },
        { time: '10:00-11:00', class: 'III Year CSE(AI&ML)-B', subject: 'ML' },
        { time: '11:10-12:10', class: 'III Year CSE(AI&ML)-B', subject: 'DMDW' },
        { time: '1:00-2:00', class: 'III Year CSE(AI&ML)-B', subject: 'CN' },
        { time: '2:00-3:00', class: 'III Year CSE(AI&ML)-B', subject: 'Pre Placement Training' }
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'III Year CSE(AI&ML)-B', subject: 'FSD' },
        { time: '10:00-11:00', class: 'III Year CSE(AI&ML)-B', subject: 'ML Lab' },
        { time: '11:10-12:10', class: 'III Year CSE(AI&ML)-B', subject: 'FSD(T)' },
        { time: '1:00-2:00', class: 'III Year CSE(AI&ML)-B', subject: 'ML' }
      ],
      'WED': [
        { time: '9:00-10:00', class: 'III Year CSE(AI&ML)-B', subject: 'CN' },
        { time: '10:00-11:00', class: 'III Year CSE(AI&ML)-B', subject: 'CC' },
        { time: '11:10-12:10', class: 'III Year CSE(AI&ML)-B', subject: 'FSD' },
        { time: '2:00-3:00', class: 'III Year CSE(AI&ML)-B', subject: 'FSD/CN Lab' }
      ],
      'THU': [
        { time: '9:00-10:00', class: 'III Year CSE(AI&ML)-B', subject: 'CC' },
        { time: '10:00-11:00', class: 'III Year CSE(AI&ML)-B', subject: 'CN' },
        { time: '2:00-3:00', class: 'III Year CSE(AI&ML)-B', subject: 'Pre Placement Training' }
      ],
      'FRI': [
        { time: '9:00-10:00', class: 'III Year CSE(AI&ML)-B', subject: 'ML' },
        { time: '2:00-3:00', class: 'III Year CSE(AI&ML)-B', subject: 'FSD/CN Lab' },
        { time: '3:00-4:00', class: 'III Year CSE(AI&ML)-B', subject: 'Library' }
      ],
      'SAT': [
        { time: '3:00-4:00', class: 'III Year CSE(AI&ML)-B', subject: 'Sports' }
      ]
    }
  },
  'LH-15': {
    name: 'Lecture Hall 15',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'III Year CSE(DS)', subject: 'FSD' },
        { time: '10:00-11:00', class: 'III Year CSE(DS)', subject: 'Pre Placement Training' },
        { time: '11:10-12:10', class: 'III Year CSE(DS)', subject: 'FSD/CN Lab' },
        { time: '1:00-2:00', class: 'III Year CSE(DS)', subject: 'FSD' }
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'III Year CSE(DS)', subject: 'BI' },
        { time: '10:00-11:00', class: 'III Year CSE(DS)', subject: 'CN' },
        { time: '11:10-12:10', class: 'III Year CSE(DS)', subject: 'CC' },
        { time: '1:00-2:00', class: 'III Year CSE(DS)', subject: 'Pre Placement Training' },
        { time: '2:00-3:00', class: 'III Year CSE(DS)', subject: 'ML' }
      ],
      'WED': [
        { time: '9:00-10:00', class: 'III Year CSE(DS)', subject: 'ML' },
        { time: '10:00-11:00', class: 'III Year CSE(DS)', subject: 'FSD/CN Lab' },
        { time: '11:10-12:10', class: 'III Year CSE(DS)', subject: 'FSD' }
      ],
      'THU': [
        { time: '9:00-10:00', class: 'III Year CSE(DS)', subject: 'CC' },
        { time: '2:00-3:00', class: 'III Year CSE(DS)', subject: 'Dept Activities' }
      ],
      'FRI': [
        { time: '9:00-10:00', class: 'III Year CSE(DS)', subject: 'BI' },
        { time: '10:00-11:00', class: 'III Year CSE(DS)', subject: 'BI' },
        { time: '11:10-12:10', class: 'III Year CSE(DS)', subject: 'CC' },
        { time: '1:00-2:00', class: 'III Year CSE(DS)', subject: 'FSD(T)' },
        { time: '2:00-3:00', class: 'III Year CSE(DS)', subject: 'CN' },
        { time: '3:00-4:00', class: 'III Year CSE(DS)', subject: 'ML Lab' }
      ],
      'SAT': [
        { time: '3:00-4:00', class: 'III Year CSE(DS)', subject: 'Sports' }
      ]
    }
  },
  'S10': {
    name: 'Silver Jubilee Block - Floor 1',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'IV Year CSE-C', subject: 'BSPC' },
        { time: '10:00-11:00', class: 'IV Year CSE-C', subject: 'FM' },
        { time: '11:10-12:10', class: 'IV Year CSE-C', subject: 'DSUR' },
        { time: '1:00-2:00', class: 'IV Year CSE-C', subject: 'Project Phase-I' }
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'III Year CSE(AI&ML)-B', subject: 'FSD' },
        { time: '10:00-11:00', class: 'IV Year CSE-C', subject: 'DL' },
        { time: '11:10-12:10', class: 'IV Year CSE-C', subject: 'CNS' },
        { time: '1:00-2:00', class: 'IV Year CSE-C', subject: 'Project Phase-I' }
      ],
      'WED': [
        { time: '9:00-10:00', class: 'IV Year CSE-C', subject: 'DL' },
        { time: '10:00-11:00', class: 'IV Year CSE-C', subject: 'BSPC' },
        { time: '11:10-12:10', class: 'IV Year CSE-C', subject: 'CNS' }
      ],
      'THU': [
        { time: '9:00-10:00', class: 'IV Year CSE-C', subject: 'CNS' },
        { time: '10:00-11:00', class: 'IV Year CSE-C', subject: 'DL' },
        { time: '11:10-12:10', class: 'IV Year CSE-C', subject: 'FM' },
      ],
      'FRI': [
        { time: '11:10-12:10', class: 'IV Year CSE-C', subject: 'FM' },
        { time: '1:00-2:00', class: 'IV Year CSE-C', subject: 'BSPC' },
        { time: '2:00-3:00', class: 'IV Year CSE-C', subject: 'DSUR' }
      ],
      'SAT': [
        { time: '3:00-4:00', class: 'IV Year CSE-C', subject: 'Library' }
      ]
    }
  },
  'D406': {
    name: 'ECE Block - Floor 4',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'IV Year CSE-C', subject: 'BSPC' },
        { time: '10:00-11:00', class: 'IV Year CSE-C', subject: 'FM' },
        { time: '11:10-12:10', class: 'IV Year CSE-C', subject: 'DSUR' },
        { time: '1:00-2:00', class: 'IV Year CSE-C', subject: 'Project Phase-I' }
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'IV Year CSE-C', subject: 'DSUR' },
        { time: '10:00-11:00', class: 'IV Year CSE-C', subject: 'DL' },
        { time: '11:10-12:10', class: 'IV Year CSE-C', subject: 'CNS' },
        { time: '1:00-2:00', class: 'IV Year CSE-C', subject: 'Project Phase-I' }
      ],
      'WED': [
        { time: '9:00-10:00', class: 'IV Year CSE-C', subject: 'DL' },
        { time: '10:00-11:00', class: 'IV Year CSE-C', subject: 'BSPC' },
        { time: '11:10-12:10', class: 'IV Year CSE-C', subject: 'CNS' }
      ],
      'THU': [
        { time: '9:00-10:00', class: 'IV Year CSE-C', subject: 'CNS' },
        { time: '10:00-11:00', class: 'IV Year CSE-C', subject: 'DL' },
        { time: '11:10-12:10', class: 'IV Year CSE-C', subject: 'FM' },
      ],
      'FRI': [
        { time: '11:10-12:10', class: 'IV Year CSE-C', subject: 'FM' },
        { time: '1:00-2:00', class: 'IV Year CSE-C', subject: 'BSPC' },
        { time: '2:00-3:00', class: 'IV Year CSE-C', subject: 'DSUR' }
      ],
      'SAT': [
        { time: '3:00-4:00', class: 'IV Year CSE-C', subject: 'Library' }
      ]
    }
  },
  'LH-7': {
    name: 'Lecture Hall 7',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'III Year CSE-C', subject: 'CC' },
        { time: '10:00-11:00', class: 'III Year CSE-C', subject: 'AI' },
        { time: '11:10-12:10', class: 'III Year CSE-C', subject: 'ML' },
        { time: '1:00-2:00', class: 'III Year CSE-C', subject: 'FSD' },
        { time: '2:00-3:00', class: 'III Year CSE-C', subject: 'FSD(B1)/CN(B2) Lab' }
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'III Year CSE-C', subject: 'CN' },
        { time: '10:00-11:00', class: 'III Year CSE-C', subject: 'AI' },
        { time: '11:10-12:10', class: 'III Year CSE-C', subject: 'CN' },
        { time: '2:00-3:00', class: 'III Year CSE-C', subject: 'Pre Placement Training' }
      ],
      'WED': [
        { time: '9:00-10:00', class: 'III Year CSE-C', subject: 'AI' },
        { time: '10:00-11:00', class: 'III Year CSE-C', subject: 'ML Lab' },
        { time: '11:10-12:10', class: 'III Year CSE-C', subject: 'FSD' },
        { time: '2:00-3:00', class: 'III Year CSE-C', subject: 'CC' }
      ],
      'THU': [
        { time: '9:00-10:00', class: 'III Year CSE-C', subject: 'ML' },
        { time: '10:00-11:00', class: 'III Year CSE-C', subject: 'CN(B1)/FSD(B2) Lab' },
        { time: '1:00-2:00', class: 'III Year CSE-C', subject: 'CC' },
        { time: '2:00-3:00', class: 'III Year CSE-C', subject: 'Department Activities' }
      ],
      'FRI': [
        { time: '9:00-10:00', class: 'III Year CSE-C', subject: 'FSD(T)' },
        { time: '10:00-11:00', class: 'III Year CSE-C', subject: 'Pre Placement Training' },
        { time: '11:10-12:10', class: 'III Year CSE-C', subject: 'CN' },
        { time: '1:00-2:00', class: 'III Year CSE-C', subject: 'AI' },
        { time: '2:00-3:00', class: 'III Year CSE-C', subject: 'ML' }
      ],
      'SAT': [
        { time: '9:00-10:00', class: 'III Year CSE-C', subject: 'FSD' },
        { time: '3:00-4:00', class: 'III Year CSE-C', subject: 'Library' }
      ]
    }
  },
  'LH-8': {
    name: 'Lecture Hall 8',
    schedule: {
      'MON': [
        { time: '9:00-10:00', class: 'III Year CSE-D', subject: 'ML' },
        { time: '10:00-11:00', class: 'III Year CSE-D', subject: 'FSD(B1)/CN(B2) Lab' },
        { time: '11:10-12:10', class: 'III Year CSE-D', subject: 'FSD' },
        { time: '1:00-2:00', class: 'III Year CSE-D', subject: 'AI' },
        { time: '2:00-3:00', class: 'III Year CSE-D', subject: 'Department Activities' }
      ],
      'TUE': [
        { time: '9:00-10:00', class: 'III Year CSE-D', subject: 'CC' },
        { time: '10:00-11:00', class: 'III Year CSE-D', subject: 'AI' },
        { time: '11:10-12:10', class: 'III Year CSE-D', subject: 'CN' },
        { time: '2:00-3:00', class: 'III Year CSE-D', subject: 'FSD' }
      ],
      'WED': [
        { time: '9:00-10:00', class: 'III Year CSE-D', subject: 'CN' },
        { time: '10:00-11:00', class: 'III Year CSE-D', subject: 'ML Lab' },
        { time: '11:10-12:10', class: 'III Year CSE-D', subject: 'ML' },
        { time: '1:00-2:00', class: 'III Year CSE-D', subject: 'FSD(T)' },
        { time: '2:00-3:00', class: 'III Year CSE-D', subject: 'Pre Placement Training' }
      ],
      'THU': [
        { time: '9:00-10:00', class: 'III Year CSE-D', subject: 'AI' },
        { time: '10:00-11:00', class: 'III Year CSE-D', subject: 'ML' },
        { time: '11:10-12:10', class: 'III Year CSE-D', subject: 'CC' }
      ],
      'FRI': [
        { time: '9:00-10:00', class: 'III Year CSE-D', subject: 'FSD' },
        { time: '10:00-11:00', class: 'III Year CSE-D', subject: 'CN(B1)/FSD(B2) Lab' },
        { time: '1:00-2:00', class: 'III Year CSE-D', subject: 'CN' },
        { time: '2:00-3:00', class: 'III Year CSE-D', subject: 'CC' }
      ],
      'SAT': [
        { time: '3:00-4:00', class: 'III Year CSE-D', subject: 'Library' }
      ]
    }
  }
};
// ...existing code...

const ClassroomOccupancy = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState('MON');
  const [selectedRoom, setSelectedRoom] = useState('LH-1');
  const [bookingRequest, setBookingRequest] = useState({
    room: '',
    date: '',
    timeSlot: '',
    purpose: '',
    requestedBy: ''
  });
  const [bookings, setBookings] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const timeSlots = [
    '9:00-10:00', '10:00-11:00', '11:10-12:10',
    '1:00-2:00', '2:00-3:00', '3:00-4:00'
  ];

  // Load bookings from localStorage on mount
  useEffect(() => {
    const savedBookings = localStorage.getItem('roomBookings');
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    }
  }, []);

  // Save bookings to localStorage whenever they change
  useEffect(() => {
    if (bookings.length > 0) {
      localStorage.setItem('roomBookings', JSON.stringify(bookings));
    }
  }, [bookings]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getCurrentDayName = () => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[currentTime.getDay()];
  };

  const getCurrentTimeSlot = () => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const time = hour * 60 + minute;

    if (time >= 540 && time < 600) return '9:00-10:00';
    if (time >= 600 && time < 670) return '10:00-11:00';
    if (time >= 670 && time < 730) return '11:10-12:10';
    if (time >= 780 && time < 840) return '1:00-2:00';
    if (time >= 840 && time < 900) return '2:00-3:00';
    if (time >= 900 && time < 960) return '3:00-4:00';
    return null;
  };

  const isRoomOccupied = (room, day, timeSlot) => {
    const schedule = timetableData[room]?.schedule[day];
    if (!schedule) return false;
    return schedule.some(slot => slot.time === timeSlot);
  };

  const getRoomStatus = (room, day, timeSlot) => {
    const schedule = timetableData[room]?.schedule[day];
    if (!schedule) return null;
    return schedule.find(slot => slot.time === timeSlot);
  };

  const getAvailableRooms = (day, timeSlot) => {
    return Object.keys(timetableData).filter(room => 
      !isRoomOccupied(room, day, timeSlot)
    );
  };

  const handleBookingSubmit = () => {
    if (!bookingRequest.room || !bookingRequest.date || !bookingRequest.timeSlot || 
        !bookingRequest.purpose || !bookingRequest.requestedBy) {
      alert('Please fill all fields');
      return;
    }
    
    const newBooking = {
      ...bookingRequest,
      id: Date.now(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
      requestedByRole: user.role
    };
    setBookings([...bookings, newBooking]);
    setShowBookingForm(false);
    setBookingRequest({
      room: '',
      date: '',
      timeSlot: '',
      purpose: '',
      requestedBy: ''
    });
    alert('Booking request submitted! Waiting for admin approval.');
  };

  const approveBooking = (id) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === id ? { ...booking, status: 'approved' } : booking
    );
    setBookings(updatedBookings);
    localStorage.setItem('roomBookings', JSON.stringify(updatedBookings));
  };

  const rejectBooking = (id) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === id ? { ...booking, status: 'rejected' } : booking
    );
    setBookings(updatedBookings);
    localStorage.setItem('roomBookings', JSON.stringify(updatedBookings));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentDay = getCurrentDayName();
  const currentSlot = getCurrentTimeSlot();
  const availableNow = getAvailableRooms(currentDay, currentSlot || timeSlots[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="text-indigo-600" />
                GNITS Classroom Occupancy System
              </h1>
              <p className="text-gray-600 mt-2">Real-time classroom availability tracking</p>
              <p className="text-sm text-indigo-600 mt-1">Logged in as: <span className="font-semibold capitalize">{user?.role}</span></p>
            </div>
            <div className="text-right space-y-2">
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
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="text-indigo-600" />
                <span className="font-semibold">{currentTime.toLocaleTimeString()}</span>
              </div>
              <div className="text-sm text-gray-600">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-600" />
              Available Rooms Now
            </h2>
            {currentSlot ? (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-3">
                  Current Slot: <span className="font-semibold text-indigo-600">{currentSlot}</span>
                </div>
                {availableNow.length > 0 ? (
                  availableNow.map(room => (
                    <div key={room} className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="font-semibold text-green-800">{room}</div>
                      <div className="text-sm text-green-600">{timetableData[room].name}</div>
                    </div>
                  ))
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600">No rooms available at this time</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">Classes not in session</p>
            )}
            {user?.role === 'faculty' && (
              <button
                onClick={() => setShowBookingForm(true)}
                className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Request Room Booking
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle className="text-blue-600" />
              {user?.role === 'admin' ? 'Pending Booking Requests (Admin)' : 'My Booking Requests'}
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {user?.role === 'admin' ? (
                // Admin view: Show all pending bookings with approve/reject buttons
                bookings.filter(b => b.status === 'pending').length > 0 ? (
                  bookings.filter(b => b.status === 'pending').map(booking => (
                    <div key={booking.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="font-semibold text-gray-800">{booking.room} - {timetableData[booking.room]?.name}</div>
                      <div className="text-sm text-gray-600">{booking.timeSlot} - {booking.date}</div>
                      <div className="text-sm text-gray-600">Requested by: {booking.requestedBy}</div>
                      <div className="text-sm text-gray-600">Purpose: {booking.purpose}</div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => approveBooking(booking.id)}
                          className="flex-1 bg-green-600 text-white py-1 rounded text-sm hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectBooking(booking.id)}
                          className="flex-1 bg-red-600 text-white py-1 rounded text-sm hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm">No pending requests</p>
                )
              ) : (
                // Faculty view: Show their own bookings with status
                bookings.length > 0 ? (
                  bookings.map(booking => (
                    <div 
                      key={booking.id} 
                      className={`border rounded-lg p-3 ${
                        booking.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                        booking.status === 'approved' ? 'bg-green-50 border-green-200' :
                        'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="font-semibold text-gray-800">{booking.room} - {timetableData[booking.room]?.name}</div>
                      <div className="text-sm text-gray-600">{booking.timeSlot} - {booking.date}</div>
                      <div className="text-sm text-gray-600">Purpose: {booking.purpose}</div>
                      <div className={`text-sm font-semibold mt-1 ${
                        booking.status === 'pending' ? 'text-yellow-700' :
                        booking.status === 'approved' ? 'text-green-700' :
                        'text-red-700'
                      }`}>
                        Status: <span className="capitalize">{booking.status}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm">No booking requests yet</p>
                )
              )}
            </div>
            {user?.role === 'admin' && bookings.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all booking data?')) {
                    setBookings([]);
                    localStorage.removeItem('roomBookings');
                  }
                }}
                className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm"
              >
                Clear All Bookings
              </button>
            )}
          </div>
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Request Room Booking</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Room</label>
                  <select
                    value={bookingRequest.room}
                    onChange={(e) => setBookingRequest({...bookingRequest, room: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Room</option>
                    {Object.keys(timetableData).map(room => (
                      <option key={room} value={room}>{room} - {timetableData[room].name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={bookingRequest.date}
                    onChange={(e) => setBookingRequest({...bookingRequest, date: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time Slot</label>
                  <select
                    value={bookingRequest.timeSlot}
                    onChange={(e) => setBookingRequest({...bookingRequest, timeSlot: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Time Slot</option>
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Your Name</label>
                  <input
                    type="text"
                    value={bookingRequest.requestedBy}
                    onChange={(e) => setBookingRequest({...bookingRequest, requestedBy: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Purpose</label>
                  <textarea
                    value={bookingRequest.purpose}
                    onChange={(e) => setBookingRequest({...bookingRequest, purpose: e.target.value})}
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleBookingSubmit}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                  >
                    Submit Request
                  </button>
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule View */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="text-indigo-600" />
              Weekly Schedule
            </h2>
            <div className="flex gap-2">
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="border rounded px-3 py-2"
              >
                {Object.keys(timetableData).map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left font-semibold">Time</th>
                  {days.map(day => (
                    <th key={day} className={`border p-2 font-semibold ${day === currentDay ? 'bg-indigo-100' : ''}`}>
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(slot => (
                  <tr key={slot}>
                    <td className="border p-2 font-medium text-sm bg-gray-50">{slot}</td>
                    {days.map(day => {
                      const status = getRoomStatus(selectedRoom, day, slot);
                      const isCurrentSlot = day === currentDay && slot === currentSlot;
                      return (
                        <td 
                          key={day} 
                          className={`border p-2 text-sm ${
                            isCurrentSlot ? 'ring-2 ring-indigo-500' : ''
                          } ${status ? 'bg-red-50' : 'bg-green-50'}`}
                        >
                          {status ? (
                            <div>
                              <div className="font-semibold text-red-700">{status['class']}</div>
                              <div className="text-xs text-red-600">{status.subject}</div>
                            </div>
                          ) : (
                            <div className="text-green-600 font-semibold">Available</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border border-green-200"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 ring-2 ring-indigo-500"></div>
              <span>Current Time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomOccupancy;