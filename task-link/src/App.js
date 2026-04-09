import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";

import TalkWithUs from "./pages/TalkWithUs";

import TaskDetails from "./pages/TaskDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { ThemeProvider } from "@/components/hooks/use-theme";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/:id" element={<TaskDetails />} />
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/tasks" element={<MyTasks />} />
            <Route path="/client/tasks/new" element={<CreateTask />} />
            <Route path="/client/favorites" element={<Favorites />} />
            <Route path="/client/settings" element={<ClientSettings />} />
            <Route path="/worker/dashboard" element={<WorkerDashboard />} />
            <Route path="/worker/tasks" element={<FindTasks />} />
            <Route path="/worker/settings" element={<WorkerSettings />} />
            <Route path="/client/messages" element={<Messages />} />
            <Route path="/worker/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/talk-with-us" element={<TalkWithUs />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

