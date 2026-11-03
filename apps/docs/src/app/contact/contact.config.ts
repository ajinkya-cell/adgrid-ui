// Everything the contact page shows about you lives here, so links can change in one place.
export const CONTACT = {
  name: "Ajinkya Dharkar",
  role: "Building void/ui",
  photo: "/previews/cartoon.jpeg",
  timezone: "Asia/Kolkata",
  place: "India",
  // Working hours in `timezone`, used for the available/away dot. Mon–Fri.
  hours: { start: 10, end: 19 },
  email: "ajinkyadharkar88@gmail.com",
  calLink: "ajinkya-dharkar-oqbbdf/let-s-chat",
  socials: {
    github: "https://github.com/ajinkya-cell",
    linkedin: "https://www.linkedin.com/in/ajinkya-dharkar-a844b1258/",
    x: "https://x.com/ajinkyacell",
  },
  topics: [
    { value: "project", label: "Project" },
    { value: "collab", label: "Collab" },
    { value: "hey", label: "Just a hey" },
  ],
} as const;

export type ContactTopic = (typeof CONTACT.topics)[number]["value"];
