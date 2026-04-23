<?php

namespace App\Http\Controllers;

use App\Models\TaskFavorite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    // GET /api/task-favorites/{clientId}
    public function index(int $clientId): JsonResponse
    {
        $user = auth('api')->user();

        if ($user->id !== $clientId && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $favorites = TaskFavorite::where('client_id', $clientId)
            ->with('task:id,title,description,category,budget,budget_type,status,location,created_at')
            ->get()
            ->map(fn($f) => $f->task);

        return response()->json($favorites);
    }

    // POST /api/task-favorites
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'client_id' => 'required|integer|exists:users,id',
            'task_id' => 'required|integer|exists:tasks,id',
        ]);

        $user = auth('api')->user();
        if ($user->id !== $request->client_id && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Check if already favorited
        $exists = TaskFavorite::where('client_id', $request->client_id)
            ->where('task_id', $request->task_id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Task already in favorites'], 422);
        }

        $favorite = TaskFavorite::create([
            'client_id' => $request->client_id,
            'task_id' => $request->task_id,
        ]);

        $favorite->load('task:id,title,description,category,budget,budget_type,status,location');

        return response()->json($favorite->task, 201);
    }

    // DELETE /api/task-favorites/{clientId}/{taskId}
    public function destroy(int $clientId, int $taskId): JsonResponse
    {
        $user = auth('api')->user();

        if ($user->id !== $clientId && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        TaskFavorite::where('client_id', $clientId)
            ->where('task_id', $taskId)
            ->delete();

        return response()->json(['message' => 'Removed from favorites']);
    }
}