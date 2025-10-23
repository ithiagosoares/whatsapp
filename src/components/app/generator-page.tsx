"use client";

import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { GeneratorProvider } from '@/context/generator-context';
import AppSidebar from './sidebar-content';
import MainContent from './main-content';

export default function GeneratorPage() {
  return (
    <GeneratorProvider>
        <SidebarProvider defaultOpen={true}>
          <Sidebar collapsible="icon">
            <AppSidebar />
          </Sidebar>
          <SidebarInset>
            <MainContent />
          </SidebarInset>
        </SidebarProvider>
    </GeneratorProvider>
  );
}
