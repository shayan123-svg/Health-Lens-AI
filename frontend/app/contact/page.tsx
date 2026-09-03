import { ContactForm } from "@/components/contact-form";
import { MarketingNav } from "@/components/marketing";
export default function ContactPage() { return <main><MarketingNav /><section className="wrap section" style={{maxWidth:820}}><p className="eyebrow">Talk to the team</p><h1 className="page-title" style={{fontSize:"clamp(3rem,6vw,5.2rem)"}}>We&apos;d like to hear from you.</h1><p className="lede">Share feedback about the HealthLens AI prototype, report an issue, or ask about the planned product.</p><ContactForm /></section></main>; }
