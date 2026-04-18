<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SavedTaskController;

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

/*
|--------------------------------------------------------------------------
| Protected routes (JWT — auth:api)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:api')->group(function () {

    // Auth utilities
    Route::prefix('auth')->group(function () {
        Route::post('/logout',  [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::get('/me',       [AuthController::class, 'me']);
    });

    // Users — static قبل {userId}
    Route::get('/users/workers',  [UserController::class, 'getWorkers']);
    Route::get('/users',          [UserController::class, 'index']);
    Route::get('/users/{userId}', [UserController::class, 'show']);
    Route::put('/users/{userId}', [UserController::class, 'update']);

    // Tasks — static قبل {taskId}
    Route::get('/tasks/published',         [TaskController::class, 'getPublished']);
    Route::get('/tasks/client/{clientId}', [TaskController::class, 'getByClient']);
    Route::get('/tasks/worker/{workerId}', [TaskController::class, 'getByWorker']);
    Route::get('/tasks',                   [TaskController::class, 'index']);
    Route::post('/tasks',                  [TaskController::class, 'store']);
    Route::get('/tasks/{taskId}',          [TaskController::class, 'show']);
    Route::put('/tasks/{taskId}',          [TaskController::class, 'update']);
    Route::delete('/tasks/{taskId}',       [TaskController::class, 'destroy']);

    Route::post('/tasks/{taskId}/assign',      [TaskController::class, 'assignWorker']);
    Route::get('/tasks/{taskId}/comments',     [TaskController::class, 'getComments']);
    Route::post('/tasks/{taskId}/comments',    [TaskController::class, 'addComment']);
    Route::get('/tasks/{taskId}/applications', [ApplicationController::class, 'getByTask']);
    Route::get('/tasks/{taskId}/reviews',      [ReviewController::class, 'getByTask']);

    // Applications
    Route::get('/applications/worker/{workerId}',        [ApplicationController::class, 'getByWorker']);
    Route::get('/applications',                          [ApplicationController::class, 'index']);
    Route::post('/applications',                         [ApplicationController::class, 'store']);
    Route::patch('/applications/{applicationId}/status', [ApplicationController::class, 'updateStatus']);

    // Messages — static قبل {conversationId}
    Route::post('/messages/conversations',         [MessageController::class, 'getOrCreateConversation']);
    Route::get('/messages/conversations/{userId}', [MessageController::class, 'getConversations']);
    Route::get('/messages/{conversationId}',       [MessageController::class, 'getMessages']);
    Route::post('/messages',                       [MessageController::class, 'sendMessage']);
    Route::patch('/messages/{conversationId}/read',[MessageController::class, 'markAsRead']);

    // Reviews
    Route::get('/reviews/user/{userId}', [ReviewController::class, 'getByUser']);
    Route::get('/reviews',               [ReviewController::class, 'index']);
    Route::post('/reviews',              [ReviewController::class, 'store']);
    // SavedTasks

    Route::get('/saved-tasks',             [SavedTaskController::class, 'index']);
    Route::post('/saved-tasks',            [SavedTaskController::class, 'store']);
    Route::delete('/saved-tasks/{task}',   [SavedTaskController::class, 'destroy']);
});