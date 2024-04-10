export enum Role {
  Admin = 'admin',
  Student = 'student',
  Lecturer = 'lecturer',
}

export enum InstitutionType {
  University = 'university',
  Polytechnic = 'polytechnic',
  College = 'college',
}

export enum CourseCategory {
  Required = 'required',
  Elective = 'elective',
  Compulsory = 'compulsory',
}

export enum ClassMode {
  Physical = 'physical',
  Online = 'online',
}

export enum ClassFrequency {
  Weekly = 'weekly',
  OneOff = 'one-off',
}

export enum ClassStatus {
  Pending = 'pending',
  Held = 'held',
  Cancelled = 'cancelled',
  OnGoinging = 'ongoing',
}

export enum CronJobFreq {
  Daily = 'daily',
  Weekly = 'weekly',
}

export enum NotificationType {
  ClassStarted = 'class-started',
}
