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
            ->with('worker:id,first_name,last_name,avatar,rating,location,skills,completed_tasks')
            ->get()
            ->map(fn($f) => array_merge(
                $f->worker->toArray(),
                ['favorite_id' => $f->id]
            ));

        return response()->json($favorites->values());
    }

    // POST /api/favorites
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'client_id' => 'required|integer|exists:users,id',
            'worker_id' => 'required|integer|exists:users,id',
        ]);

        $user = auth('api')->user();
        if ($user->id !== $request->client_id && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // منع إضافة نفس الـ worker مرتين
        $exists = Favorite::where('client_id', $request->client_id)
            ->where('worker_id', $request->worker_id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Already in favorites'], 422);
        }

        $favorite = Favorite::create([
            'client_id' => $request->client_id,
            'worker_id' => $request->worker_id,
        ]);

        $favorite->load('worker:id,first_name,last_name,avatar,rating,location');

        return response()->json(array_merge(
            $favorite->worker->toArray(),
            ['favorite_id' => $favorite->id]
        ), 201);
    }

    // DELETE /api/favorites/{clientId}/{workerId}
    public function destroy(int $clientId, int $workerId): JsonResponse
    {
        $user = auth('api')->user();

        if ($user->id !== $clientId && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        Favorite::where('client_id', $clientId)
            ->where('worker_id', $workerId)
            ->delete();

        return response()->json(['message' => 'Removed from favorites']);
    }
}