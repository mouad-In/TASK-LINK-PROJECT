<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    // POST /api/messages/conversations
    // messagesSlice: getOrCreateConversation(participant1Id, participant2Id)
    public function getOrCreateConversation(Request $request): JsonResponse
    {
        $request->validate([
            'participant1Id' => 'required|integer|exists:users,id',
            'participant2Id' => 'required|integer|exists:users,id',
        ]);

        $p1 = min($request->participant1Id, $request->participant2Id);
        $p2 = max($request->participant1Id, $request->participant2Id);

        $conversation = Conversation::firstOrCreate(
            ['participant1_id' => $p1, 'participant2_id' => $p2]
        );

        return response()->json($this->formatConversation($conversation, auth('api')->id()));
    }

    // GET /api/messages/conversations/{userId}
    // Messages.jsx: load all conversations for sidebar
    public function getConversations(int $userId): JsonResponse
    {
        // Only the authenticated user can fetch their own conversations
        if (auth('api')->id() !== $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $conversations = Conversation::where('participant1_id', $userId)
            ->orWhere('participant2_id', $userId)
            ->with(['participant1:id,first_name,last_name,avatar', 'participant2:id,first_name,last_name,avatar'])
            ->orderByDesc('last_message_time')
            ->get();

        $formatted = $conversations->map(fn($c) => $this->formatConversation($c, $userId));

        return response()->json($formatted);
    }

    // GET /api/messages/{conversationId}
    // Messages.jsx: load all messages in a conversation
    public function getMessages(int $conversationId): JsonResponse
    {
        $conversation = Conversation::findOrFail($conversationId);
        $userId = auth('api')->id();

        if ($conversation->participant1_id !== $userId && $conversation->participant2_id !== $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $messages = Message::where('conversation_id', $conversationId)
            ->orderBy('created_at')
            ->get();

        return response()->json($messages->map->toArray()->values());
    }

    // POST /api/messages
    // messagesSlice: sendMessage({ conversationId, content })
    public function sendMessage(Request $request): JsonResponse
    {
        $request->validate([
            'conversationId' => 'required|integer|exists:conversations,id',
            'content'        => 'required|string|max:5000',
        ]);

        $conversation = Conversation::findOrFail($request->conversationId);
        $userId = auth('api')->id();

        if ($conversation->participant1_id !== $userId && $conversation->participant2_id !== $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $message = Message::create([
            'conversation_id' => $request->conversationId,
            'sender_id'       => $userId,
            'content'         => $request->content,
            'is_read'         => false,
        ]);

        // Update conversation cache
        $conversation->update([
            'last_message'      => $request->content,
            'last_message_time' => now(),
        ]);

        return response()->json($message->toArray(), 201);
    }

    // PATCH /api/messages/{conversationId}/read
    // messagesSlice: markAsRead(conversationId)
    public function markAsRead(int $conversationId): JsonResponse
    {
        $conversation = Conversation::findOrFail($conversationId);
        $userId = auth('api')->id();

        if ($conversation->participant1_id !== $userId && $conversation->participant2_id !== $userId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Marked as read']);
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private function formatConversation(Conversation $c, int $authUserId): array
    {
        $data = $c->toArray();

        // Determine the other participant
        $isP1      = $c->participant1_id === $authUserId;
        $other     = $isP1 ? $c->participant2 : $c->participant1;

        if ($other) {
            $data['participantName']   = trim($other->first_name . ' ' . $other->last_name);
            $data['participantAvatar'] = $other->avatar ?? null;
            $data['participantId']     = $other->id;
        }

        // Unread count — messages sent by the other person that this user hasn't read
        $data['unreadCount'] = Message::where('conversation_id', $c->id)
            ->where('sender_id', '!=', $authUserId)
            ->where('is_read', false)
            ->count();

        return $data;
    }
}