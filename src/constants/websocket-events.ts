const WsEvents = {
  StartClass: 'start-class',
  JoinClass: 'join-class',
  JoinClassAck: 'join-class-acknowledged',
  StudentJoinedClass: 'student-joined-class',
  TakeAttendance: 'take-attendance',
  AtttendanceInitiated: 'attendance-initiated',
  HaltAttendance: 'halt-attendance',
  AttendanceStopped: 'attendance-stopped',
  EndClass: 'end-class',
  ClassEnded: 'class-ended',
  EndClassAck: 'end-class-acknowledged',
  FetchOnGoingClass: 'fetch-ongoing-class'
};


export default WsEvents;
