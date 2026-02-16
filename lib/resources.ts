import { TaskField } from "./tasks";
import {
    Code,
    Server,
    Layers,
    Smartphone,
    Database,
    Palette,
    Youtube,
    Globe,
    BookMarked,
    ExternalLink
} from "lucide-react";

export interface Resource {
    id: string;
    title: string;
    description: string;
    url: string;
    type: "video" | "article" | "course" | "doc";
    track: TaskField;
    tags: string[];
}

export const RESOURCES: Resource[] = [
    // Frontend
    {
        id: "fe-1",
        title: "React.dev - Official Documentation",
        description: "The official documentation for React. Learn the basics and advanced concepts of React directly from the creators.",
        url: "https://react.dev",
        type: "doc",
        track: "frontend",
        tags: ["React", "Basics", "Official"],
    },
    {
        id: "fe-2",
        title: "Josh Comeau's Interactive Guide to Flexbox",
        description: "A highly interactive and beautiful guide to understanding CSS Flexbox in-depth.",
        url: "https://www.joshwcomeau.com/css/interactive-guide-to-flexbox/",
        type: "article",
        track: "frontend",
        tags: ["CSS", "Flexbox", "UI"],
    },
    {
        id: "fe-3",
        title: "Kent C. Dodds - Epic React",
        description: "Highly acclaimed courses and articles on building robust, professional React applications.",
        url: "https://kentcdodds.com/blog",
        type: "article",
        track: "frontend",
        tags: ["React", "Performance", "Testing"],
    },

    // Backend
    {
        id: "be-1",
        title: "Node.js Best Practices",
        description: "The most comprehensive list of best practices for Node.js backend development.",
        url: "https://github.com/goldbergyoni/nodebestpractices",
        type: "doc",
        track: "backend",
        tags: ["Node.js", "Security", "Architecture"],
    },
    {
        id: "be-2",
        title: "System Design Primer",
        description: "Learn how to design large-scale systems. Prep for the system design interview.",
        url: "https://github.com/donnemartin/system-design-primer",
        type: "doc",
        track: "backend",
        tags: ["Scalability", "Architecture", "Interview"],
    },
    {
        id: "be-3",
        title: "Hussein Nasser - Software Engineering",
        description: "Deep dives into backend engineering, networking, and database internals.",
        url: "https://www.youtube.com/@husseinnasser",
        type: "video",
        track: "backend",
        tags: ["Networking", "Databases", "Performance"],
    },

    // Full Stack
    {
        id: "fs-1",
        title: "Full Stack Open - University of Helsinki",
        description: "A free, comprehensive course covering modern web development from React to GraphQL.",
        url: "https://fullstackopen.com/en/",
        type: "course",
        track: "fullstack",
        tags: ["MERN", "GraphQL", "DevOps"],
    },
    {
        id: "fs-2",
        title: "The Indie Hackers Podcast",
        description: "Stories of developers building full-stack products and businesses from scratch.",
        url: "https://www.indiehackers.com/podcast",
        type: "video",
        track: "fullstack",
        tags: ["Business", "Products", "Growth"],
    },

    // Mobile
    {
        id: "mb-1",
        title: "Flutter Documentation",
        description: "Build beautiful, natively compiled applications for mobile, web, and desktop from a single codebase.",
        url: "https://docs.flutter.dev",
        type: "doc",
        track: "mobile",
        tags: ["Flutter", "Dart", "Cross-platform"],
    },
    {
        id: "mb-2",
        title: "Ray Wenderlich - iOS and Android Tutorials",
        description: "Professional level tutorials for native mobile development and game engines.",
        url: "https://www.kodeco.com/",
        type: "article",
        track: "mobile",
        tags: ["Swift", "Kotlin", "Native"],
    },

    // Data
    {
        id: "da-1",
        title: "Kaggle - Learn Data Science",
        description: "Practical, hands-on courses for ML, Deep Learning, and data analysis.",
        url: "https://www.kaggle.com/learn",
        type: "course",
        track: "data",
        tags: ["Python", "ML", "Pandas"],
    },
    {
        id: "da-2",
        title: "Towards Data Science",
        description: "A Medium publication sharing concepts, ideas, and codes on data science.",
        url: "https://towardsdatascience.com/",
        type: "article",
        track: "data",
        tags: ["AI", "Statistics", "Big Data"],
    },

    // Design
    {
        id: "ds-1",
        title: "Refactoring UI by Tailwind CSS",
        description: "Learn how to design beautiful user interfaces with practical, dev-friendly strategies.",
        url: "https://www.refactoringui.com/",
        type: "article",
        track: "design",
        tags: ["UI/UX", "Visual Design", "Tailwind"],
    },
    {
        id: "ds-2",
        title: "Laws of UX",
        description: "A collection of best practices that designers can consider when building user interfaces.",
        url: "https://lawsofux.com/",
        type: "doc",
        track: "design",
        tags: ["UX", "Psychology", "Usability"],
    },

    // New Additions
    // Frontend
    {
        id: "fe-4",
        title: "Frontend Masters",
        description: "In-depth, modern frontend engineering courses from industry experts.",
        url: "https://frontendmasters.com",
        type: "course",
        track: "frontend",
        tags: ["Advanced", "Deep Dive", "Professional"],
    },
    {
        id: "fe-5",
        title: "CSS-Tricks",
        description: "A daily updated web design and development blog full of tips, tricks, and tutorials.",
        url: "https://css-tricks.com",
        type: "article",
        track: "frontend",
        tags: ["CSS", "Tricks", "Layouts"],
    },

    // Backend
    {
        id: "be-4",
        title: "The Go Programming Language",
        description: "Official documentation and tutorials for Go, a powerful language for scalable backend systems.",
        url: "https://go.dev/doc/",
        type: "doc",
        track: "backend",
        tags: ["Go", "Scalability", "Microservices"],
    },
    {
        id: "be-5",
        title: "PostgreSQL Exercises",
        description: "Practice your SQL skills with interactive exercises ranging from simple queries to complex joins.",
        url: "https://pgexercises.com/",
        type: "course",
        track: "backend",
        tags: ["SQL", "Database", "Practice"],
    },

    // Full Stack
    {
        id: "fs-3",
        title: "Next.js Documentation",
        description: "The React Framework for the Web. Learn about routing, rendering, and API routes.",
        url: "https://nextjs.org/docs",
        type: "doc",
        track: "fullstack",
        tags: ["Next.js", "React", "SSR"],
    },
    {
        id: "fs-4",
        title: "Prisma Guide",
        description: "Learn how to use Prisma ORM to interact with your database in a type-safe way.",
        url: "https://www.prisma.io/docs",
        type: "doc",
        track: "fullstack",
        tags: ["ORM", "Database", "TypeScript"],
    },

    // Mobile
    {
        id: "mb-3",
        title: "React Native - Learn",
        description: "Create native apps for Android and iOS using React.",
        url: "https://reactnative.dev/docs/getting-started",
        type: "doc",
        track: "mobile",
        tags: ["React Native", "Cross-platform", "JavaScript"],
    },
    {
        id: "mb-4",
        title: "Android Developers",
        description: "The official site for Android developers. Provides SDKs, documentation, and tutorials.",
        url: "https://developer.android.com/",
        type: "doc",
        track: "mobile",
        tags: ["Android", "Kotlin", "Google"],
    },

    // Data
    {
        id: "da-3",
        title: "Fast.ai - Practical Deep Learning",
        description: "Free courses that make deep learning accessible to everyone.",
        url: "https://www.fast.ai/",
        type: "course",
        track: "data",
        tags: ["AI", "Deep Learning", "Practical"],
    },
    {
        id: "da-4",
        title: "DataCamp",
        description: "Learn R, Python and SQL online through interactive exercises.",
        url: "https://www.datacamp.com/",
        type: "course",
        track: "data",
        tags: ["Interactive", "Python", "SQL"],
    },

    // Design
    {
        id: "ds-3",
        title: "Dribbble",
        description: "The leading destination to find & showcase creative work and home to the world's best design professionals.",
        url: "https://dribbble.com/",
        type: "article",
        track: "design",
        tags: ["Inspiration", "Portfolio", "Community"],
    },
    {
        id: "ds-4",
        title: "Figma Community",
        description: "Explore thousands of free files, plugins, and widgets created by the Figma community.",
        url: "https://www.figma.com/community",
        type: "doc",
        track: "design",
        tags: ["Figma", "Resources", "Templates"],
    }
];

export const RESOURCE_TYPE_ICONS = {
    video: Youtube,
    article: BookMarked,
    course: Globe,
    doc: ExternalLink,
};
