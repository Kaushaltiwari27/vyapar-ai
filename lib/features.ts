import { TrendingUp, IndianRupee, MessageSquare, BarChart3, Users, Package } from "lucide-react";

export const APP_FEATURES = [
  {
    id: "sales_pipeline",
    title: "Sales Pipeline",
    description: "Track all your leads and deals with a visual drag-and-drop Kanban board.",
    icon: TrendingUp,
    isNew: false
  },
  {
    id: "gst_invoicing",
    title: "GST Invoicing",
    description: "Generate professional GST invoices instantly and track pending payments easily.",
    icon: IndianRupee,
    isNew: false
  },
  {
    id: "ai_assistant",
    title: "AI Chat Assistant",
    description: "Chat with your business data. Ask 'What is my total revenue?' and get instant answers.",
    icon: MessageSquare,
    isNew: false
  },
  {
    id: "inventory",
    title: "Inventory & Vendors",
    description: "Manage product stock, track movements, and handle vendor purchase orders.",
    icon: Package,
    isNew: false
  },
  {
    id: "hrms",
    title: "HRMS & Attendance",
    description: "Manage employees, track daily attendance, and approve leave requests.",
    icon: Users,
    isNew: true
  },
  {
    id: "smart_dashboard",
    title: "Smart Dashboard",
    description: "Get a bird's eye view of your entire business performance with real-time metrics.",
    icon: BarChart3,
    isNew: false
  }
];
