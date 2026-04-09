<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    // ── GET /api/users ────────────────────────────────────────────────────────
    // Admin only

    public function index(): JsonResponse
    {
        $this->authorizeAdmin();
        return response()->json(User::all()->map->toArray()->values());
    }

    // ── GET /api/users/workers ────────────────────────────────────────────────
    // Workers.jsx — clients browse available workers

    public function getWorkers(): JsonResponse
    {
        $workers = User::where('role', 'worker')->get()->map->toArray();
        return response()->json($workers->values());
    }

    // ── GET /api/users/{userId} ───────────────────────────────────────────────

    public function show(int $userId): JsonResponse
    {
        $user = User::findOrFail($userId);
        return response()->json($user->toArray());
    }

    // ── PUT /api/users/{userId} ───────────────────────────────────────────────
    // EditProfile.jsx — firstName, lastName, email, phone, location

    public function update(Request $request, int $userId): JsonResponse
    {
        $user = User::findOrFail($userId);

        // Only the owner or admin may update
        if (auth('api')->id() !== $userId && auth('api')->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $v = Validator::make($request->all(), [
            'firstName' => 'sometimes|string|max:100',
            'lastName'  => 'sometimes|string|max:100',
            'email'     => 'sometimes|email|unique:users,email,' . $userId,
            'phone'     => 'sometimes|nullable|string|max:30',
            'location'  => 'sometimes|nullable|string|max:200',
            'skills'    => 'sometimes|nullable|array',
            'skills.*'  => 'string|max:100',
            'password'  => 'sometimes|string|min:6',
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        $data = [];
        if ($request->has('firstName')) $data['first_name'] = $request->firstName;
        if ($request->has('lastName'))  $data['last_name']  = $request->lastName;
        if ($request->has('email'))     $data['email']      = $request->email;
        if ($request->has('phone'))     $data['phone']      = $request->phone;
        if ($request->has('location'))  $data['location']   = $request->location;
        if ($request->has('skills'))    $data['skills']     = $request->skills;
        if ($request->has('password'))  $data['password']   = Hash::make($request->password);

        $user->update($data);

        return response()->json($user->fresh()->toArray());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function authorizeAdmin(): void
    {
        if (auth('api')->user()->role !== 'admin') {
            abort(403, 'Admin only');
        }
    }
}