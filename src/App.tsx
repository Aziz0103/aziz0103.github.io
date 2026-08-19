"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "./siteConfig";

const navItems = [["Home", "#home"], ["About", "#about"], ["Experience", "#experience"], ["Projects", "#projects"], ["Skills", "#skills"], ["Contact", "#contact"]] as const;

const projects = [
  { number: "01", title: "AML & Lending Workflow Modernization", summary: "Modernized pre-approved client, loan application, protocol, scoring, status, and reporting workflows—moving critical work from spreadsheets into structured APIs and database processes.", problem: "Manual, Excel-driven steps made a complex lending flow difficult to validate and evolve.", contribution: "Designed backend workflows, mapped financial rules, and connected external synchronization with existing operations.", approach: "Incremental modernization with compatibility safeguards for legacy Oracle environments.", lesson: "In financial systems, preserving business behavior is as important as improving the architecture.", tech: ["C#", "ASP.NET Core", "EF", "Oracle", "ClosedXML"] },
  { number: "02", title: "Multi-Provider Payment Gateway", summary: "Integrated an internal payment platform with multiple banks, wallets, and service providers across differing contracts and authentication schemes.", problem: "Each provider returned different payloads, statuses, and failure modes.", contribution: "Implemented and diagnosed provider integrations, transaction flows, mappings, and operational logging.", approach: "Isolated adapters, explicit contracts, resilient HTTP calls, and consistent internal transaction states.", lesson: "Observability and predictable failure handling are core payment features, not optional extras.", tech: ["ASP.NET Core", "REST", "SOAP", "JWT", "PostgreSQL", "EF Core"] },
  { number: "03", title: "Legacy Payment Processor Migration", summary: "Helped redesign a manually controlled Windows Forms payment processor as a modern ASP.NET Core API with clearer operational boundaries.", problem: "Business logic, persistence, and process control were tightly coupled inside a desktop application.", contribution: "Extracted rules, shaped the API flow, and separated controller, service, and repository responsibilities.", approach: "Optional database support, dependency injection, explicit currency conversion, and testable service boundaries.", lesson: "A safe migration starts by understanding why the legacy behavior exists before replacing it.", tech: [".NET Framework", ".NET 8", "ASP.NET Core", "MySQL", "HttpClient"] },
  { number: "04", title: "Banking Reporting & Data Automation", summary: "Built Oracle queries and .NET utilities to extract, validate, transform, and export financial and customer data for recurring reporting.", problem: "Historical data rules and repetitive manual steps created slow, error-prone reporting cycles.", contribution: "Composed complex queries, deduplicated records, handled date logic, and automated Excel outputs.", approach: "Database-first validation with compatibility-aware SQL for older Oracle versions.", lesson: "Correct reporting depends on making every business assumption visible in the query and output.", tech: ["Oracle", "PL/SQL", "C#", ".NET", "Excel export"] },
  { number: "05", title: "Transaction & Provider APIs", summary: "Built endpoints for localized provider lists, successful transactions, identifiers, and paginated operational data.", problem: "Related provider, localization, and transaction records had to be queried without leaking persistence concerns.", contribution: "Implemented composable LINQ queries and mapped results into the project’s existing service architecture.", approach: "Server-side filtering, projection, localization, and pagination through EF Core.", lesson: "Good query boundaries keep APIs understandable while letting the database do the right work.", tech: ["ASP.NET Core", "EF Core", "LINQ", "PostgreSQL", "Angular"] },
];

const skillGroups = [
  { title: "Backend", index: "01", strong: ["C#", "ASP.NET Core Web API", "ASP.NET MVC", "Entity Framework Core", "REST APIs"], skills: [".NET Framework", ".NET 8 / 9", "LINQ", "SOAP", "Background processing", "Dependency injection", "Middleware", "AuthN / AuthZ"] },
  { title: "Architecture", index: "02", strong: ["Clean Architecture", "Service & repository patterns", "Legacy modernization"], skills: ["DDD concepts", "Feature-based architecture", "SOLID", "API contract design"] },
  { title: "Data", index: "03", strong: ["Oracle 10g / 11g", "PostgreSQL", "SQL", "Database integration"], skills: ["MySQL", "PL/SQL", "Redis", "Query optimization", "Database reporting"] },
  { title: "Frontend & tools", index: "04", strong: ["React", "Next.js", "JavaScript", "HTML / CSS"], skills: ["Angular", "jQuery", "Bootstrap", "Git", "GitLab", "GitHub", "IIS", "Swagger / OpenAPI", "Docker fundamentals", "Visual Studio", "DataGrip"] },
];

