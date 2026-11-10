// Everything the developer portfolio shows comes from one `PortfolioData` object, so a user swaps
// the data, not the markup. Every list can be empty; its section then hides itself.

export type SocialPlatform = "github" | "x" | "linkedin" | "instagram" | "email" | "website" | "youtube" | "leetcode";

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  url: string;
}

export interface PortfolioProfile {
  name: string;
  /** e.g. "Design Engineer" */
  role: string;
  /** Where they work now; empty for freelancers. */
  company?: string;
  companyUrl?: string;
  location: string;
  /** IANA zone for the live local clock, e.g. "Asia/Kolkata". */
  timezone: string;
  /** Image URL. Without one the hero shows initials. */
  avatar?: string;
  /** Wide banner image above the profile. Without one a dotted panel shows. */
  cover?: string;
  /** Looping, muted banner video. `cover` shows until it can play, then it fades in. */
  coverVideo?: string;
  /** CSS object-position for the banner crop, e.g. "center 60%". Default "center". */
  coverPosition?: string;
  /** Handle shown in mono under the name, e.g. "@alexrivera". */
  handle?: string;
  /** Shows a verified badge next to the name. */
  verified?: boolean;
  /** One line under the name, e.g. "Engineer | AI | Freelancer". */
  tagline: string;
  /** Words inside the tagline to underline by hand, e.g. "crazy looking softwares". */
  taglineEmphasis?: string;
  /** What they're building now, shown under the handle and in the sidebar. */
  building?: { label: string; url?: string };
  /** Short note next to the booking button, e.g. "30 minutes, no strings." */
  bookingNote?: string;
  /** Shows the "Available for work" status. */
  available: boolean;
  email: string;
  /** Booking link (Cal.com, Calendly…). Hides the button when empty. */
  bookingUrl?: string;
  /** Cal.com "user/event" slug. Embeds the booking calendar in the contact section. */
  calLink?: string;
}

export interface ResumeLink {
  label: string;
  url: string;
}

export interface StackGroup {
  label: string;
  items: string[];
}

export interface ExperienceRole {
  title: string;
  /** "Full-time", "Part-time", "Contract", "Internship"… */
  type: string;
  /** "YYYY-MM" */
  start: string;
  /** "YYYY-MM", or omitted while current. */
  end?: string;
  bullets: string[];
  tags: string[];
}

export type ExperienceIcon = "terminal" | "rocket" | "briefcase" | "code";

export interface Experience {
  company: string;
  url?: string;
  /** Logo image URL. */
  logo?: string;
  /** Icon for the tile when there's no logo; falls back to the first letter. */
  icon?: ExperienceIcon;
  location: string;
  /** "Remote", "On-site", "Hybrid" */
  mode: string;
  roles: ExperienceRole[];
}

export interface Project {
  name: string;
  description: string;
  /** Screenshot URL (16:9 works best). Without one a lined placeholder shows. */
  image?: string;
  /** "YYYY-MM". Leave out to hide the dates. */
  start?: string;
  end?: string;
  tags: string[];
  liveUrl?: string;
  sourceUrl?: string;
}

export type RecognitionKind = "Award" | "Hackathon" | "Certificate" | "Open source";

export interface Recognition {
  title: string;
  kind: RecognitionKind;
  issuer: string;
  /** "YYYY-MM". Leave out to hide it. */
  date?: string;
  url?: string;
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  start: string;
  end?: string;
}

export interface Post {
  title: string;
  /** "YYYY-MM-DD" */
  date: string;
  readMinutes: number;
  /** One or two sentences under the title. */
  summary?: string;
  url: string;
}

/** A highlighted profile card in the hero, e.g. an X account or a community. */
export interface FeaturedCard {
  platform: SocialPlatform | "community";
  title: string;
  subtitle: string;
  /** Button label, e.g. "Follow" or "Join". */
  action: string;
  url: string;
  /** Marks the subtitle with a live dot. */
  live?: boolean;
  /** Shows a verified badge next to the title. */
  verified?: boolean;
}

export interface PortfolioData {
  profile: PortfolioProfile;
  /** Hero bullet points. Wrap words in **double asterisks** to bold them. */
  intro: string[];
  featured: FeaturedCard[];
  socials: SocialLink[];
  resumes: ResumeLink[];
  /** Paragraphs under the greeting. */
  about: string[];
  /** One short clause inside `about` to highlight by hand (≤ ~15 words). */
  aboutHighlight?: string;
  /** GitHub repo or profile for the "Open-source" pill in the header. */
  openSourceUrl?: string;
  stack: StackGroup[];
  experience: Experience[];
  projects: Project[];
  /** Link for "All projects"; hides it when empty. */
  projectsUrl?: string;
  /** Short handwritten sticky note beside the projects (≤ 12 words); hidden when empty. */
  projectsNote?: string;
  /** GitHub username for the contribution graph. */
  githubUsername: string;
  recognition: Recognition[];
  education: Education[];
  posts: Post[];
  /** Link for "All posts"; hides it when empty. */
  blogUrl?: string;
}
