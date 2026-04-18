// App.jsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Tasks from "./pages/Tasks";
import ClientDashboard from "./pages/client/ClientDashboard";
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import FindTasks from "./pages/worker/FindTasks";
import CreateTask from "./pages/client/CreateTask";
import MyTasks from "./pages/client/MyTasks";
import Favorites from "./pages/client/Favorites";
import ClientSettings from "./pages/client/Settings";
import WorkerSettings from "./pages/worker/Settings";
import SavedTasks from "./pages/worker/Savedtasks";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import TalkWithUs from "./pages/TalkWithUs";
import TaskDetails from "./pages/TaskDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import { ThemeProvider } from "@/components/hooks/use-theme";

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  return (
  
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/tasks/:id" element={<TaskDetails />} />
                <Route path="/talk-with-us" element={<TalkWithUs />} />
                
                {/* Client Routes */}
                <Route path="/client/dashboard" element={<ClientDashboard />} />
                <Route path="/client/tasks" element={<MyTasks />} />
                <Route path="/client/tasks/new" element={<CreateTask />} />
                <Route path="/client/tasks/:id" element={<TaskDetails />} />
                <Route path="/client/tasks/:id/edit" element={<CreateTask />} />
                <Route path="/client/favorites" element={<Favorites />} />
                <Route path="/client/settings" element={<ClientSettings />} />
                <Route path="/client/messages" element={<Messages />} />
                <Route path="/client/messages/:id" element={<Messages />} />
                <Route path="/client/workers" element={<FindTasks />} />
                <Route path="/client/workers/:id" element={<Profile />} />
                
                {/* Worker Routes */}
                <Route path="/worker/dashboard" element={<WorkerDashboard />} />
                <Route path="/worker/tasks" element={<FindTasks />} />
                <Route path="/worker/tasks/:id" element={<TaskDetails />} />
                <Route path="/worker/settings" element={<WorkerSettings />} />
                <Route path="/worker/messages" element={<Messages />} />
                <Route path="/worker/messages/:id" element={<Messages />} />
                <Route path="/worker/earnings" element={<WorkerDashboard />} />
                <Route path="/worker/saved" element={<SavedTasks />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/users/:id" element={<Profile />} />
                <Route path="/admin/tasks" element={<AdminTasks />} />
                <Route path="/admin/tasks/:id" element={<TaskDetails />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                
                {/* Shared Routes */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/messages" element={<Messages />} />
                
                {/* 404 Catch-all Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    
  );
};

export default App;