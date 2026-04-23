<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    // ── GET /api/tasks ────────────────────────────────────────────────────────
    // Admin: all tasks. Others: scoped to their own.

    public function index(): JsonResponse
    {
        $user = auth('api')->user();

        $tasks = match ($user->role) {
            'admin'  => Task::with('applications')->get(),
            'client' => Task::with('applications')->where('client_id', $user->id)->get(),
            'worker' => Task::with('applications')->where('worker_id', $user->id)->get(),
            default  => collect(),
        };

        return response()->json($this->formatList($tasks));
    }

    // ── GET /api/tasks/published ──────────────────────────────────────────────
    // Tasks.jsx — workers browse open tasks

    public function getPublished(): JsonResponse
    {
        $tasks = Task::with('applications')
            ->whereIn('status', ['published', 'open'])
            ->get();

        return response()->json($this->formatList($tasks));
    }

    // ── GET /api/tasks/client/{clientId} ─────────────────────────────────────

    public function getByClient(int $clientId): JsonResponse
    {
        $tasks = Task::with('applications')
            ->where('client_id', $clientId)
            ->get();

        return response()->json($this->formatList($tasks));
    }

    // ── GET /api/tasks/worker/{workerId} ─────────────────────────────────────

    public function getByWorker(int $workerId): JsonResponse
    {
        $tasks = Task::with('applications')
            ->where('worker_id', $workerId)
            ->get();

        return response()->json($this->formatList($tasks));
    }

    // ── GET /api/tasks/{taskId} ───────────────────────────────────────────────

    public function show(int $taskId): JsonResponse
    {
        $task = Task::with(['applications', 'comments'])->findOrFail($taskId);
        return response()->json($this->formatTask($task));
    }

    // ── POST /api/tasks ───────────────────────────────────────────────────────
    // CreateTask.jsx sends: title, description, category, urgency,
    //   budget, location, requiredSkills, coordinates, clientId

    public function store(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'title'          => 'required|string|max:255',
            'description'    => 'required|string',
            'category'       => 'required|string',
            'urgency'        => 'required|in:low,medium,high',
            'budget'         => 'required|numeric|min:1',
            'location'       => 'required|string|max:200',
            'requiredSkills' => 'nullable|array',
            'requiredSkills.*'=> 'string|max:100',
            'coordinates'    => 'nullable|array',
            'coordinates.lat'=> 'nullable|numeric',
            'coordinates.lng'=> 'nullable|numeric',
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        $task = Task::create([
            'client_id'      => auth('api')->id(),
            'title'          => $request->title,
            'description'    => $request->description,
            'category'       => $request->category,
            'urgency'        => $request->urgency,
            'budget'         => $request->budget,
            'location'       => $request->location,
            'status'         => 'published',
            'required_skills'=> $request->requiredSkills ?? [],
            'latitude'       => $request->coordinates['lat'] ?? null,
            'longitude'      => $request->coordinates['lng'] ?? null,
        ]);

        return response()->json($this->formatTask($task), 201);
    }

    // ── PUT /api/tasks/{taskId} ───────────────────────────────────────────────

    public function update(Request $request, int $taskId): JsonResponse
    {
        $task = Task::findOrFail($taskId);
        $this->authorizeOwner($task);

        $v = Validator::make($request->all(), [
            'title'          => 'sometimes|string|max:255',
            'description'    => 'sometimes|string',
            'category'       => 'sometimes|string',
            'urgency'        => 'sometimes|in:low,medium,high',
            'budget'         => 'sometimes|numeric|min:1',
            'location'       => 'sometimes|string|max:200',
            'status'         => 'sometimes|in:published,assigned,in_progress,completed',
            'requiredSkills' => 'sometimes|nullable|array',
            'coordinates'    => 'sometimes|nullable|array',
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        $data = $request->only(['title', 'description', 'category', 'urgency', 'budget', 'location', 'status']);
        if ($request->has('requiredSkills'))          $data['required_skills'] = $request->requiredSkills;
        if ($request->has('coordinates.lat'))         $data['latitude']  = $request->coordinates['lat'];
        if ($request->has('coordinates.lng'))         $data['longitude'] = $request->coordinates['lng'];

        $task->update($data);

        return response()->json($this->formatTask($task->fresh(['applications', 'comments'])));
    }

    // ── DELETE /api/tasks/{taskId} ────────────────────────────────────────────

    public function destroy(int $taskId): JsonResponse
    {
        $task = Task::findOrFail($taskId);
        $this->authorizeOwner($task);
        $task->delete();

        return response()->json(['message' => 'Task deleted']);
    }

    // ── POST /api/tasks/{taskId}/assign ──────────────────────────────────────
    // tasksSlice assignWorker — called after accepting an application

    public function assignWorker(Request $request, int $taskId): JsonResponse
    {
        $task = Task::findOrFail($taskId);
        $this->authorizeOwner($task);

        $v = Validator::make($request->all(), [
            'workerId' => 'required|exists:users,id',
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        $task->update([
            'worker_id' => $request->workerId,
            'status'    => 'assigned',
        ]);

        return response()->json($this->formatTask($task->fresh(['applications', 'comments'])));
    }

    // ── GET /api/tasks/{taskId}/comments ─────────────────────────────────────

    public function getComments(int $taskId): JsonResponse
    {
        $task = Task::findOrFail($taskId);
        return response()->json($task->comments->map->toArray()->values());
    }

    // ── POST /api/tasks/{taskId}/comments ────────────────────────────────────
    // commentsSlice addComment sends: authorId, authorName, content

    public function addComment(Request $request, int $taskId): JsonResponse
    {
        Task::findOrFail($taskId);  // 404 guard

        $v = Validator::make($request->all(), [
            'content'    => 'required|string',
            'authorName' => 'required|string|max:200',
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        $comment = Comment::create([
            'task_id'     => $taskId,
            'author_id'   => auth('api')->id(),
            'author_name' => $request->authorName,
            'content'     => $request->content,
        ]);

        return response()->json($comment->toArray(), 201);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function authorizeOwner(Task $task): void
    {
        $user = auth('api')->user();
        if ($task->client_id !== $user->id && $user->role !== 'admin') {
            abort(403, 'Forbidden');
        }
    }

    private function formatTask(Task $task): array
    {
        $data = $task->toArray();
        $data['applicationsCount'] = $task->applications ? $task->applications->count() : 0;
        return $data;
    }

    private function formatList($tasks): array
    {
        return $tasks->map(fn ($t) => $this->formatTask($t))->values()->toArray();
    }
}