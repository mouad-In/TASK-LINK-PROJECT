<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ApplicationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function apply(Request $request, $taskId)
    {
        $task = Task::findOrFail($taskId);

        if ($task->status !== 'open') {
            return response()->json(['error' => 'Task is no longer open for applications'], 400);
        }

        $existingApplication = Application::where('task_id', $taskId)
            ->where('worker_id', auth()->id())
            ->first();

        if ($existingApplication) {
            return response()->json(['error' => 'You have already applied to this task'], 400);
        }

        $validator = Validator::make($request->all(), [
            'cover_note' => 'required|string|min:20',
            'proposed_budget' => 'nullable|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $application = Application::create([
            'task_id' => $taskId,
            'worker_id' => auth()->id(),
            'cover_note' => $request->cover_note,
            'proposed_budget' => $request->proposed_budget ?? $task->budget,
            'status' => 'pending'
        ]);

        return response()->json($application, 201);
    }

    public function getTaskApplications($taskId)
    {
        $task = Task::findOrFail($taskId);

        if ($task->client_id !== auth()->id() && auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $applications = Application::where('task_id', $taskId)
            ->with('worker:id,name,email,phone,avatar')
            ->get();

        return response()->json($applications);
    }

    public function updateApplicationStatus(Request $request, $applicationId)
    {
        $application = Application::findOrFail($applicationId);
        $task = Task::findOrFail($application->task_id);

        if ($task->client_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:accepted,rejected'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->status === 'accepted') {
            // Reject all other applications
            Application::where('task_id', $task->id)
                ->where('id', '!=', $applicationId)
                ->update(['status' => 'rejected']);
            
            // Assign worker to task
            $task->update([
                'assigned_worker_id' => $application->worker_id,
                'status' => 'in-progress'
            ]);
        }

        $application->update(['status' => $request->status]);

        return response()->json($application);
    }
}