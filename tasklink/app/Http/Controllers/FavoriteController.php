<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    // GET /api/favorites/{clientId}
    public function index(int $clientId): JsonResponse
    {
        $user = auth('api')->user();

        if ($user->id !== $clientId && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $favorites = Favorite::where('client_id', $clientId)
            ->with('task:id,title,description,category,budget,status,location,urgency,created_at')
            ->get()
            ->filter(fn($fav) => $fav->task !== null)  // تخطي المهام المحذوفة
            ->map(fn($fav) => array_merge($fav->task->toArray(), [
                'budget' => (float) $fav->task->budget,
            ]))
            ->values();

        return response()->json($favorites);
    }

    // POST /api/favorites
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'client_id' => 'required|exists:users,id',
            'task_id'   => 'required|exists:tasks,id',
        ]);

        $user = auth('api')->user();

        if ($user->id !== (int) $request->client_id && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $exists = Favorite::where('client_id', $request->client_id)
            ->where('task_id', $request->task_id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Already in favorites'], 422);
        }

        $favorite = Favorite::create([
            'client_id' => $request->client_id,
            'task_id'   => $request->task_id,
        ]);

        $favorite->load('task');

        return response()->json(array_merge($favorite->task->toArray(), [
            'budget' => (float) $favorite->task->budget,
        ]), 201);
    }

    // DELETE /api/favorites/{clientId}/{taskId}
    public function destroy(int $clientId, int $taskId): JsonResponse
    {
        $user = auth('api')->user();

        if ($user->id !== $clientId && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        Favorite::where('client_id', $clientId)
            ->where('task_id', $taskId)
            ->delete();

        return response()->json(['message' => 'Removed from favorites']);
    }
}