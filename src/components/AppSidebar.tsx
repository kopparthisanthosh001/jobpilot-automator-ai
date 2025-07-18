import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  User, 
  Settings, 
  Zap, 
  FileText, 
  LogOut, 
  Bot,
  BarChart3,
  Target
} from "lucide-react";

const menuItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Profile Setup", url: "/dashboard/profile-setup", icon: User },
  { title: "All Matches", url: "/dashboard/matches", icon: Target },
  { title: "Auto Apply", url: "/dashboard/auto-apply", icon: Zap },
  { title: "Applied Jobs", url: "/dashboard/applied", icon: FileText },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard";
    }
    return currentPath.startsWith(path);
  };

  const handleLogout = () => {
    // In a real app, clear auth tokens here
    navigate("/");
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent className="bg-background border-r border-border">
        {/* Logo */}
        <div className={`p-4 border-b border-border ${collapsed ? "px-2" : ""}`}>
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-primary flex-shrink-0" />
            {!collapsed && (
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Jobpilot.ai
              </span>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive: navIsActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                          isActive(item.url)
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/dashboard/settings"
                    className={({ isActive: navIsActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                        isActive("/dashboard/settings")
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`
                    }
                  >
                    <Settings className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-3 py-2 w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>Logout</span>}
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}