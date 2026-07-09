export interface SlideImage {
  url: string;
  alt: string;
  slideNumber: number;
}

export interface LeadershipRole {
  role: string;
  organization: string;
}

export interface BoardMembership {
  role: string;
  organization: string;
}

export interface AcademicAppointment {
  role: string;
  institution: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
}

export interface MediaLink {
  platform: string;
  label: string;
  url: string;
  description: string;
}
