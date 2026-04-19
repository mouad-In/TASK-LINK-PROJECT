<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    // GET /api/reviews  (admin only)
    public function index(): JsonResponse
    {
        if (auth('api')->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $reviews = Review::with([
            'reviewer:id,first_name,last_name,avatar',
            'reviewee:id,first_name,last_name,avatar',
            'task:id,title',
        ])->orderByDesc('created_at')->get();

        return response()->json($reviews->map->toArray()->values());
    }

    // GET /api/tasks/{taskId}/reviews
    public function getByTask(int $taskId): JsonResponse
    {
        Task::findOrFail($taskId); // 404 guard

        $reviews = Review::where('task_id', $taskId)
            ->with(['reviewer:id,first_name,last_name,avatar'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($reviews->map->toArray()->values());
    }

    // GET /api/reviews/user/{userId}
    // Profile.jsx — worker's received reviews
    public function getByUser(int $userId): JsonResponse
    {
        $reviews = Review::where('reviewee_id', $userId)
            ->with(['reviewer:id,first_name,last_name,avatar', 'task:id,title'])
            ->orderByDesc('created_at')
            ->get();

        $avg = $reviews->avg('rating') ?? 0;

        return response()->json([
            'reviews'       => $reviews->map->toArray()->values(),
            'averageRating' => round($avg, 1),
            'totalReviews'  => $reviews->count(),
        ]);
    }

    // POST /api/reviews
    // reviewsSlice: createReview({ taskId, revieweeId, rating, comment })
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'taskId'     => 'required|integer|exists:tasks,id',
            'revieweeId' => 'required|integer|exists:users,id',
            'rating'     => 'required|integer|min:1|max:5',
            'comment'    => 'nullable|string|max:1000',
        ]);

        $task = Task::findOrFail($request->taskId);

        // Only allow review on completed tasks
        if ($task->status !== 'completed') {
            return response()->json(['message' => 'Can only review completed tasks'], 422);
        }

        // Only client (task owner) or worker can review
        $userId = auth('api')->id();
        if ($task->client_id !== $userId && $task->worker_id !== $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Prevent duplicate reviews
        $exists = Review::where('task_id', $request->taskId)
            ->where('reviewer_id', $userId)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'You have already reviewed this task'], 422);
        }

        $review = Review::create([
            'task_id'     => $request->taskId,
            'reviewer_id' => $userId,
            'reviewee_id' => $request->revieweeId,
            'rating'      => $request->rating,
            'comment'     => $request->comment,
        ]);

        return response()->json($review->load('reviewer:id,first_name,last_name,avatar')->toArray(), 201);
    }
}