const principles = [
  ["01", "Understand the flow", "I trace the business process and edge cases before changing the code."],
  ["02", "Isolate integrations", "External systems stay behind clear contracts and observable boundaries."],
  ["03", "Keep ownership clear", "I prefer simple architecture where each layer has an obvious responsibility."],
  ["04", "Modernize safely", "Legacy systems improve incrementally, without gambling with production behavior."],
] as const;

function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  function toggleTheme() { const next = theme === "dark" ? "light" : "dark"; setTheme(next); document.documentElement.dataset.theme = next; localStorage.setItem("theme", next); }
  return <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}><span aria-hidden="true">{theme === "dark" ? "☼" : "◐"}</span></button>;
}

function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return <div className="section-heading reveal"><p className="eyebrow"><span>{eyebrow}</span></p><h2>{title}</h2>{intro && <p className="section-intro">{intro}</p>}</div>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedProject, setExpandedProject] = useState<number | null>(0);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible")), { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <a className="brand" href="#home" aria-label="Aziz Shukurov, home"><span className="brand-mark">AS</span><span className="brand-text">Aziz Shukurov<small>Backend engineer</small></span></a>
      <nav id="site-nav" className={menuOpen ? "nav open" : "nav"} aria-label="Primary navigation">{navItems.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}</nav>
      <div className="header-actions"><ThemeToggle /><button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="site-nav" onClick={() => setMenuOpen(!menuOpen)}><span /><span /><b className="sr-only">Toggle menu</b></button></div>
    </header>

    <main id="main">
      <section className="hero" id="home"><div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy reveal visible">
          <p className="status"><span /> C# / .NET · Fintech & banking</p>
          <h1>Reliable systems for<br /><em>real financial work.</em></h1>
          <p className="hero-lead">C#/.NET Backend Developer building reliable fintech and enterprise systems.</p>
          <p className="hero-support">I design APIs, modernize legacy applications, integrate payment providers, and build data-intensive banking solutions with ASP.NET Core, Oracle, PostgreSQL, and modern .NET.</p>
          <div className="hero-actions"><a className="button primary" href="#projects">View projects <span>↘</span></a><a className="button secondary" href="#contact">Contact me</a><a className="button secondary" href={siteConfig.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn ↗</a><a className="button secondary" href={siteConfig.githubUrl} target="_blank" rel="noreferrer">GitHub ↗</a></div>
        </div>
        <aside className="hero-console reveal visible" aria-label="Backend engineering profile">
          <div className="console-top"><span /><span /><span /><b>aziz.profile.json</b></div>
          <pre><code><span className="muted">{"{"}</span>{"\n"}  <span className="key">"role"</span>: <span className="value">".NET Backend Developer"</span>,{"\n"}  <span className="key">"domain"</span>: [<span className="value">"fintech"</span>, <span className="value">"banking"</span>],{"\n"}  <span className="key">"focus"</span>: [<span className="value">"APIs"</span>, <span className="value">"data"</span>, <span className="value">"reliability"</span>],{"\n"}  <span className="key">"experience"</span>: <span className="number">"3+ years"</span>,{"\n"}  <span className="key">"approach"</span>: <span className="value">"understand → isolate → improve"</span>{"\n"}<span className="muted">{"}"}</span></code></pre>
          <div className="console-foot"><span className="pulse" /> systems_operational</div>
        </aside><div className="hero-index" aria-hidden="true">01 / PORTFOLIO</div>
      </section>

      <section className="about section" id="about"><SectionHeading eyebrow="01 / About" title="Backend engineering where correctness matters." />
        <div className="about-layout"><div className="about-profile reveal"><div className="monogram">AS<span /></div><p>Strong middle-level developer<br />growing toward senior-level system design.</p></div>
          <div className="about-copy reveal"><p className="large-copy">I work primarily on backend systems in banking and fintech—where a “small” change often touches business rules, integrations, data integrity, and production operations.</p><p>My work spans payment processing, external integrations, AML and lending workflows, database-heavy applications, reporting automation, and the migration of legacy .NET applications toward modern ASP.NET Core architectures. Two years of professional React and Next.js work also help me design APIs with a practical understanding of their frontend consumers.</p>
            <div className="focus-list">{["Reliable, maintainable backend systems", "Clean boundaries and separation of concerns", "Secure external API integrations", "Database performance and correctness", "Business rules before code", "Safe, incremental legacy improvement"].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</div>)}</div>
          </div></div>
      </section>

      <section className="experience section" id="experience"><SectionHeading eyebrow="02 / Experience" title="Building systems behind financial operations." />
        <div className="timeline reveal"><div className="timeline-date"><span>Nov 2022</span><i /><span>Present</span></div><article>
          <div className="role-heading"><div><p>Fintech & banking</p><h3>C# / ASP.NET Developer</h3></div><span className="role-state">Current role</span></div>
          <div className="responsibility-grid"><p>Building and maintaining internal banking and fintech applications across modern ASP.NET Core and legacy ASP.NET environments.</p><ul><li>Payment providers and external financial services</li><li>Oracle, PostgreSQL, and MySQL data systems</li><li>REST and SOAP contract design</li><li>Manual and spreadsheet workflow migration</li><li>Production diagnostics through request tracing</li><li>Incremental architectural refactoring</li></ul></div>
          <p className="collaboration-note">Working closely with analysts, database developers, and infrastructure teams to turn business needs into dependable software.</p>
        </article></div>
        <div className="timeline timeline-secondary reveal"><div className="timeline-date"><span>2 years</span><i /><span>Frontend</span></div><article>
          <div className="role-heading"><div><p>Web product development</p><h3>React / Next.js Developer</h3></div><span className="role-state">Previous focus</span></div>
          <div className="responsibility-grid"><p>Built responsive web interfaces and product experiences with React and Next.js before moving into a backend-first fintech role.</p><ul><li>Reusable component development</li><li>Responsive layouts and UI behavior</li><li>Frontend API integration</li><li>Application routing and state flows</li><li>JavaScript and modern React patterns</li><li>Cross-functional product delivery</li></ul></div>
          <p className="collaboration-note">This frontend background gives me a full request-to-interface perspective when shaping backend contracts and integrations.</p>
        </article></div>
      </section>

      <section className="projects section" id="projects"><SectionHeading eyebrow="03 / Selected work" title="Anonymized engineering case studies." intro="The systems are confidential. The engineering decisions are worth sharing." />
        <div className="project-list">{projects.map((project, index) => { const expanded = expandedProject === index; return <article className={`project reveal ${expanded ? "expanded" : ""}`} key={project.title}>
          <button type="button" className="project-summary" aria-expanded={expanded} onClick={() => setExpandedProject(expanded ? null : index)}><span className="project-number">{project.number}</span><span className="project-main"><strong>{project.title}</strong><span>{project.summary}</span></span><span className="project-toggle" aria-hidden="true">{expanded ? "−" : "+"}</span></button>
          <div className="project-details"><div><span>Problem</span><p>{project.problem}</p></div><div><span>My contribution</span><p>{project.contribution}</p></div><div><span>Technical approach</span><p>{project.approach}</p></div><div><span>Engineering consideration</span><p>{project.lesson}</p></div><ul>{project.tech.map((tech) => <li key={tech}>{tech}</li>)}</ul></div>
        </article>; })}</div>
      </section>

      <section className="skills section" id="skills"><SectionHeading eyebrow="04 / Technical skills" title="A backend-first toolkit." intro="Deepest in ASP.NET and database integration, with practical experience across the wider delivery stack." />
        <div className="skill-grid">{skillGroups.map((group) => <article className="skill-card reveal" key={group.title}><header><span>{group.index}</span><h3>{group.title}</h3></header><div className="skill-set strong">{group.strong.map((skill) => <span key={skill}>{skill}</span>)}</div><div className="skill-set">{group.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></article>)}</div>
      </section>

      <section className="approach section"><SectionHeading eyebrow="05 / Method" title="How I approach engineering." /><div className="principles">{principles.map(([number, title, copy]) => <article className="principle reveal" key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>

      <section className="learning section"><div className="learning-copy reveal"><p className="eyebrow"><span>06 / Currently learning</span></p><h2>Growing the system-design layer.</h2><p>Active areas of development—not a list of claimed expertise.</p></div><div className="learning-orbit reveal">{["Advanced Clean Architecture & DDD", "Distributed systems", "Resilient integrations", "ASP.NET Core performance", "Redis caching", "Observability & structured logging"].map((item, i) => <span key={item} style={{ "--i": i } as React.CSSProperties}>{item}</span>)}</div></section>

      <section className="contact section" id="contact"><div className="contact-panel reveal"><p className="eyebrow"><span>07 / Contact</span></p><h2>Let’s build something<br /><em>dependable.</em></h2><p>I’m interested in backend engineering, fintech systems, API integrations, and challenging .NET projects.</p><div className="contact-links"><a className="button primary" href={siteConfig.linkedinUrl} target="_blank" rel="noreferrer">Connect on LinkedIn ↗</a><a className="button secondary" href={siteConfig.githubUrl} target="_blank" rel="noreferrer">View GitHub ↗</a><span className="contact-note"><span className="pulse" /> Public email not listed</span></div></div></section>
    </main>

    <footer><span>Designed and built by Aziz Shukurov.</span><span>© {new Date().getFullYear()}</span><a href="#home">Back to top ↑</a></footer>
  </>;
}
