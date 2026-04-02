<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api')->except(['login', 'register']);
    }

    /**
     * POST /auth/login
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $token = auth('api')->attempt($request->only('email', 'password'));

        if (!$token) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        return $this->respondWithToken($token);
    }

    /**
     * POST /auth/register
     * React يبعث: firstName, lastName, email, phone, location, password, role
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName'  => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email',
            'password'  => 'required|string|min:6',
            'phone'     => 'sometimes|string|max:20',
            'location'  => 'sometimes|string|max:255',
            'role'      => 'sometimes|in:client,worker,admin',
        ]);

        $user = User::create([
            'name'     => $request->firstName . ' ' . $request->lastName,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'phone'    => $request->phone,
            'location' => $request->location,
            'role'     => $request->role ?? 'client',
        ]);

        $token = auth('api')->login($user);

        return $this->respondWithToken($token, 201);
    }

    /**
     * POST /auth/logout
     */
    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * POST /auth/refresh
     */
    public function refresh(): JsonResponse
    {
        return $this->respondWithToken(auth('api')->refresh());
    }

    /**
     * GET /auth/me
     */
    public function me(): JsonResponse
    {
        return response()->json(auth('api')->user());
    }

    private function respondWithToken(string $token, int $status = 200): JsonResponse
    {
        return response()->json([
            'user'         => auth('api')->user(),
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'expires_in'   => auth('api')->factory()->getTTL() * 60,
        ], $status);
    }
}