<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    private function userResponse(mixed $user, string $token): array
    {
        return array_merge($user->toArray(), [
            'token'    => $token,
            'userType' => $user->role,   // ✅ أضف userType = role
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'firstName' => 'required|string|max:100',
            'lastName'  => 'required|string|max:100',
            'email'     => 'required|email|unique:users,email',
            'password'  => 'required|string|min:6',
            'role'      => 'required|in:client,worker',
            'phone'     => 'nullable|string|max:30',
            'location'  => 'nullable|string|max:200',
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        $user = User::create([
            'first_name' => $request->firstName,
            'last_name'  => $request->lastName,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
            'role'       => $request->role,
            'phone'      => $request->phone,
            'location'   => $request->location,
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json($this->userResponse($user, $token), 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = auth('api')->user();

        return response()->json($this->userResponse($user, $token));
    }

    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return response()->json(['message' => 'Logged out']);
    }

    public function refresh(): JsonResponse
    {
        $token = auth('api')->refresh();
        $user  = auth('api')->user();

        return response()->json($this->userResponse($user, $token));
    }

    public function me(): JsonResponse
    {
        $user = auth('api')->user();

        return response()->json(array_merge($user->toArray(), [
            'userType' => $user->role,   // ✅ أضف userType هنا أيضاً
        ]));
    }
}