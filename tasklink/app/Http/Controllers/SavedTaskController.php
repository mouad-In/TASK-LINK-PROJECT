<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SavedTask;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SavedTaskController extends Controller
{
    /**
     * GET /api/saved-tasks
     * Return all tasks saved by the authenticated worker.
     */
    public function index(Request $request): JsonResponse
    {
        $savedTasks = SavedTask::query()
            ->where('user_id', $request->user()->id)
            ->with([
                'task',
                'task.client:id,first_name,last_name',
                'task.applications:id,task_id',
                'task.review:id,task_id,rating',
            ])
            ->latest()
            ->get()
            ->map(fn (SavedTask $st) => $this->formatTask($st->task));

        return response()->json($savedTasks);
    }

    /**
     * POST /api/saved-tasks
     * Save a task for the authenticated worker.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'task_id' => ['required', 'integer', 'exists:tasks,id'],
        ]);

        $task = Task::findOrFail($request->task_id);

        // firstOrCreate prevents duplicates (unique constraint backup)
        SavedTask::firstOrCreate([
            'user_id' => $request->user()->id,
            'task_id' => $task->id,
        ]);

        return response()->json($this->formatTask($task->load([
            'client:id,first_name,last_name',
            'applications:id,task_id',
            'review:id,task_id,rating',
        ])), Response::HTTP_CREATED);
    }

    /**
     * DELETE /api/saved-tasks/{task}
     * Remove a saved task for the authenticated worker.
     */
    public function destroy(Request $request, Task $task): JsonResponse
    {
        SavedTask::where('user_id', $request->user()->id)
            ->where('task_id', $task->id)
            ->delete();

        return response()->json(['message' => 'Task removed from saved.']);
    }

    // ── Private helper ────────────────────────────────────────────────────────

    private function formatTask(Task $task): array
    {
        return [
            'id'                 => $task->id,
            'title'              => $task->title,
            'description'        => $task->description,
            'category'           => $task->category,
            'status'             => $task->status,
            'budget'             => '$' . number_format($task->budget, 0),
            'budgetValue'        => (float) $task->budget,
            'location'           => $task->location,
            'urgent'             => $task->urgency === 'urgent',
            'postedBy' => trim(($task->client?->first_name ?? '') . ' ' . ($task->client?->last_name ?? '')),
            'rating'             => $task->review?->rating ?? 0,
            'reviews'            => $task->review ? 1 : 0,
            'applicationsCount'  => $task->applications?->count() ?? 0,
            'postedAt'           => $task->created_at->diffForHumans(),
            'requiredSkills'     => $task->required_skills ?? [],
        ];
    }
}