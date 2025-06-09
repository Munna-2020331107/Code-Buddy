"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface Task {
  _id: string;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
  notes?: string;
  resources?: { type: string; title: string; url: string; description?: string }[];
}

interface DailyTask {
  date: string;
  tasks: Task[];
}

interface LearningSchedule {
  _id: string;
  title: string;
  prompt: string;
  startDate: string;
  endDate: string;
  dailyTasks: DailyTask[];
  progress: number;
  status: "active" | "completed" | "paused";
}

export default function LearningSchedulePage() {
  const [schedules, setSchedules] = useState<LearningSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<LearningSchedule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [days, setDays] = useState(7);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/learning-schedule`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setSchedules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast.error("Failed to fetch schedules");
      setSchedules([]);
    }
  };

  const createSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/learning-schedule`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt, days }),
      });
      const data = await response.json();
      if (data && data._id) {
        setSchedules(prev => [data, ...prev]);
        setIsCreating(false);
        toast.success("Learning schedule created successfully!");
      } else {
        throw new Error("Invalid response data");
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast.error("Failed to create schedule");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (scheduleId: string, taskId: string, completed: boolean) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/learning-schedule/${scheduleId}/task/${taskId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed }),
      });

      // Update both schedules and selectedSchedule state
      const updatedSchedule = (prevSchedule: LearningSchedule) => ({
        ...prevSchedule,
        dailyTasks: prevSchedule.dailyTasks.map(day => ({
          ...day,
          tasks: day.tasks.map(task => 
            task._id === taskId 
              ? { ...task, completed, completedAt: completed ? new Date() : null }
              : task
          )
        }))
      });

      setSchedules(prevSchedules => 
        prevSchedules.map(schedule => 
          schedule._id === scheduleId ? updatedSchedule(schedule) : schedule
        )
      );

      // Update selectedSchedule if it's the current schedule
      setSelectedSchedule(prev => 
        prev && prev._id === scheduleId ? updatedSchedule(prev) : prev
      );

    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/learning-schedule/${id}`, { 
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSchedules(schedules.filter(s => s._id !== id));
      if (selectedSchedule?._id === id) {
        setSelectedSchedule(null);
      }
      toast.success("Schedule deleted successfully");
    } catch (error) {
      toast.error("Failed to delete schedule");
    }
  };

  if (selectedSchedule) {
    return (
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{selectedSchedule.title}</h1>
          <Button variant="destructive" onClick={() => deleteSchedule(selectedSchedule._id)}>
            Delete Schedule
          </Button>
        </div>
        <Progress value={selectedSchedule.progress} className="mb-8" />
        <div className="space-y-8">
          {selectedSchedule.dailyTasks.map((day, dayIndex) => (
            <Card key={dayIndex} className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Day {dayIndex + 1} - {new Date(day.date).toLocaleDateString()}
              </h2>
              <div className="space-y-4">
                {day.tasks.map((task) => (
                  <div key={task._id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => updateTaskStatus(selectedSchedule._id, task._id, e.target.checked)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-muted-foreground">{task.description}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Duration: {task.duration} minutes
                      </p>
                      
                      {/* Resources Section */}
                      {task.resources && task.resources.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Resources:</h4>
                          <div className="space-y-2">
                            {task.resources.map((resource, index) => (
                              <div key={index} className="text-sm">
                                <a 
                                  href={resource.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline flex items-center gap-2"
                                >
                                  <span className="capitalize">{resource.type}</span>: {resource.title}
                                </a>
                                {resource.description && (
                                  <p className="text-muted-foreground text-xs mt-1">
                                    {resource.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
        <Button
          className="mt-6"
          onClick={() => setSelectedSchedule(null)}
        >
          Back to Schedules
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Learning Schedules</h1>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? "Cancel" : "Create New Schedule"}
        </Button>
      </div>

      {isCreating && (
        <Card className="p-6 mb-8">
          <form onSubmit={createSchedule} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Learning Goals</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to learn..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Number of Days</label>
              <Input
                type="number"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                min={1}
                max={30}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating Schedule..." : "Create Schedule"}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid gap-6">
        {schedules.map((schedule) => (
          <Card
            key={schedule._id}
            className="p-6 cursor-pointer hover:bg-accent/50"
            onClick={() => setSelectedSchedule(schedule)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold mb-2">{schedule.title}</h2>
                <p className="text-muted-foreground mb-4">{schedule.prompt}</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Start: {new Date(schedule.startDate).toLocaleDateString()}</span>
                  <span>End: {new Date(schedule.endDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium mb-2">Progress</div>
                <Progress value={schedule.progress} className="w-32" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

