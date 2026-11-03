import type { Metadata } from "next";
import { ContactView } from "./ContactView";

export const metadata: Metadata = {
  title: "Contact — void/ui",
  description: "Book a call or send a message about void/ui, a project, or anything else.",
};

export default function ContactPage() {
  return <ContactView />;
}
