<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    // GET /api/applications  (admin only)
    public function index(): JsonResponse
    {
        if (auth('api')->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json(
            Application::with(['worker:id,first_name,last_name,avatar', 'task:id,title'])
                ->orderByDesc('created_at')
                ->get()
                ->map->toArray()
                ->values()
        );
    }

    // GET /api/tasks/{taskId}/applications
    public function getByTask(int $taskId): JsonResponse
    {
        $task = Task::findOrFail($taskId);
        $user = auth('api')->user();

        if ($task->client_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $applications = Application::where('task_id', $taskId)
            ->with(['worker:id,first_name,last_name,avatar,bio,hourly_rate,location'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($applications->map->toArray()->values());
    }

    // GET /api/applications/worker/{workerId}
    public function getByWorker(int $workerId): JsonResponse
    {
        $user = auth('api')->user();

        if ($user->id !== $workerId && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $applications = Application::where('worker_id', $workerId)
            ->with(['task:id,title,status,budget,location,client_id'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($applications->map->toArray()->values());
    }

    // POST /api/applications
    // applicationsSlice: createApplication({ taskId, price, deliveryTime, message })
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'taskId'       => 'required|integer|exists:tasks,id',
            'price'        => 'required|numeric|min:1',
            'deliveryTime' => 'required|string|max:100',
            'message'      => 'required|string|min:10|max:1000',
        ]);

        $task = Task::findOrFail($request->taskId);

        // FIX: use 'published' not 'open'
        if ($task->status !== 'published') {
            return response()->json(['message' => 'This task is no longer accepting applications'], 422);
        }

        $userId = auth('api')->id();

        // Prevent duplicate applications
        $exists = Application::where('task_id', $request->taskId)
            ->where('worker_id', $userId)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'You have already applied to this task'], 422);
        }

        $application = Application::create([
            'task_id'       => $request->taskId,
            'worker_id'     => $userId,
            'price'         => $request->price,
            'delivery_time' => $request->deliveryTime,
            'message'       => $request->message,
            'status'        => 'pending',
        ]);

        return response()->json($application->load('worker:id,first_name,last_name,avatar')->toArray(), 201);
    }

    // PATCH /api/applications/{applicationId}/status
    // applicationsSlice: updateApplicationStatus({ applicationId, status })
    public function updateStatus(Request $request, int $applicationId): JsonResponse
    {
        $application = Application::findOrFail($applicationId);
        $task        = Task::findOrFail($application->task_id);

        if ($task->client_id !== auth('api')->id()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'status' => 'required|in:accepted,rejected',
        ]);

        if ($request->status === 'accepted') {
            // Reject all other pending applications for this task
            Application::where('task_id', $task->id)
                ->where('id', '!=', $applicationId)
                ->where('status', 'pending')
                ->update(['status' => 'rejected']);

            // FIX: use worker_id (correct column name from migration)
            $task->update([
                'worker_id' => $application->worker_id,
                'status'    => 'assigned',
            ]);
        }

        $application->update(['status' => $request->status]);

        return response()->json($application->fresh()->toArray());
    }
}