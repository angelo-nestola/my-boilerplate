import { DashboardLayout } from '@/components/layout';

interface DashboardGroupLayoutProps {
  children: React.ReactNode;
}

export default function DashboardGroupLayout({ children }: DashboardGroupLayoutProps) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
